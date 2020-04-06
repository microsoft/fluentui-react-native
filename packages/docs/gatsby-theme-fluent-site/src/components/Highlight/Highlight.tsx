import * as React from 'react'
import Highlight, { defaultProps } from 'prism-react-renderer'
import darkTheme from 'prism-react-renderer/themes/nightOwl'

export const HighlightHOC = p => {
  return (
    <Highlight {...defaultProps} theme={darkTheme} code={p.children} language="jsx">
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <div className={className} style={style}>
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </div>
      )}
    </Highlight>
  )
}
