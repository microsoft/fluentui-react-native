import { IThemingModuleHelper, IOfficeThemingModule, IEventEmitter } from './ThemingModule.types';
import { getBaselinePlatformTheme } from '../BaselinePlatformDefaults';
import { makeOfficeThemingModuleHelper } from './ThemingModuleHelpers';
import { IOfficePalette } from './office';

const whiteColorsPalette: IOfficePalette = {
  Bkg: 'antiquewhite',
  BkgHover: '#E6E6E6',
  BkgPressed: '#969696',
  BkgSelected: '#D2D2D2',
  BkgSelectionHighlight: '#737373',

  Text: '#505050',
  TextRest: '#505050',
  TextHover: '#505050',
  TextPressed: 'white',
  TextSelected: '#505050',
  TextDisabled: '#D2D2D2',
  TextSelectionHighlight: 'white',

  TextSecondary: '#737373',
  TextSecondaryRest: '#737373',
  TextSecondaryHover: '#505050',
  TextSecondaryPressed: '#F3F3F3',
  TextSecondarySelected: '#505050',

  TextEmphasis: '#2B579A',
  TextEmphasisRest: '#2B579A',
  TextEmphasisHover: '#2B579A',
  TextEmphasisPressed: '#2B579A',
  TextEmphasisSelected: '#002050',

  StrokeSelectedHover: '#969696',
  StrokeKeyboard: '#505050',

  StrokeOverlayRest: 'transparent',
  StrokeOverlayHover: 'transparent',
  StrokeOverlayPressed: 'transparent',
  StrokeOverlaySelectedRest: 'transparent',
  StrokeOverlaySelectedHover: '#969696',
  StrokeOverlaySelectedPressed: 'transparent',

  BkgCtl: '#D2D2D2',
  BkgCtlHover: '#E6E6E6',
  BkgCtlPressed: '#969696',
  BkgCtlSelected: '#D2D2D2',
  BkgCtlDisabled: '#D2D2D24D',

  TextCtl: '#505050',
  TextCtlHover: '#505050',
  TextCtlPressed: '#505050',
  TextCtlSelected: '#505050',
  TextCtlDisabled: '#D2D2D24D',

  StrokeCtl: 'transparent',
  StrokeCtlHover: 'transparent',
  StrokeCtlPressed: 'transparent',
  StrokeCtlSelected: '#969696',
  StrokeCtlDisabled: '#E6E6E6',
  StrokeCtlKeyboard: '#737373',

  BkgCtlEmphasis: 'pink',
  BkgCtlEmphasisHover: 'pink',
  BkgCtlEmphasisPressed: 'pink',
  BkgCtlEmphasisDisabled: 'pink',

  TextCtlEmphasis: 'white',
  TextCtlEmphasisHover: 'white',
  TextCtlEmphasisPressed: 'white',
  TextCtlEmphasisDisabled: 'white',

  StrokeCtlEmphasis: 'pink',
  StrokeCtlEmphasisHover: 'pink',
  StrokeCtlEmphasisPressed: 'pink',
  StrokeCtlEmphasisDisabled: 'pink',
  StrokeCtlEmphasisKeyboard: 'white',

  BkgCtlSubtle: 'antiquewhite',
  BkgCtlSubtleHover: 'white',
  BkgCtlSubtlePressed: '#D2D2D24D',
  BkgCtlSubtleDisabled: 'pink',
  BkgCtlSubtleSelectionHighlight: 'pink',

  TextCtlSubtle: 'pink',
  TextCtlSubtlePlaceholder: 'pink',
  TextCtlSubtleHover: 'pink',
  TextCtlSubtlePressed: 'pink',
  TextCtlSubtleDisabled: 'pink',
  TextCtlSubtleSelectionHighlight: 'pink',

  StrokeCtlSubtle: 'pink',
  StrokeCtlSubtleHover: 'pink',
  StrokeCtlSubtlePressed: 'pink',
  StrokeCtlSubtleDisabled: 'pink',
  StrokeCtlSubtleKeyboard: 'pink',

  TextHyperlink: 'pink',
  TextHyperlinkHover: 'pink',
  TextHyperlinkPressed: 'pink',

  TextActive: 'pink',
  TextActiveHover: 'pink',
  TextActivePressed: 'pink',
  TextActiveSelected: 'pink',

  TextError: 'pink',
  TextErrorHover: 'pink',
  TextErrorPressed: 'pink',
  TextErrorSelected: 'pink',

  AccentDark: 'pink',
  AccentLight: 'pink',
  AccentEmphasis: 'pink',
  AccentOutline: 'pink',

  BkgHeader: 'pink',
  TextHeader: 'pink'
};

const taskPanePalette: IOfficePalette = {
  ...whiteColorsPalette,
  Bkg: '#E6E6E6',
  BkgCtlEmphasis: 'green',
  TextCtlEmphasis: 'white'
};

const baseline = getBaselinePlatformTheme();

export const mockGetPaletteImpl = (pal?: string) => {
  return (pal === 'TaskPane' && taskPanePalette) || whiteColorsPalette;
};

const mockModule: IOfficeThemingModule = {
  ramps: {
    App: ['#F8F8F8', '#EFF6FC', '#BBDAF3', '#55A4E2', '#359EDD', '#0078d7', '#283E4A', '#030C13'],
    FluentGrays: ['#FAF9F8', '#797775', '#11100F'],
    ClassicGrays: ['#FFFFFF', '#737373', '#000000'],
    Sepias: ['#ECE6DE']
  },
  getPalette: mockGetPaletteImpl,
  typography: baseline.typography
};

export function makeMockThemingModuleHelper(
  eventEmitter: IEventEmitter,
  moduleStub?: IOfficeThemingModule,
  behaviorOverrides?: Partial<IThemingModuleHelper>
): IThemingModuleHelper {
  return {
    ...makeOfficeThemingModuleHelper(eventEmitter, moduleStub || mockModule),
    ...behaviorOverrides
  };
}
