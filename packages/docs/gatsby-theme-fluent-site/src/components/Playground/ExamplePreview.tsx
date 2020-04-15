import * as React from 'react'
import { IFrameRenderer } from './IFrameRenderer'
import { usePlayground, IExample } from './context'

export const ExamplePreview = ({ example }: { example: IExample }) => {
  const [Component, error] = useTranspiledComponent(example.source)
  const [playground] = usePlayground()
  return (
    <IFrameRenderer>
      {ctx => {
        if (error) return null // TODO: better UX
        if (!Component) return null
        return (
          <ExampleRenderer>
            <Component document={ctx.document} theme={playground.currentTheme} rtl={playground.rtl} />
          </ExampleRenderer>
        )
      }}
    </IFrameRenderer>
  )
}

const ExampleRenderer = ({ children }) => {
  const [playground] = usePlayground()

  const style: any = {
    direction: playground.rtl ? 'rtl' : 'ltr',
    zoom: playground.zoomLevel,
  }
  if (playground.resolution !== 'Responsive') {
    style.width = playground.resolution
  }

  return (
    <div
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        overflow: 'auto',
      }}
    >
      <div style={style}>{children}</div>
    </div>
  )
}

/**
 * Transpiles source code into a React component. Expects the source code to
 * expose the component as a default export.
 *
 * @example
 * ```tsx
 * const Component = useTranspiledComponent(`
 *   import * as React from "react"
 *
 *   export default () => {
 *     return <h1>Hello World</h1>
 *   }
 * `)
 *
 * // Component = () => React.createElement("h1", null, "Hello World")
 * ```
 */
function useTranspiledComponent(source: string): [React.ComponentType<any> | undefined, Error | undefined] {
  const ts = useLazyTypeScript()

  // TypeScript has not loaded, do nothing.
  if (!ts) return [undefined, undefined]

  // TODO: proper import handling... Consider TS VFS.
  source = source.replace('import * as React from "react"', '')
  source = source.replace('export default', 'return')

  try {
    source = ts.transpileModule(source, {
      compilerOptions: {
        module: 'none',
        jsx: 'react',
      },
    }).outputText

    // TODO: should this be sandboxed in some way?
    window.React = React // TODO: properly bind React into component scope.
    const Component = new Function(source)()

    return [
      // Dumb wrapper around user-defined component to handle errors/undefined return value.
      // TODO: proper UX for errors
      props => {
        try {
          return Component(props) || null
        } catch (e) {
          return null
        }
      },
      undefined,
    ]
  } catch (e) {
    return [undefined, e]
  }
}

/**
 * Lazy loads TypeScript for in-browser transpilation
 */
function useLazyTypeScript() {
  const [ts, setTS] = React.useState()
  React.useEffect(() => {
    let cancelled = false
    import('typescript').then(res => {
      if (!cancelled) {
        setTS(res.default)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])
  return ts
}
