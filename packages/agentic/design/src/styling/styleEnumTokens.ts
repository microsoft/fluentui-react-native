import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { enumToken } from './tokenFields';

export const ALIGN_CONTENT_VALUES = [
  'flex-start',
  'flex-end',
  'center',
  'stretch',
  'space-between',
  'space-around',
  'space-evenly',
] as const satisfies readonly NonNullable<ViewStyle['alignContent']>[];
export const alignContentToken = /* @__PURE__ */ enumToken(ALIGN_CONTENT_VALUES);

export const ALIGN_ITEMS_VALUES = ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'] as const satisfies readonly NonNullable<
  ViewStyle['alignItems']
>[];
export const alignItemsToken = /* @__PURE__ */ enumToken(ALIGN_ITEMS_VALUES);

export const ALIGN_SELF_VALUES = [
  'auto',
  'flex-start',
  'flex-end',
  'center',
  'stretch',
  'baseline',
] as const satisfies readonly NonNullable<ViewStyle['alignSelf']>[];
export const alignSelfToken = /* @__PURE__ */ enumToken(ALIGN_SELF_VALUES);

export const BACKFACE_VISIBILITY_VALUES = ['visible', 'hidden'] as const satisfies readonly NonNullable<ViewStyle['backfaceVisibility']>[];
export const backfaceVisibilityToken = /* @__PURE__ */ enumToken(BACKFACE_VISIBILITY_VALUES);

export const BORDER_CURVE_VALUES = ['circular', 'continuous'] as const satisfies readonly NonNullable<ViewStyle['borderCurve']>[];
export const borderCurveToken = /* @__PURE__ */ enumToken(BORDER_CURVE_VALUES);

export const BORDER_STYLE_VALUES = ['solid', 'dotted', 'dashed'] as const satisfies readonly NonNullable<ViewStyle['borderStyle']>[];
export const borderStyleToken = /* @__PURE__ */ enumToken(BORDER_STYLE_VALUES);

export const BOX_SIZING_VALUES = ['border-box', 'content-box'] as const satisfies readonly NonNullable<ViewStyle['boxSizing']>[];
export const boxSizingToken = /* @__PURE__ */ enumToken(BOX_SIZING_VALUES);

export const CURSOR_VALUES = ['auto', 'pointer'] as const satisfies readonly NonNullable<ViewStyle['cursor']>[];
export const cursorToken = /* @__PURE__ */ enumToken(CURSOR_VALUES);

export const DIRECTION_VALUES = ['inherit', 'ltr', 'rtl'] as const satisfies readonly NonNullable<ViewStyle['direction']>[];
export const directionToken = /* @__PURE__ */ enumToken(DIRECTION_VALUES);

export const DISPLAY_VALUES = ['none', 'flex', 'contents'] as const satisfies readonly NonNullable<ViewStyle['display']>[];
export const displayToken = /* @__PURE__ */ enumToken(DISPLAY_VALUES);

export const FLEX_DIRECTION_VALUES = ['row', 'column', 'row-reverse', 'column-reverse'] as const satisfies readonly NonNullable<
  ViewStyle['flexDirection']
>[];
export const flexDirectionToken = /* @__PURE__ */ enumToken(FLEX_DIRECTION_VALUES);

export const FLEX_WRAP_VALUES = ['wrap', 'nowrap', 'wrap-reverse'] as const satisfies readonly NonNullable<ViewStyle['flexWrap']>[];
export const flexWrapToken = /* @__PURE__ */ enumToken(FLEX_WRAP_VALUES);

export const ISOLATION_VALUES = ['auto', 'isolate'] as const satisfies readonly NonNullable<ViewStyle['isolation']>[];
export const isolationToken = /* @__PURE__ */ enumToken(ISOLATION_VALUES);

export const JUSTIFY_CONTENT_VALUES = [
  'flex-start',
  'flex-end',
  'center',
  'space-between',
  'space-around',
  'space-evenly',
] as const satisfies readonly NonNullable<ViewStyle['justifyContent']>[];
export const justifyContentToken = /* @__PURE__ */ enumToken(JUSTIFY_CONTENT_VALUES);

export const MIX_BLEND_MODE_VALUES = [
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion',
  'hue',
  'saturation',
  'color',
  'luminosity',
] as const satisfies readonly NonNullable<ViewStyle['mixBlendMode']>[];
export const mixBlendModeToken = /* @__PURE__ */ enumToken(MIX_BLEND_MODE_VALUES);

export const OUTLINE_STYLE_VALUES = BORDER_STYLE_VALUES satisfies readonly NonNullable<ViewStyle['outlineStyle']>[];
export const outlineStyleToken = /* @__PURE__ */ enumToken(OUTLINE_STYLE_VALUES);

