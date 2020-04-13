import * as React from 'react'
export const PageContext = React.createContext<any>({})

export const usePageContext = () => React.useContext(PageContext)
