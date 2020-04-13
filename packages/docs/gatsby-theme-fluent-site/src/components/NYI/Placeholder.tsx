import * as React from 'react'
import { css } from '@emotion/core'

interface PlaceholderProps {
  children?: React.ReactNode
}

export const Placeholder = (props: PlaceholderProps) => (
  <div
    css={css`
      display: flex;
      position: relative;
      height: 360px;

      color: #808080;
      background-color: #f3f2f1;
    `}
  >
    <div
      css={css`
        display: block;
        margin: auto;
      `}
    >
      {props.children}
    </div>
  </div>
)
