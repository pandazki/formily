import {
  IFormOption,
  ISchema,
  ISormComponents,
  IMixin,
  IFieldProps,
  IFormProps,
  ISchemaPareserResult,
  ISupportedFormItem,
  IAPP,
  IFieldGroupProps,
  IValidate,
  IExporession
} from './Share'

import { createForm, IForm, LifeCycleTypes } from '@uform/core'

import SelectorCore from 'selector-core'
import ExpressionRun from "expression-run"
import _get from 'lodash.get'

enum CustomEventName {
  ValidatedError = "validatedError",
  SromRest = 'sormReset'
}


const Supported: ISupportedFormItem = {
  input: true,
  textarea: true,
  radio: true,
  radioGroup: true,
  checkbox: true,
  checkboxGroup: true,
  switch: true,
  slider: true,
  pickerView: true,
  picker: true,
  view: true,
  cascade: true,
  "image-upload": true,
  "date-picker": true,
  "radio-group": true,
  "checkbox-group": true,
  "picker-view": true,
} as ISupportedFormItem

class Sorm {
  constructor() { }
  public init() {
    this.core = createForm({
      onChange: (values: any) => {
        console.log(values)
      },
      //表单提交事件回调
      onSubmit: (values: any) => {

      },
      //表单重置事件回调
      onReset: () => {

      },
      //表单校验失败事件回调
      onValidateFailed: (validated: any) => {
      }
    })
  }
  private initValue: any
  private core: IForm
  private _schema: ISchema
  private parseExpressions(props: object): Array<IExporession> {
    let linkages = []
    // 花括号
    let checkBrace = /^\{\{(.*?)\}\}$/
    // root.value
    let checkRoot = /root\.value\.(\S*)/g
    Object.keys(props).forEach((target) => {
      let deps: Array<string> = []
      let expression = {}
      let value = props[target]
      if (checkBrace.test(value) && checkRoot.test(value)) {
        let exp = value.replace(checkBrace, "$1")
        exp.replace(/root\.value\.([a-zA-Z]*)/g, (m: any, a = "") => {
          let [name = ""] = a.split(".")
          if (deps) {
            deps.push(name)
          }
        })
        if (deps.length > 0) {
          linkages.push({
            exp,
            deps,
            target: target
          })
        }

      }
    })

    return linkages
  }
  private schemaParser(schema: ISchema, parentKey?: string): Array<ISormComponents> {
    let { properties = {} } = schema
    let keys: Array<string> = Object.keys(properties)
    return keys.map((keyName, index) => {
      let componentSchemaDesc = properties[keyName]
      let thisKey = parentKey ? parentKey + '.' + keyName : keyName
      let {
        type: formType,
        title: label,
        "x-component": cname = "view",
        "x-component-props": cprops = {},
        "x-props": fieldProps,
        "x-rules": rules,
        properties: childrenSchema
      } = componentSchemaDesc
      cprops.visible = cprops.visible === void (0) ? true : cprops.visible
      let linkages = this.parseExpressions(cprops)
      let required = false

      let field = this.core.registerField({
        name: thisKey,
        initialValue: cprops.value,
        value: cprops.value,
        rules: rules
      })
      field.getState((state: { required: boolean }) => {
        required = state.required
      })

      cname = cname.toLocaleLowerCase()
      return {
        _supported: Supported[cname],
        component: {
          name: cname,
          props: cprops,
        },
        linkages,
        required,
        hooks: [],
        listening: [],
        keyName: thisKey,
        label,
        formType,
        fieldProps,
        childrends: this.schemaParser(componentSchemaDesc, parentKey),
        getFormCore: () => {
          return this.getCore()
        },
      }
    })
  }
  /**
   * getValues
   */
  public getValues() {
    return this.initValue
  }
  public getCore() {
    return this.core
  }
  parse(schema: ISchema): Array<ISormComponents> {
    this._schema = schema
    return this.schemaParser(schema)
  }
}

const InitForm = function (ref: IMixin<IFormProps>) {
  let {
    schema,
    style,
    class: className,
    onSubmit
  } = ref.props
  let { sorm } = ref
  sorm.init()
  let formCore = sorm.getCore()
  let components = sorm.parse(schema)
  ref.setData({
    schema: components,
    style,
    className,
    uiKey: Date.now().toString(32),
    useButton: !!onSubmit,
    submit: () => {
      ref.submit()
    },
    reset: () => {
      ref.reset()
    },
    getValues: async () => {
      return new Promise((resolve, reject) => {
        sorm.getCore().getFormState((state: any[]) => {
          resolve(state.values)
        })
      })
    }
  })
}

export function getFormMixins() {
  let sorm = new Sorm()
  return [{
    onInit() {
      this.sorm = sorm
    },
    deriveDataFromProps(props: IFormOption) {
      InitForm(this)
    },
    methods: {
      reset() {
        InitForm(this)
        this.init = true
      },
      submit() {
        let core = sorm.getCore()
        let { onSubmit, onError } = this.props

        core.submit((res: any) => {
          onSubmit && onSubmit(res)
        }).catch((err: any) => {
          core.notify(CustomEventName.ValidatedError, err)
          onError && onError(err)
        })
      }
    } as IAPP
  } as IMixin<IFormProps>]
}

