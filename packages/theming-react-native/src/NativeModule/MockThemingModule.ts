import { IThemingModuleHelper, IThemingModule, IEventEmitter } from './ThemingModule.types';
import { IWindowsPalette } from '@uifabricshared/theming-ramp';
import { getBaselinePlatformTheme } from '../platform';
import { makeThemingModuleHelper } from './ThemingModuleHelpers';

const whiteColorsPalette: IWindowsPalette = {
  background: 'antiquewhite',
  backgroundHover: '#E6E6E6',
  backgroundPressed: '#969696',
  backgroundSelected: '#D2D2D2',
  backgroundSelectionHighlight: '#737373',

  text: '#505050',
  textRest: '#505050',
  textHover: '#505050',
  textPressed: 'white',
  textSelected: '#505050',
  textDisabled: '#D2D2D2',
  textSelectionHighlight: 'white',

  textSecondary: '#737373',
  textSecondaryRest: '#737373',
  textSecondaryHover: '#505050',
  textSecondaryPressed: '#F3F3F3',
  textSecondarySelected: '#505050',

  textEmphasis: '#2B579A',
  textEmphasisRest: '#2B579A',
  textEmphasisHover: '#2B579A',
  textEmphasisPressed: '#2B579A',
  textEmphasisSelected: '#002050',

  strokeSelectedHover: '#969696',
  strokeKeyboard: '#505050',

  strokeOverlayRest: 'transparent',
  strokeOverlayHover: 'transparent',
  strokeOverlayPressed: 'transparent',
  strokeOverlaySelectedRest: 'transparent',
  strokeOverlaySelectedHover: '#969696',
  strokeOverlaySelectedPressed: 'transparent',

  backgroundControl: '#D2D2D2',
  backgroundControlHover: '#E6E6E6',
  backgroundControlPressed: '#969696',
  backgroundControlSelected: '#D2D2D2',
  backgroundControlDisabled: '#D2D2D24D',

  textControl: '#505050',
  textControlHover: '#505050',
  textControlPressed: '#505050',
  textControlSelected: '#505050',
  textControlDisabled: '#D2D2D24D',

  strokeControl: 'transparent',
  strokeControlHover: 'transparent',
  strokeControlPressed: 'transparent',
  strokeControlSelected: '#969696',
  strokeControlDisabled: '#E6E6E6',
  strokeControlKeyboard: '#737373',

  backgroundControlEmphasis: 'pink',
  backgroundControlEmphasisHover: 'pink',
  backgroundControlEmphasisPressed: 'pink',
  backgroundControlEmphasisDisabled: 'pink',

  textControlEmphasis: 'white',
  textControlEmphasisHover: 'white',
  textControlEmphasisPressed: 'white',
  textControlEmphasisDisabled: 'white',

  strokeControlEmphasis: 'pink',
  strokeControlEmphasisHover: 'pink',
  strokeControlEmphasisPressed: 'pink',
  strokeControlEmphasisDisabled: 'pink',
  strokeControlEmphasisKeyboard: 'white',

  backgroundControlSubtle: 'antiquewhite',
  backgroundControlSubtleHover: 'white',
  backgroundControlSubtlePressed: '#D2D2D24D',
  backgroundControlSubtleDisabled: 'pink',
  backgroundControlSubtleSelectionHighlight: 'pink',

  textControlSubtle: 'pink',
  textControlSubtlePlaceholder: 'pink',
  textControlSubtleHover: 'pink',
  textControlSubtlePressed: 'pink',
  textControlSubtleDisabled: 'pink',
  textControlSubtleSelectionHighlight: 'pink',

  strokeControlSubtle: 'pink',
  strokeControlSubtleHover: 'pink',
  strokeControlSubtlePressed: 'pink',
  strokeControlSubtleDisabled: 'pink',
  strokeControlSubtleKeyboard: 'pink',

  textHyperlink: 'pink',
  textHyperlinkHover: 'pink',
  textHyperlinkPressed: 'pink',

  textActive: 'pink',
  textActiveHover: 'pink',
  textActivePressed: 'pink',
  textActiveSelected: 'pink',

  textError: 'pink',
  textErrorHover: 'pink',
  textErrorPressed: 'pink',
  textErrorSelected: 'pink',

  accentDark: 'pink',
  accentLight: 'pink',
  accentEmphasis: 'pink',
  accentOutline: 'pink',

  backgroundHeader: 'pink',
  textHeader: 'pink'
};

const taskPanePalette: IWindowsPalette = {
  ...whiteColorsPalette,
  background: '#E6E6E6'
};

const baseline = getBaselinePlatformTheme();

export const mockGetPaletteImpl = (pal?: string) => {
  return (pal === 'TaskPane' && taskPanePalette) || whiteColorsPalette;
};

const mockModule: IThemingModule = {
  ramps: {
    App: [],
    FluentGrays: [],
    ClassicGrays: [],
    Sepias: []
  },
  getPalette: mockGetPaletteImpl,
  typography: baseline.typography,
  palettes: { WhiteColors: '1', TaskPane: '2' }
};

export function createMockThemingModuleInfo(
  eventEmitter: IEventEmitter,
  moduleStub?: IThemingModule,
  behaviorOverrides?: Partial<IThemingModuleHelper>
): IThemingModuleHelper {
  return {
    ...makeThemingModuleHelper(eventEmitter, moduleStub || mockModule),
    ...behaviorOverrides
  };
}
