function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

import { createForm, LifeCycleTypes } from '@uform/core';
import SelectorCore from 'selector-core';
import ExpressionRun from "expression-run";
import _get from 'lodash.get';
var CustomEventName;

(function (CustomEventName) {
  CustomEventName["ValidatedError"] = "validatedError";
  CustomEventName["SromRest"] = "sormReset";
})(CustomEventName || (CustomEventName = {}));

var Supported = {
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
  "picker-view": true
};

class Sorm {
  constructor() {}

  init() {
    this.core = createForm({
      onChange: values => {
        console.log(values);
      },
      //表单提交事件回调
      onSubmit: values => {},
      //表单重置事件回调
      onReset: () => {},
      //表单校验失败事件回调
      onValidateFailed: validated => {}
    });
  }

  parseExpressions(props) {
    var linkages = []; // 花括号

    var checkBrace = /^\{\{(.*?)\}\}$/; // root.value

    var checkRoot = /root\.value\.(\S*)/g;
    Object.keys(props).forEach(target => {
      var deps = [];
      var expression = {};
      var value = props[target];

      if (checkBrace.test(value) && checkRoot.test(value)) {
        var exp = value.replace(checkBrace, "$1");
        exp.replace(/root\.value\.([a-zA-Z]*)/g, function (m, a) {
          if (a === void 0) {
            a = "";
          }

          var [name = ""] = a.split(".");

          if (deps) {
            deps.push(name);
          }
        });

        if (deps.length > 0) {
          linkages.push({
            exp,
            deps,
            target: target
          });
        }
      }
    });
    return linkages;
  }

  schemaParser(schema, parentKey) {
    var {
      properties = {}
    } = schema;
    var keys = Object.keys(properties);
    return keys.map((keyName, index) => {
      var componentSchemaDesc = properties[keyName];
      var thisKey = parentKey ? parentKey + '.' + keyName : keyName;
      var {
        type: formType,
        title: label,
        "x-component": cname = "view",
        "x-component-props": cprops = {},
        "x-props": fieldProps,
        "x-rules": rules,
        properties: childrenSchema
      } = componentSchemaDesc;
      cprops.visible = cprops.visible === void 0 ? true : cprops.visible;
      var linkages = this.parseExpressions(cprops);
      var required = false;
      var field = this.core.registerField({
        name: thisKey,
        initialValue: cprops.value,
        value: cprops.value,
        rules: rules
      });
      field.getState(state => {
        required = state.required;
      });
      cname = cname.toLocaleLowerCase();
      return {
        _supported: Supported[cname],
        component: {
          name: cname,
          props: cprops
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
          return this.getCore();
        }
      };
    });
  }
  /**
   * getValues
   */


  getValues() {
    return this.initValue;
  }

  getCore() {
    return this.core;
  }

  parse(schema) {
    this._schema = schema;
    return this.schemaParser(schema);
  }

}

var InitForm = function InitForm(ref) {
  var {
    schema,
    style,
    class: className,
    onSubmit
  } = ref.props;
  var {
    sorm
  } = ref;
  sorm.init();
  var formCore = sorm.getCore();
  var components = sorm.parse(schema);
  ref.setData({
    schema: components,
    style,
    className,
    uiKey: Date.now().toString(32),
    useButton: !!onSubmit,
    submit: () => {
      ref.submit();
    },
    reset: () => {
      ref.reset();
    },
    getValues: function () {
      var _getValues = _asyncToGenerator(function* () {
        return new Promise((resolve, reject) => {
          sorm.getCore().getFormState(state => {
            resolve(state.values);
          });
        });
      });

      function getValues() {
        return _getValues.apply(this, arguments);
      }

      return getValues;
    }()
  });
};

export function getFormMixins() {
  var sorm = new Sorm();
  return [{
    onInit() {
      this.sorm = sorm;
    },

    deriveDataFromProps(props) {
      InitForm(this);
    },

    methods: {
      reset() {
        InitForm(this);
        this.init = true;
      },

      submit() {
        var core = sorm.getCore();
        var {
          onSubmit,
          onError
        } = this.props;
        core.submit(res => {
          onSubmit && onSubmit(res);
        }).catch(err => {
          core.notify(CustomEventName.ValidatedError, err);
          onError && onError(err);
        });
      }

    }
  }];
}

var selfValidate = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (validate) {
    var res;

    try {
      res = yield validate();
    } catch (error) {
      console.error(error);
      res = error;
    }

    var {
      errors = []
    } = res;
    var errData = errors[0] || {
      messages: []
    };
    var isError = res.errors.length > 0;
    return {
      isError,
      errors: errData.messages
    };
  });

  return function selfValidate(_x) {
    return _ref.apply(this, arguments);
  };
}();

var runCondition = function runCondition(condition, value) {
  return ExpressionRun(condition, {
    root: {
      value
    }
  });
};