const selfValidate = async function (validate: IValidate) {
  let res: { errors: any }
  try {
    res = await validate()

  } catch (error) {
    console.error(error)
    res = error
  }
  let { errors = [] } = res
  let errData = errors[0] || { messages: [] }
  let isError = res.errors.length > 0
  return {
    isError,
    errors: errData.messages
  }

}

const runCondition = function (condition: string, value: object): any {
  return ExpressionRun(condition, { root: { value } })
}
const updateProps = async (core: { getFormState: (arg0: ({ values }: { values: any }) => void) => void }, linkages: any[], depsName?: string): Promise<{ [key: string]: any }> => {
  return new Promise((resolve, reject) => {
    if (linkages.length > 0) {
      let state: { [key: string]: any } | PromiseLike<{ [key: string]: any }>
      core.getFormState(({ values }) => {
        linkages
          .filter((v: { deps: string | string[] }) => depsName ? v.deps.indexOf(depsName) > -1 : true)
          .map((exporession: { exp: string; target: string }) => {
            let result = runCondition(exporession.exp, values)
            if (!state) state = {}
            state["cprops." + exporession.target] = result
          })
        // this.setData(state)
        state && resolve(state)
      })
    } else {
      reject(false)
    }
  })

}
export function getFieldMixins() {
  return [{
    async onInit() {
      let {
        component,
        getFormCore,
        keyName,
        linkages
      } = this.props
      let core = getFormCore()

      core.subscribe(({
        type,
        payload
      }) => {

        switch (type) {
          // 验证失败
          case CustomEventName.ValidatedError:
            {
              let [{ path = "", messages = [] } = {}] = (payload || []).filter((v: { path: string }) => v.path === keyName)
              if (path) {
                this.setData({
                  isError: true,
                  errors: messages,
                })
              }
            }
            break;
          // 值重设
          case CustomEventName.SromRest:
            {
              let uiValue = (payload || {})[keyName] || ""
              this.setData({
                isError: false,
                errors: [],
                uiValue,
                fieldKey: keyName + Date.now()
              })
            }
            break;
          case LifeCycleTypes.ON_FORM_CHANGE:
            {
              let name = ((payload || {}).state || {}).name
              updateProps(core, linkages, name).then(state => {
                this.setData({
                  ...state,
                  fieldKey: keyName + Date.now()
                })
              }).catch(() => { })
            }
            break;
          default:
            break;
        }
      })
      let cprops = {}
      try {
        cprops = await updateProps(core, linkages)
      } catch (e) { }
      this.setData({
        uiValue: component.props.value,
        fieldKey: keyName + Date.now(),
        cname: component.name,
        cprops: component.props,
        ...cprops
      })

    },
    methods: {
      async onChange(e: { detail: { value: any }; value: any }) {
        let {
          getFormCore,
          keyName,
          validate,
        } = this.props
        let value = e.detail ? e.detail.value : e.value
        let core = getFormCore()
        // setFieldValue(value)
        core.setFieldValue(keyName, value)
        let res = await selfValidate(async () => {
          return await core.validate(keyName)
        })
        this.setData({
          uiValue: value,
          ...res
        })
      },
      onBlur(e: any) { },
      onFocus(e: any) { },
      onConfirm(e: any) { },
      onChanging(e: any) { }
    } as IAPP
  } as IMixin<IFieldProps>]
}

const SelectorOninit = function (this: IAPP) {
  let { dataSource, value } = this.props.props
  let selector = new SelectorCore(dataSource, [{ value, label: value }])
  selector.mixValueFromDataSource()
  let thisValue = selector.getValues()[0] || { value: undefined }
  let _dataSource = selector.getDataSource()
  this.setData({
    dataSource: _dataSource,
    value: thisValue.value,
    indexValue: (_dataSource.find(v => v.value === thisValue.value) || { indexValue: 0 }).indexValue
  })
  this.selector = selector
}

export function getFieldGroupMixin() {
  return [{
    onInit: SelectorOninit,
    methods: {
      onChange(e: any) {
        let value = _get(e, "detail.value", undefined)
        let indexValue = value
        let tagName = _get(e, "target.tagName", "")
        let selector: SelectorCore = this.selector
        if (tagName === "picker") {
          let source = selector.getDataSource()[value]
          value = selector.clean(source).value
        }
        this.selector.change([{ value, label: "" }], "single")
        this.selector.mixValueFromDataSource()
        this.setData({
          value,
          indexValue,
          dataSource: selector.getDataSource(),
        })
        this.props.onChange && this.props.onChange({ value })
      }
    } as IAPP
  } as IMixin<IFieldGroupProps<string>>]
}

// 多选多
export function getFieldGroupArrayMixin() {
  return [{
    onInit() {
      let { dataSource, value } = this.props.props
      let selector = new SelectorCore(dataSource, value.map(v => {
        return { value: v, label: v }
      }))
      selector.mixValueFromDataSource()
      this.setData({
        value,
        dataSource: selector.getDataSource()
      })
      this.selector = selector
    },
    methods: {
      onChange(e: any) {
        let value = _get(e, "detail.value", [])
        let selector: SelectorCore = this.selector
        selector.initValues(value.map((v: any) => {
          return { value: v, label: v }
        }))

        this.setData({
          value,
          dataSource: selector.getDataSource()
        })
        this.props.onChange && this.props.onChange({ value })
      }
    } as IAPP
  } as IMixin<IFieldGroupProps<Array<any>>>]
}
