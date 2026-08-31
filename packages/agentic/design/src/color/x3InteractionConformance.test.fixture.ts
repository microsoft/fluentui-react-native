import type { InteractiveColorToken } from '../runtime-colors';

export type InteractionConformanceVector = readonly [
  lightRest: string,
  lightHover: string,
  lightPressed: string,
  darkRest: string,
  darkHover: string,
  darkPressed: string,
];

/**
 * Base and interaction fallback values from the pinned x3 source commit.
 * Each row covers hover and pressed in both light and dark modes.
 */
export const x3InteractionConformance = {
  surfaceNeutralFarther: ['#ebebeb', '#e1e1e1', '#d7d7d7', '#1b1b1b', '#2f2f2f', '#454545'],
  surfaceNeutralFar: ['#f2f2f2', '#e8e8e8', '#dedede', '#1f1f1f', '#323232', '#464646'],
  surfaceNeutralNear: ['#fcfcfc', '#f2f2f2', '#e8e8e8', '#181818', '#2d2d2d', '#434343'],
  surfaceNeutralNearer: ['#ffffff', '#f5f5f5', '#ebebeb', '#292929', '#3a3a3a', '#4b4b4b'],
  surfaceNeutralTranslucent: ['#ffffff80', '#f5f5f58a', '#ebebeb94', '#3c3c3c80', '#47474788', '#5353538f'],
  backgroundNeutralHeavy: ['#242424', '#363636', '#494949', '#ffffff', '#f5f5f5', '#ebebeb'],
  backgroundNeutralLoud: ['#6f6f6f', '#787878', '#818181', '#929292', '#898989', '#808080'],
  backgroundNeutralSoft: ['#00000014', '#0000001e', '#00000028', '#ffffff1f', '#ffffff27', '#ffffff2e'],
  backgroundNeutralSubtle: ['#0000000d', '#00000017', '#00000021', '#ffffff14', '#ffffff1c', '#ffffff23'],
  backgroundNeutralTransparent: ['#24242400', '#1313130a', '#05050514', '#ffffff00', '#ffffff08', '#ffffff0f'],
  backgroundNeutralTranslucent: ['#e9e9e980', '#d8d8d88a', '#cacaca94', '#3c3c3c80', '#56565688', '#6d6d6d8f'],
  backgroundBrandHeavy: ['#242424', '#363636', '#494949', '#ffffff', '#f5f5f5', '#ebebeb'],
  backgroundBrandLoud: ['#6f6f6f', '#787878', '#818181', '#929292', '#898989', '#808080'],
  backgroundBrandSoft: ['#00000014', '#0000001e', '#00000028', '#ffffff1f', '#ffffff27', '#ffffff2e'],
  backgroundBrandSubtle: ['#0000000a', '#00000014', '#0000001e', '#ffffff14', '#ffffff1c', '#ffffff23'],
  backgroundBrandTransparent: ['#24242400', '#1313130a', '#05050514', '#ffffff00', '#ffffff08', '#ffffff0f'],
  backgroundDangerLoud: ['#c02e56', '#cb395e', '#d54467', '#e55e7a', '#da5471', '#d04b69'],
  backgroundDangerSoft: ['#ffe3e6', '#f5d9dc', '#ebcfd2', '#5a2932', '#67353e', '#754149'],
  backgroundDangerSubtle: ['#fff1f3', '#f5e7e9', '#ebdddf', '#402529', '#503438', '#614448'],
  backgroundWarningLoud: ['#bb4001', '#c54a14', '#d05321', '#e56738', '#da5d2e', '#d05422'],
  backgroundWarningSoft: ['#ffe5dc', '#f5dbd2', '#ebd1c9', '#592c1c', '#663828', '#744434'],
  backgroundWarningSubtle: ['#fff2ee', '#f5e8e4', '#ebdeda', '#40261d', '#51352c', '#62453b'],
  backgroundSuccessLoud: ['#008455', '#188d5d', '#279666', '#05ad72', '#00a369', '#009a60'],
  backgroundSuccessSoft: ['#c9f8dd', '#bfeed3', '#b6e4ca', '#0c462d', '#1c5238', '#295f44'],
  backgroundSuccessSubtle: ['#e3fcee', '#d9f2e4', '#cfe8da', '#193426', '#294435', '#385445'],
  strokeNeutralHeavy: ['#242424', '#363636', '#494949', '#dedede', '#d4d4d4', '#cbcbcb'],
  strokeNeutralLoud: ['#6f6f6f', '#787878', '#818181', '#929292', '#898989', '#808080'],
  strokeNeutralSoft: ['#0000006d', '#02020277', '#04040481', '#ffffff61', '#ffffff69', '#ffffff70'],
  strokeNeutralSubtle: ['#00000021', '#0000002b', '#05050535', '#ffffff48', '#ffffff50', '#ffffff57'],
  strokeNeutralTransparent: ['#24242400', '#1313130a', '#05050514', '#ffffff00', '#ffffff08', '#ffffff0f'],
  strokeNeutralOnloud: ['#ffffffff', '#ffffff', '#ffffff', '#000000db', '#000000db', '#000000db'],
  strokeBrandLoud: ['#6f6f6f', '#787878', '#818181', '#929292', '#898989', '#808080'],
  strokeBrandSoft: ['#0000006d', '#02020277', '#04040481', '#ffffff61', '#ffffff69', '#ffffff70'],
  strokeBrandSubtle: ['#00000021', '#0000002b', '#05050535', '#ffffff48', '#ffffff50', '#ffffff57'],
  strokeBrandOnloud: ['#ffffff', '#ffffff', '#ffffff', '#242424', '#131313', '#050505'],
  strokeDangerLoud: ['#c02e56', '#cb395e', '#d54467', '#e55e7a', '#da5471', '#d04b69'],
  strokeDangerSoft: ['#e55e7a', '#da5471', '#d04b69', '#d14164', '#dc4b6d', '#e65575'],
  strokeDangerSubtle: ['#ffd0d6', '#f5c6cc', '#ebbdc3', '#76293a', '#803242', '#893a4a'],
  strokeDangerOnloud: ['#ffffff', '#ffffff', '#ffffff', '#242424', '#131313', '#050505'],
  strokeWarningLoud: ['#cd4808', '#d8521a', '#e25c27', '#e56738', '#da5d2e', '#d05422'],
  strokeWarningSoft: ['#fc9571', '#f28c68', '#e7825f', '#cd4808', '#d8521a', '#e25c27'],
  strokeWarningSubtle: ['#ffd3c4', '#f5c9ba', '#ebc0b1', '#762e12', '#7f371b', '#893f24'],
  strokeWarningOnloud: ['#ffffff', '#ffffff', '#ffffff', '#242424', '#131313', '#050505'],
  strokeSuccessLoud: ['#008455', '#188d5d', '#279666', '#05ad72', '#00a369', '#009a60'],
  strokeSuccessSoft: ['#5dce97', '#52c48e', '#47bb85', '#008e5c', '#1a9765', '#2aa16d'],
  strokeSuccessSubtle: ['#b1efcc', '#a7e5c2', '#9edbb9', '#025636', '#125f3e', '#1e6746'],
  strokeSuccessOnloud: ['#ffffff', '#ffffff', '#ffffff', '#242424', '#131313', '#050505'],
  foregroundNeutralPrimary: ['#000000db', '#000000e5', '#000000ef', '#ffffffde', '#ffffffe6', '#ffffffed'],
  foregroundNeutralSecondary: ['#000000a2', '#000000ac', '#000000b6', '#ffffffa1', '#ffffffa9', '#ffffffb0'],
  foregroundNeutralTertiary: ['#00000090', '#0000009a', '#000000a4', '#ffffff80', '#ffffff88', '#ffffff8f'],
  foregroundNeutralOnloud: ['#ffffffff', '#ffffff', '#ffffff', '#000000db', '#000000db', '#000000db'],
  foregroundBrandPrimary: ['#242424', '#131313', '#050505', '#dedede', '#e8e8e8', '#f2f2f2'],
  foregroundBrandOnloud: ['#ffffff', '#ffffff', '#ffffff', '#000000db', '#000000db', '#000000db'],
  foregroundDangerPrimary: ['#a62147', '#9c133f', '#910037', '#fd8ea1', '#ff97aa', '#ffa1b4'],
  foregroundDangerOnloud: ['#ffffff', '#ffffff', '#ffffff', '#000000db', '#000000db', '#000000db'],
  foregroundWarningPrimary: ['#a93901', '#9f2f00', '#952500', '#fc9571', '#ff9f7a', '#ffa884'],
  foregroundWarningOnloud: ['#ffffff', '#ffffff', '#ffffff', '#000000db', '#000000db', '#000000db'],
  foregroundSuccessPrimary: ['#017048', '#006740', '#005f38', '#5dce97', '#67d8a0', '#72e2aa'],
  foregroundSuccessOnloud: ['#ffffff', '#ffffff', '#ffffff', '#000000db', '#000000db', '#000000db'],
} as const satisfies Record<InteractiveColorToken, InteractionConformanceVector>;

