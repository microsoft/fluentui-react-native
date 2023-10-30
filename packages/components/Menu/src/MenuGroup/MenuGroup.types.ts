import type { ViewProps } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { FocusZoneProps } from '@fluentui-react-native/focus-zone';
import type { LayoutTokens } from '@fluentui-react-native/tokens';

export const menuGroupName = 'MenuGroup';

export type MenuGroupTokens = LayoutTokens;

export type MenuGroupProps = IViewProps;

export interface MenuGroupSlotProps {
  root: ViewProps;
  contentWrapper: FocusZoneProps;
}

export interface MenuGroupType {
  props: MenuGroupProps;
  tokens: MenuGroupTokens;
  slotProps: MenuGroupSlotProps;
}