var updateProps = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (core, linkages, depsName) {
    return new Promise((resolve, reject) => {
      if (linkages.length > 0) {
        var state;
        core.getFormState((_ref3) => {
          var {
            values
          } = _ref3;
          linkages.filter(v => depsName ? v.deps.indexOf(depsName) > -1 : true).map(exporession => {
            var result = runCondition(exporession.exp, values);
            if (!state) state = {};
            state["cprops." + exporession.target] = result;
          }); // this.setData(state)

          state && resolve(state);
        });
      } else {
        reject(false);
      }
    });
  });

  return function updateProps(_x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

export function getFieldMixins() {
  return [{
    onInit() {
      var _this = this;

      return _asyncToGenerator(function* () {
        var {
          component,
          getFormCore,
          keyName,
          linkages
        } = _this.props;
        var core = getFormCore();
        core.subscribe((_ref4) => {
          var {
            type,
            payload
          } = _ref4;

          switch (type) {
            // 验证失败
            case CustomEventName.ValidatedError:
              {
                var [{
                  path = "",
                  messages = []
                } = {}] = (payload || []).filter(v => v.path === keyName);

                if (path) {
                  _this.setData({
                    isError: true,
                    errors: messages
                  });
                }
              }
              break;
            // 值重设

            case CustomEventName.SromRest:
              {
                var uiValue = (payload || {})[keyName] || "";

                _this.setData({
                  isError: false,
                  errors: [],
                  uiValue,
                  fieldKey: keyName + Date.now()
                });
              }
              break;

            case LifeCycleTypes.ON_FORM_CHANGE:
              {
                var name = ((payload || {}).state || {}).name;
                updateProps(core, linkages, name).then(state => {
                  _this.setData(_extends({}, state, {
                    fieldKey: keyName + Date.now()
                  }));
                }).catch(() => {});
              }
              break;

            default:
              break;
          }
        });
        var cprops = {};

        try {
          cprops = yield updateProps(core, linkages);
        } catch (e) {}

        _this.setData(_extends({
          uiValue: component.props.value,
          fieldKey: keyName + Date.now(),
          cname: component.name,
          cprops: component.props
        }, cprops));
      })();
    },

    methods: {
      onChange(e) {
        var _this2 = this;

        return _asyncToGenerator(function* () {
          var {
            getFormCore,
            keyName,
            validate
          } = _this2.props;
          var value = e.detail ? e.detail.value : e.value;
          var core = getFormCore(); // setFieldValue(value)

          core.setFieldValue(keyName, value);
          var res = yield selfValidate( /*#__PURE__*/_asyncToGenerator(function* () {
            return yield core.validate(keyName);
          }));

          _this2.setData(_extends({
            uiValue: value
          }, res));
        })();
      },

      onBlur(e) {},

      onFocus(e) {},

      onConfirm(e) {},

      onChanging(e) {}

    }
  }];
}

var SelectorOninit = function SelectorOninit() {
  var {
    dataSource,
    value
  } = this.props.props;
  var selector = new SelectorCore(dataSource, [{
    value,
    label: value
  }]);
  selector.mixValueFromDataSource();
  var thisValue = selector.getValues()[0] || {
    value: undefined
  };

  var _dataSource = selector.getDataSource();

  this.setData({
    dataSource: _dataSource,
    value: thisValue.value,
    indexValue: (_dataSource.find(v => v.value === thisValue.value) || {
      indexValue: 0
    }).indexValue
  });
  this.selector = selector;
};

export function getFieldGroupMixin() {
  return [{
    onInit: SelectorOninit,
    methods: {
      onChange(e) {
        var value = _get(e, "detail.value", undefined);

        var indexValue = value;

        var tagName = _get(e, "target.tagName", "");

        var selector = this.selector;

        if (tagName === "picker") {
          var source = selector.getDataSource()[value];
          value = selector.clean(source).value;
        }

        this.selector.change([{
          value
        }], "single");
        this.selector.mixValueFromDataSource();
        this.setData({
          value,
          indexValue,
          dataSource: selector.getDataSource()
        });
        this.props.onChange && this.props.onChange({
          value
        });
      }

    }
  }];
} // 多选多

export function getFieldGroupArrayMixin() {
  return [{
    onInit() {
      var {
        dataSource,
        value
      } = this.props.props;
      var selector = new SelectorCore(dataSource, value.map(v => {
        return {
          value: v,
          label: v
        };
      }));
      selector.mixValueFromDataSource();
      this.setData({
        value,
        dataSource: selector.getDataSource()
      });
      this.selector = selector;
    },

    methods: {
      onChange(e) {
        var value = _get(e, "detail.value", []);

        var selector = this.selector;
        selector.initValues(value.map(v => {
          return {
            value: v,
            label: v
          };
        }));
        this.setData({
          value,
          dataSource: selector.getDataSource()
        });
        this.props.onChange && this.props.onChange({
          value
        });
      }

    }
  }];
}