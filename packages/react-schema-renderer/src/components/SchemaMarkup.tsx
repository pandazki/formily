import React, { Fragment, createContext, useContext, useMemo } from 'react'
import { isFn, lowercase } from '@formily/shared'
import { registerVirtualBox, registerPreRunBox, getRegistry } from '../shared/registry'
import { SchemaForm } from './SchemaForm'
import { Schema } from '../shared/schema'
import { render } from '../shared/virtual-render'
import {
  ISchemaFormProps,
  IMarkupSchemaFieldProps,
  ISchemaVirtualFieldComponentProps,
  IVirtualBoxProps
} from '../types'

const env = {
  nonameId: 0,
  preRunNonameId: 0,
  preRun: false,
}

export const MarkupContext = createContext<Schema>(null)

const getRandomName = () => {
  const idx = env.preRun ? '_PRE_' + (env.preRunNonameId++) : env.nonameId++
  return `NO_NAME_FIELD_$${idx}`
}

export const SchemaMarkupField: React.FC<IMarkupSchemaFieldProps> = ({
  children,
  ...props
}) => {
  const parentSchema = useContext(MarkupContext)
  if (!parentSchema) return <Fragment />
  if (parentSchema.isObject()) {
    props.name = props.name || getRandomName()
    const { preRunFields } = getRegistry()
    const preRunSchema = props['x-component'] && preRunFields[lowercase(props['x-component'])]
    const schema = parentSchema.setProperty(props.name, props)
    if (preRunSchema) {
      schema.setProperties(preRunSchema.properties)
    }
    return (
      <MarkupContext.Provider value={schema}>{children}</MarkupContext.Provider>
    )
  } else if (parentSchema.isArray()) {
    const schema = parentSchema.setArrayItems(props)
    return (
      <MarkupContext.Provider value={schema}>{children}</MarkupContext.Provider>
    )
  } else {
    return (children as React.ReactElement) || <React.Fragment />
  }
}

SchemaMarkupField.displayName = 'SchemaMarkupField'


const PreRenderTrigger = (props) => {
  const { schema, afterRun } = props
  const finalSchema = useMemo(() => {
    return new Schema(schema)
  }, [schema])

  afterRun(finalSchema)
  return <div />
}

export const PreRunSchema: React.FC<any> = (props) => {
  const { afterRun } = props
  let alreadyHasSchema = false
  env.preRun = true
  let finalSchema: Schema
  if (props.schema) {
    alreadyHasSchema = true
    env.preRun = false
    finalSchema = new Schema(props.schema)
  } else {
    finalSchema = new Schema({ type: 'object' })
  }

  return (
    <Fragment>
      {!alreadyHasSchema &&
        render(
          <MarkupContext.Provider value={finalSchema}>
            {props.children}
          </MarkupContext.Provider>
      )}
      <PreRenderTrigger schema={finalSchema} afterRun={() => {
        env.preRun = false
        afterRun(finalSchema)
      }} />
    </Fragment>
  )
}


// 注册预编译组件
// 1. 可以使用内置组件，各种field或VirtualField（支持嵌套预编译组件）
// 2. 提前跑schema解析流程，写入全局变量
export function registerFormFragment(
  name: string,
  component: any
) {
  if (
    name &&
    (isFn(component) || typeof component.styledComponentId === 'string')
  ) {
    name = lowercase(name)
    registerVirtualBox(name, component ? component : () => <Fragment />)
    // 在这里生成schema片段
    let tmpElement = document.createElement('div')
    require('react-dom').render(<PreRunSchema afterRun={(schema) => {
      registerPreRunBox(name, schema)
      require('react-dom').unmountComponentAtNode(tmpElement) // unmount
    }}>
      {component({ preRun: true })}
    </PreRunSchema>, tmpElement)
  }
}

export const SchemaMarkupForm: React.FC<ISchemaFormProps> = props => {
  let alreadyHasSchema = false
  let finalSchema: Schema
  if (props.schema) {
    alreadyHasSchema = true
    finalSchema = new Schema(props.schema)
  } else {
    finalSchema = new Schema({ type: 'object' })
  }
  env.nonameId = 0
  return (
    <Fragment>
      {!alreadyHasSchema &&
        render(
          <MarkupContext.Provider value={finalSchema}>
            {props.children}
          </MarkupContext.Provider>
        )}
      <SchemaForm {...props} schema={finalSchema} />
    </Fragment>
  )
}

SchemaMarkupForm.displayName = 'SchemaMarkupForm'

export function createVirtualBox<T = {}>(
  key: string,
  component?: React.JSXElementConstructor<any>
) {
  registerVirtualBox(
    key,
    component
      ? ({ schema, children }) => {
          const props = schema.getExtendsComponentProps()
          return React.createElement(component, {
            children,
            ...props
          })
        }
      : () => <Fragment />
  )
  const VirtualBox: React.FC<IVirtualBoxProps<T>> = ({
    children,
    name,
    visible,
    display,
    ...props
  }) => {
    return (
      <SchemaMarkupField
        type="object"
        name={name}
        visible={visible}
        display={display}
        x-component={key}
        x-component-props={props}
      >
        {children}
      </SchemaMarkupField>
    )
  }
  return VirtualBox
}

export function createControllerBox<T = {}>(
  key: string,
  component?: React.JSXElementConstructor<ISchemaVirtualFieldComponentProps>
) {
  registerVirtualBox(key, component ? component : () => <Fragment />)
  const VirtualBox: React.FC<IVirtualBoxProps<T>> = ({
    children,
    name,
    ...props
  }) => {
    return (
      <SchemaMarkupField
        type="object"
        name={name}
        x-component={key}
        x-component-props={props}
      >
        {children}
      </SchemaMarkupField>
    )
  }
  return VirtualBox
}

export const FormSlot: React.FC<{
  name?: string
  children?: React.ReactElement
}> = ({ name, children }) => {
  return (
    <SchemaMarkupField
      type="object"
      name={name}
      x-render={() => {
        return <Fragment>{children}</Fragment>
      }}
    />
  )
}
