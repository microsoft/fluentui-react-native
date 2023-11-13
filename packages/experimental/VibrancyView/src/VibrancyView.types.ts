import type { IViewProps } from '@fluentui-react-native/adapters';

export type Material =
  | 'titlebar'
  | 'selection'
  | 'menu'
  | 'popover'
  | 'sidebar'
  | 'headerview'
  | 'sheet'
  | 'windowbackground'
  | 'hudWindow'
  | 'fullScreenUI'
  | 'toolTip'
  | 'contentBackground'
  | 'underWindowBackground'
  | 'underPageBackground';

export type BlendingMode = 'behindWindow' | 'withinWindow';

export type State = 'followsWindowActiveState' | 'active' | 'inactive';

export interface VibrancyViewProps extends IViewProps {
  material?: Material;
  blendingMode?: BlendingMode;
  state?: State;
}
