# 理解表单布局

`FormMegaLayout` 是下一代的 **Formily** 表单布局，基于表单组件维度，到整体维度都有相应的设计标准指导。
查看这些设计了解更多：[单字段布局能力](https://img.alicdn.com/tfs/TB1N2xIC8r0gK0jSZFnXXbRRXXa-1090-876.png)，[静态布局场景](https://img.alicdn.com/tfs/TB1vwlFCYj1gK0jSZFuXXcrHpXa-1090-1231.png)，[响应式布局场景](https://img.alicdn.com/tfs/TB1qjRyC.H1gK0jSZSyXXXtlpXa-1090-1231.png)

下面会通过一些实际例子来理解有哪些能力：

## 单字段布局能力

### label 对齐方式

| 字段名     | 描述           | 类型                   | 默认值  |
| :--------- | :------------- | :--------------------- | :------ |
| labelAlign | label 对齐方式 | `left`, `right`, `top` | `right` |

```jsx
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import {
  SchemaForm,
  FormItem,
  FormSlot,
  SchemaMarkupField as Field,
  FormButtonGroup,
  createFormActions,
  Submit,
  Reset,
  registerFormItemComponent,
} from '@formily/next' // 或者 @formily/next
import styled, { css } from 'styled-components'
import { FormMegaLayout, Input, DatePicker } from '@formily/next-components'
import Printer from '@formily/printer'

import '@alifd/next/dist/next.css'

const NewFormItem = (props) => <FormItem {...props} />

registerFormItemComponent(NewFormItem);

const App = () => {
  return (
    <Printer>
      <SchemaForm components={{ DatePicker, Input }}>
        {/* <FormSlot>
          <h5 style={{ marginTop: '16px' }}>label右对齐（默认）</h5>
        </FormSlot> */}
        {/* <FormMegaLayout labelCol={4}> */}
        <Field name="alignLeft" title="标题" x-component="DatePicker" />
        {/* </FormMegaLayout> */}

        {/* <FormSlot>
          <h5 style={{ marginTop: '16px' }}>label左对齐</h5>
        </FormSlot>
        <FormMegaLayout labelCol={4} labelAlign="left">
          <Field name="alignRight" title="标题" x-component="DatePicker" />
        </FormMegaLayout>

        <FormSlot>
          <h5 style={{ marginTop: '16px' }}>label在顶部</h5>
        </FormSlot>
        <FormMegaLayout labelAlign="top">
          <Field name="alignTop" title="标题" x-component="DatePicker" />
        </FormMegaLayout> */}
      </SchemaForm>
    </Printer>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
```