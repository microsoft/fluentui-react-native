import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { FlexTokens } from '@fluentui-react-native/design';
import { getGapStyleValue, getThemedStateStyleFactory } from '@fluentui-react-native/design/styling';
import type { StyleDefinition } from '@fluentui-react-native/design/styling';
import type { ToolbarState } from './toolbar.types';

export const toolbarStyles = StyleSheet.create({
  root: { alignItems: 'center', alignSelf: 'flex-start', flexDirection: 'row', flexWrap: 'nowrap' },
});
const levels = [['small', 'large']] as const;
const getSizeStyle = getThemedStateStyleFactory(
  'Toolbar.root',
  ({ spacing }: FlexTokens): StyleDefinition<ViewStyle, typeof levels> => ({
    small: { gap: getGapStyleValue(spacing.componentBase50) },
    large: { gap: getGapStyleValue(spacing.componentBase150) },
  }),
  levels,
);

export function getToolbarSizeStyle(state: ToolbarState): ViewStyle {
  return getSizeStyle(state, [state.size]);
}
