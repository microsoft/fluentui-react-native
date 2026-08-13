import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';
import { getThemedStateStyleFactory } from '../../utils/branchedStyle';
import type { StyleDefinition } from '../../utils/branchedStyle';
import type { DividerState } from './divider.types';

function getGapValue(value: FlexTokens['spacing']['componentBase150']): NonNullable<ViewStyle['gap']> {
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }

  throw new TypeError('Divider gap tokens must resolve to a number or string.');
}

export const dividerStyles = StyleSheet.create({
  root: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    justifyContent: 'center',
  },
  label: {
    flexShrink: 1,
    textAlign: 'center',
  },
});

const orientationStateLevels = [['horizontal', 'vertical']] as const;
type OrientationStateLevels = typeof orientationStateLevels;

function createRootStyleDefinition(_tokens: FlexTokens): StyleDefinition<ViewStyle, OrientationStateLevels> {
  return {
    horizontal: { flexDirection: 'row' },
    vertical: { flexDirection: 'column' },
  };
}

const getThemedRootStyle = getThemedStateStyleFactory('Divider.root', createRootStyleDefinition, orientationStateLevels);

export function getDividerRootStyle(state: DividerState): ViewStyle {
  return getThemedRootStyle(state, [state.vertical ? 'vertical' : 'horizontal']);
}

function createContentStyleDefinition({ spacing }: FlexTokens): StyleDefinition<ViewStyle, OrientationStateLevels> {
  const padding = spacing.componentBase300;
  const gap = getGapValue(spacing.componentBase150);

  return {
    horizontal: {
      gap,
      paddingHorizontal: padding,
    },
    vertical: {
      gap,
      paddingVertical: padding,
    },
  };
}

const getThemedContentStyle = getThemedStateStyleFactory('Divider.content', createContentStyleDefinition, orientationStateLevels);

export function getDividerContentStyle(state: DividerState): ViewStyle {
  return getThemedContentStyle(state, [state.vertical ? 'vertical' : 'horizontal']);
}

function createLabelStyleDefinition({
  color,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
}: FlexTokens): StyleDefinition<TextStyle, OrientationStateLevels> {
  const bodySmallSize = fontSize.functionalBodySmall;
  const bodySmallLineHeight = lineHeight.functionalBodySmall;

  return {
    horizontal: {
      color: color.foregroundNeutralSecondary,
      fontFamily: fontFamily.functional,
      fontSize: bodySmallSize,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: bodySmallLineHeight,
    },
    vertical: {
      color: color.foregroundNeutralSecondary,
      fontFamily: fontFamily.functional,
      fontSize: bodySmallSize,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: bodySmallLineHeight,
    },
  };
}

const getThemedLabelStyle = getThemedStateStyleFactory('Divider.label', createLabelStyleDefinition, orientationStateLevels);

export function getDividerLabelStyle(state: DividerState): TextStyle {
  return getThemedLabelStyle(state, [state.vertical ? 'vertical' : 'horizontal']);
}

export function getDividerLineStyle(state: DividerState, position: 'before' | 'after'): ViewStyle {
  const isStub = (state.layout === 'start' && position === 'before') || (state.layout === 'end' && position === 'after');
  const flexBasis = isStub ? state.tokens.spacing.componentBase100 : 0;

  return {
    backgroundColor: state.tokens.color.strokeNeutralSubtle,
    ...(state.vertical ? { width: 1 } : { height: 1 }),
    flexBasis,
    flexGrow: isStub ? 0 : 1,
  };
}
