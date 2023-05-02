import type { TextProps } from '@fluentui-react-native/text';
import type { FontTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const menuGroupHeaderName = 'MenuGroupHeader';

export interface MenuGroupHeaderTokens extends LayoutTokens, FontTokens, IColorTokens {
  gap?: number;
}
export type MenuGroupHeaderProps = TextProps;

export interface MenuGroupHeaderSlotProps {
  root: TextProps;
}

export interface MenuGroupHeaderType {
  props: MenuGroupHeaderProps;
  tokens: MenuGroupHeaderTokens;
  slotProps: MenuGroupHeaderSlotProps;
}
