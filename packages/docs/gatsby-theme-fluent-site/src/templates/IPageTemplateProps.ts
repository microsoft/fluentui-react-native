import { ISidebarItem } from '.'

export interface IPageTemplateProps {
  sidebarItems?: {
    name: string
    items?: ISidebarItem[]
  }
  children?: React.ReactNode
  path?: string
}