/**
 * The generated x3 table routes these entries through its separately scoped
 * Bebop Warm path. `defaultValue` is the result of the default algorithm
 * requested by #4268; `warmValue` is retained to make every table deviation
 * explicit.
 */
export const x3WarmVariantDeviations = {
  'backgroundNeutralTranslucent.hover.light': {
    warmValue: '#d8d8d88a',
    defaultValue: '#dfdfdf8a',
    reason: 'The warm path composites this translucent background against a reference surface before shifting it.',
  },
  'backgroundNeutralTranslucent.pressed.light': {
    warmValue: '#cacaca94',
    defaultValue: '#d5d5d594',
    reason: 'The warm path composites this translucent background against a reference surface before shifting it.',
  },
  'backgroundNeutralTranslucent.hover.dark': {
    warmValue: '#56565688',
    defaultValue: '#47474788',
    reason: 'The warm path composites this translucent background against a reference surface before shifting it.',
  },
  'backgroundNeutralTranslucent.pressed.dark': {
    warmValue: '#6d6d6d8f',
    defaultValue: '#5353538f',
    reason: 'The warm path composites this translucent background against a reference surface before shifting it.',
  },
  'strokeNeutralSoft.hover.light': {
    warmValue: '#02020277',
    defaultValue: '#00000077',
    reason: 'The warm path adds chroma while the default algorithm preserves chroma.',
  },
  'strokeNeutralSoft.pressed.light': {
    warmValue: '#04040481',
    defaultValue: '#00000081',
    reason: 'The warm path adds chroma while the default algorithm preserves chroma.',
  },
  'strokeNeutralSubtle.pressed.light': {
    warmValue: '#05050535',
    defaultValue: '#00000035',
    reason: 'The warm path adds chroma while the default algorithm preserves chroma.',
  },
  'strokeBrandSoft.hover.light': {
    warmValue: '#02020277',
    defaultValue: '#00000077',
    reason: 'The warm path adds chroma while the default algorithm preserves chroma.',
  },
  'strokeBrandSoft.pressed.light': {
    warmValue: '#04040481',
    defaultValue: '#00000081',
    reason: 'The warm path adds chroma while the default algorithm preserves chroma.',
  },
  'strokeBrandSubtle.pressed.light': {
    warmValue: '#05050535',
    defaultValue: '#00000035',
    reason: 'The warm path adds chroma while the default algorithm preserves chroma.',
  },
} as const;
