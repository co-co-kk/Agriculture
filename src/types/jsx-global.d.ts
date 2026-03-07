// 该文件用于兼容 JSX.Element 返回类型声明，避免不同 TS 版本下命名空间缺失。
import type { JSX as ReactJSX } from 'react'

declare global {
  namespace JSX {
    type Element = ReactJSX.Element
    type IntrinsicElements = ReactJSX.IntrinsicElements
  }
}

export {}
