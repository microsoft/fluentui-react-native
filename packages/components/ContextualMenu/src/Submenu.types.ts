import { ContextualMenuProps, ContextualMenuTokens, ContextualMenuState } from './ContextualMenu.types';
import { ScrollViewProps, ViewProps } from 'react-native';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { FocusZoneProps } from '@fluentui-react-native/focus-zone';

export const submenuName = 'Submenu';

export type SubmenuState = ContextualMenuState;
export type SubmenuTokens = ContextualMenuTokens;
export type SubmenuProps = ContextualMenuProps;

export type SubmenuSlotProps = {
  root: SubmenuProps;
  container: ViewProps;
  scrollView: ScrollViewProps;
  focusZone?: FocusZoneProps; // macOS only
};

export type SubmenuRenderData = IRenderData<SubmenuSlotProps, SubmenuState>;

export interface SubmenuType {
  props: SubmenuProps;
  slotProps: SubmenuSlotProps;
  tokens: SubmenuTokens;
  state: SubmenuState;
}