export const OVERFLOW_VALUES = ['visible', 'hidden', 'scroll'] as const satisfies readonly NonNullable<ViewStyle['overflow']>[];
export const overflowToken = /* @__PURE__ */ enumToken(OVERFLOW_VALUES);

export const POINTER_EVENTS_VALUES = ['box-none', 'none', 'box-only', 'auto'] as const satisfies readonly NonNullable<
  ViewStyle['pointerEvents']
>[];
export const pointerEventsToken = /* @__PURE__ */ enumToken(POINTER_EVENTS_VALUES);

export const POSITION_VALUES = ['absolute', 'relative', 'static'] as const satisfies readonly NonNullable<ViewStyle['position']>[];
export const positionToken = /* @__PURE__ */ enumToken(POSITION_VALUES);

export const FONT_STYLE_VALUES = ['normal', 'italic'] as const satisfies readonly NonNullable<TextStyle['fontStyle']>[];
export const fontStyleToken = /* @__PURE__ */ enumToken(FONT_STYLE_VALUES);

export const FONT_WEIGHT_VALUES = [
  'normal',
  'bold',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  100,
  200,
  300,
  400,
  500,
  600,
  700,
  800,
  900,
  'ultralight',
  'thin',
  'light',
  'regular',
  'medium',
  'semibold',
  'condensedBold',
  'condensed',
  'heavy',
  'black',
] as const satisfies readonly NonNullable<TextStyle['fontWeight']>[];
export const fontWeightToken = /* @__PURE__ */ enumToken(FONT_WEIGHT_VALUES);

export const TEXT_ALIGN_VALUES = ['auto', 'left', 'right', 'center', 'justify'] as const satisfies readonly NonNullable<
  TextStyle['textAlign']
>[];
export const textAlignToken = /* @__PURE__ */ enumToken(TEXT_ALIGN_VALUES);

export const TEXT_ALIGN_VERTICAL_VALUES = ['auto', 'top', 'bottom', 'center'] as const satisfies readonly NonNullable<
  TextStyle['textAlignVertical']
>[];
export const textAlignVerticalToken = /* @__PURE__ */ enumToken(TEXT_ALIGN_VERTICAL_VALUES);

export const TEXT_DECORATION_LINE_VALUES = [
  'none',
  'underline',
  'line-through',
  'underline line-through',
] as const satisfies readonly NonNullable<TextStyle['textDecorationLine']>[];
export const textDecorationLineToken = /* @__PURE__ */ enumToken(TEXT_DECORATION_LINE_VALUES);

export const TEXT_DECORATION_STYLE_VALUES = ['solid', 'double', 'dotted', 'dashed'] as const satisfies readonly NonNullable<
  TextStyle['textDecorationStyle']
>[];
export const textDecorationStyleToken = /* @__PURE__ */ enumToken(TEXT_DECORATION_STYLE_VALUES);

export const TEXT_TRANSFORM_VALUES = ['none', 'capitalize', 'uppercase', 'lowercase'] as const satisfies readonly NonNullable<
  TextStyle['textTransform']
>[];
export const textTransformToken = /* @__PURE__ */ enumToken(TEXT_TRANSFORM_VALUES);

export const USER_SELECT_VALUES = ['auto', 'none', 'text', 'contain', 'all'] as const satisfies readonly NonNullable<
  TextStyle['userSelect']
>[];
export const userSelectToken = /* @__PURE__ */ enumToken(USER_SELECT_VALUES);

export const VERTICAL_ALIGN_VALUES = ['auto', 'top', 'bottom', 'middle'] as const satisfies readonly NonNullable<
  TextStyle['verticalAlign']
>[];
export const verticalAlignToken = /* @__PURE__ */ enumToken(VERTICAL_ALIGN_VALUES);

export const WRITING_DIRECTION_VALUES = ['auto', 'ltr', 'rtl'] as const satisfies readonly NonNullable<TextStyle['writingDirection']>[];
export const writingDirectionToken = /* @__PURE__ */ enumToken(WRITING_DIRECTION_VALUES);

export const OBJECT_FIT_VALUES = ['cover', 'contain', 'fill', 'scale-down', 'none'] as const satisfies readonly NonNullable<
  ImageStyle['objectFit']
>[];
export const objectFitToken = /* @__PURE__ */ enumToken(OBJECT_FIT_VALUES);

export const RESIZE_MODE_VALUES = ['cover', 'contain', 'stretch', 'repeat', 'center', 'none'] as const satisfies readonly NonNullable<
  ImageStyle['resizeMode']
>[];
export const resizeModeToken = /* @__PURE__ */ enumToken(RESIZE_MODE_VALUES);
