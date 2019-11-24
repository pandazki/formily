import React, { useRef, useLayoutEffect } from 'react'
import { createControllerBox } from '@uform/react-schema-renderer'
import { IFormTextBox } from '../types'
import { toArr } from '@uform/shared'
import { CompatAntdFormItem } from '../compat/FormItem'
import styled from 'styled-components'

export const FormTextBox = createControllerBox<IFormTextBox>(
  'text-box',
  styled(({ props, className, children }) => {
    const {
      title,
      help,
      text,
      name,
      extra,
      gutter,
      style,
      ...componentProps
    } = Object.assign(
      {
        gutter: 5
      },
      props['x-component-props']
    )
    const ref: React.RefObject<HTMLDivElement> = useRef()
    const arrChildren = toArr(children)
    const split = text.split('%s')
    let index = 0
    useLayoutEffect(() => {
      if (ref.current) {
        const elements = ref.current.querySelectorAll('.text-box-field')
        const syncLayouts = Array.prototype.map.call(
          elements,
          (el: HTMLElement) => {
            return [
              el,
              () => {
                const ctrl = el.querySelector(
                  '.ant-form-item-control:first-child'
                )
                if (ctrl) {
                  el.style.width = ctrl.getBoundingClientRect().width + 'px'
                }
              }
            ]
          }
        )
        syncLayouts.forEach(([el, handler]) => {
          el.addEventListener('DOMSubtreeModified', handler)
        })

        return () => {
          syncLayouts.forEach(([el, handler]) => {
            el.removeEventListener('DOMSubtreeModified', handler)
          })
        }
      }
    }, [])
    const newChildren = split.reduce((buf, item, key) => {
      return buf.concat(
        item ? (
          <p
            key={index++}
            className="text-box-words"
            style={{
              marginRight: gutter / 2,
              marginLeft: gutter / 2,
              ...style
            }}
          >
            {item}
          </p>
        ) : null,
        arrChildren[key] ? (
          <div key={index++} className="text-box-field">
            {arrChildren[key]}
          </div>
        ) : null
      )
    }, [])

    const textChildren = (
      <div
        className={className}
        style={{
          marginRight: -gutter / 2,
          marginLeft: -gutter / 2
        }}
        ref={ref}
      >
        {newChildren}
      </div>
    )

    if (!title) return textChildren

    return (
      <CompatAntdFormItem
        {...componentProps}
        label={title}
        help={help}
        extra={extra}
      >
        {textChildren}
      </CompatAntdFormItem>
    )
  })`
    display: flex;
    .text-box-words:nth-child(1) {
      margin-left: 0;
    }
    .text-box-field {
      display: inline-block;
    }
    .next-form-item {
      margin-bottom: 0 !important;
    }
    .preview-text {
      text-align: center !important;
    }
  `
)
