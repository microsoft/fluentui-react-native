import * as React from 'react'
import styled from '@emotion/styled'
import { PlaygroundProvider, IPlayground, IExample } from './context'
import { Sidebar } from './Sidebar'
import { Viewport } from './Viewport'
import { Footer } from './Footer'

function handleAction(state: IPlayground, action: any): IPlayground {
  switch (action.type) {
    case 'TOGGLE_RTL':
      return { ...state, rtl: !state.rtl }
    case 'CHANGE_THEME':
      return { ...state, currentTheme: action.payload }
    case 'CHANGE_EXAMPLE':
      return { ...state, currentExample: action.payload }
    case 'CHANGE_RESOLUTION':
      return { ...state, resolution: action.payload }
    case 'CHANGE_ZOOM_LEVEL':
      return { ...state, zoomLevel: action.payload }
    case 'CHANGE_CURRENT_EXAMPLE_SOURCE':
      return { ...state, currentExample: { ...state.currentExample, source: action.payload } }
    case 'TOGGLE_PLUGIN':
      return { ...state, currentPlugin: state.currentPlugin === action.payload ? null : action.payload }
    default:
      console.warn('Missing handler for action: %s', action.type)
      return state
  }
}

export const Playground = ({ examples = [], themes = [] }: { examples: IExample[]; themes: string[] }) => {
  // TODO: ensure state stays in sync with changes to examples/themes props.
  const playground = React.useReducer(handleAction, {
    examples,
    themes,
    rtl: false,
    zoomLevel: 1,
    resolution: 'Responsive',
    currentExample: examples[0],
    currentTheme: themes[0],
    currentPlugin: null,
  })

  return (
    <PlaygroundProvider value={playground}>
      <StyledPlayground>
        <StyledPlaygroundBody>
          <Viewport />
          <Sidebar />
        </StyledPlaygroundBody>
        <Footer />
      </StyledPlayground>
    </PlaygroundProvider>
  )
}

const StyledPlayground = styled.div`
  border: 1px solid #eee;
  border-radius: 3px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
`

const StyledPlaygroundBody = styled.div`
  position: relative;
  display: flex;
  overflow: hidden;
`
