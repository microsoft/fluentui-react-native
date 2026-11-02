import type { Traits } from '@fluentui-react-native/design/styling';

import type { InputSize, InputVariant } from '../input.types';

export const inputTraits = {
  typography: {
    textInput: { lineHeight: 'layout-only', weight: 'unowned' },
  },
  channels: {
    contents: { stroke: 'authored' },
    textInput: { foreground: 'rest' },
  },
  focusVisual: 'custom-always-visible',
  geometry: {
    root: { radius: { small: 'base200', medium: 'base300', large: 'base400' } },
    contents: { strokeWidth: { outline: 'thin', underline: 'none' } },
    underline: { strokeWidth: 'thin' },
  },
} as const satisfies Traits<'root' | 'contents' | 'underline' | 'textInput', InputVariant, InputSize>;
