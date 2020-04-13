import { useLayoutEffect } from 'react'

type RootStyles =
  // each style can be documented
  | '--hue'
  // which helps with maintenance
  | '--saturation'
  // but this could also get a little nutty
  | '--lightness'

type StyleObject = { [key in RootStyles]: string | number }

/*
 * Custom React hook to update CSS variables on the document node
 */
export function useRootStyles(styles: StyleObject) {
  useLayoutEffect(
    () =>
      Object.keys(styles).forEach((styleKey: string) => document.documentElement.style.setProperty(styleKey, styles[styleKey] as string)),
    [styles]
  )
}
