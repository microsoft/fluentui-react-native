import * as React from 'react'
import { css } from '@emotion/core'

interface NYIProps {
  children?: React.ReactNode
}

export const NYI = (props: NYIProps) => (
  <>
    <abbr
      css={css`
        display: inline-block;

        background-color: lightyellow;
        padding: 1px 8px 1px 8px;
        border: 1px solid orange;
        border-radius: 2px;

        color: black;
        font-size: 11px;
        font-weight: 600;
        text-decoration: none;

        cursor: default;
        user-select: none;
      `}
      title="Not Yet Implemented"
    >
      NYI
    </abbr>
    {props.children && (
      <span
        css={css`
          color: gray;
          font-style: italic;
        `}
      >
        {props.children}
      </span>
    )}
  </>
)
