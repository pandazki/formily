**注册全局表单片段扩展**

表单片段逻辑自治，自定义组件也能够通过数据来描述

```jsx
import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import {
  SchemaForm,
  SchemaMarkupField as Field,
  createVirtualBox,
  VirtualField,
  registerFormFragment,
  FormButtonGroup,
  Submit,
  Reset,
  useFormEffects,
  FormEffectHooks
} from '@formily/antd' // 或者 @formily/next
import { Radio, Input } from '@formily/antd-components'
import Printer from '@formily/printer'
import 'antd/dist/antd.css'

const { onFieldValueChange$ } = FormEffectHooks

// registerFormFragment('UserFragment', (props) => {
//   console.log('=======', props)

//   const { children, schema } = props
//   if (children) {
//     useFormEffects(($, { setFieldState }) => {
//       onFieldValueChange$('user.visible').subscribe(fieldState => {
//         setFieldState('user.age', state => {
//             state.visible = fieldState.value === true
//         })
//       })
//     })
//     return children
//   }

//   return <Field name="user" type="object">
//     <Field
//       name="visible"
//       x-component="RadioGroup"
//       title="显示/隐藏"
//       enum={[
//         { label: '显示', value: true },
//         { label: '隐藏', value: false }
//       ]}
//     />
//     <Field name="username" title="username" x-component="Input" />
//     <Field name="age" title="age" x-component="Input"  />
//   </Field>
// })

// registerFormFragment('UserFragment', {
//   effects: (props) => {
//     const { schema, props } = props
//     return ($, actions) => {

//     }
//   },
//   view: <Field name="user" type="object">
//     <Field
//       name="visible"
//       x-component="RadioGroup"
//       title="显示/隐藏"
//       enum={[
//         { label: '显示', value: true },
//         { label: '隐藏', value: false }
//       ]}
//     />
//     <Field name="username" title="username" x-component="Input" />
//     <Field name="age" title="age" x-component="Input"  />
//   </Field>
// }, (Frag) => {
//   return <Frag effects={() => {
//     }}>
//     <Field name="user" type="object">
//       <Field
//         name="visible"
//         x-component="RadioGroup"
//         title="显示/隐藏"
//         enum={[
//           { label: '显示', value: true },
//           { label: '隐藏', value: false }
//         ]}
//       />
//       <Field name="username" title="username" x-component="Input" />
//       <Field name="age" title="age" x-component="Input"  />
//     </Field>
//   </Frag>
// })

const App = () => {
  const [value, setValue] = useState({})
  return (
    <Printer>
      <SchemaForm components={{ Input, RadioGroup: Radio.Group }}>
        <Field name="hello" title="hello" x-component="Input" />
        <Field
          x-component="UserFragment"
          x-component-props={{
            hello: 'world'
          }}
        />
        <FormButtonGroup>
          <Submit>提交</Submit>​ <Reset>重置</Reset>​
        </FormButtonGroup>
      </SchemaForm>
    </Printer>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
```