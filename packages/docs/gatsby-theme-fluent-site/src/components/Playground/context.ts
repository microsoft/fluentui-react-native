import * as React from 'react'

const PlaygroundContext = React.createContext<IPlaygroundContext>(null as any)
PlaygroundContext.displayName = 'PlaygroundContext'
export const PlaygroundProvider = PlaygroundContext.Provider
export const usePlayground = () => React.useContext(PlaygroundContext)

export type IPlaygroundContext = [IPlayground, React.Dispatch<any>]

export interface IPlayground {
  examples: IExample[]
  themes: string[]
  currentTheme: string
  currentExample: IExample
  currentPlugin: any
  rtl: boolean
  zoomLevel: number
  resolution: number | 'Responsive'
}
export interface IExample {
  title: string
  description: string
  source: string
}
