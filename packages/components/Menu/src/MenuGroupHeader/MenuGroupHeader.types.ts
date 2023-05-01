import type { TextProps } from '@fluentui-react-native/text';
import type { FontTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const menuGroupHeaderName = 'MenuGroupHeader';

export type MenuGroupHeaderTokens = LayoutTokens & FontTokens & IColorTokens;
export type MenuGroupHeaderProps = TextProps;

export interface MenuGroupHeaderSlotProps {
  root: TextProps;
}

export interface MenuGroupHeaderType {
  props: MenuGroupHeaderProps;
  tokens: MenuGroupHeaderTokens;
  slotProps: MenuGroupHeaderSlotProps;
}
