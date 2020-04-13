import * as React from 'react'
import styled from '@emotion/styled'
import { usePlayground } from '../context'

// TODO: monaco is throwing errors on source change. Dig into
// react-monaco-editor; potentially fork (it's a very slim wrapper)
const CodeEditor = () => {
  const MonacoEditor = useLazyMonacoEditor()
  const [playground, dispatch] = usePlayground()
  if (!MonacoEditor) {
    return <span>Loading...</span>
  }

  const example = playground.currentExample
  return (
    <MonacoEditor
      language="typescript"
      value={example.source}
      height={300}
      onChange={(value: string) => {
        dispatch({ type: 'CHANGE_CURRENT_EXAMPLE_SOURCE', payload: value })
      }}
    />
  )
}

function useLazyMonacoEditor() {
  const [monaco, setMonaco] = React.useState()
  React.useEffect(() => {
    let cancelled = false

    Promise.all([import('monaco-editor'), import('react-monaco-editor')]).then(([monaco, MonacoEditor]) => {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        jsx: monaco.languages.typescript.JsxEmit.React,
      })
      if (!cancelled) {
        setMonaco(() => MonacoEditor.default)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])
  return monaco
}

const StyledSVG = styled.svg`
  fill: currentColor;
  height: 16px;
  width: 16px;
`

export default {
  label: 'Code Editor',
  icon: (
    <StyledSVG role="presentation" focusable="false" viewBox="8 8 16 16">
      <path d="M20 20.5a.993.993 0 0 1-.65-.241.997.997 0 0 1-.108-1.409L21.683 16l-2.441-2.849a.999.999 0 1 1 1.517-1.302l3 3.5a1 1 0 0 1 0 1.301l-3 3.5a.993.993 0 0 1-.759.35zM12 20.5a.995.995 0 0 1-.76-.35l-3-3.5a1 1 0 0 1 0-1.301l3-3.5a1 1 0 0 1 1.518 1.302L10.317 16l2.442 2.85A1 1 0 0 1 12 20.5zM14.251 23.5a.5.5 0 0 1-.482-.638l4-14a.499.499 0 1 1 .961.274l-4 14a.498.498 0 0 1-.479.364z"></path>
    </StyledSVG>
  ),
  render(props: any) {
    return <CodeEditor {...props} />
  },
}
