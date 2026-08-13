import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';
import { size160 } from '@fluentui-react-native/design/tokens/global';

import { getStateStyleFactory, getThemedStateStyleFactory } from '../../utils/branchedStyle';
import type { StyleDefinition } from '../../utils/branchedStyle';
import { getThemedColorStyleFactory } from '../../utils/colorStyles';
import type { ColorStyleDefinition, TextColorStyle, ViewColorStyle } from '../../utils/colorStyles';
import type { AccordionState } from './accordion.types';

export const accordionStyles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    borderStyle: 'solid',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  title: {
    minWidth: 0,
  },
  chevronContainer: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
  leadingIcon: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
  body: {
    alignSelf: 'stretch',
  },
  bodyContent: {
    alignSelf: 'stretch',
  },
  bodyPlaceholder: {
    flexShrink: 1,
  },
});

const sizeStateLevels = [['small']] as const;
type SizeStateLevels = typeof sizeStateLevels;

function getGapValue(value: FlexTokens['spacing']['componentBase100']): NonNullable<ViewStyle['gap']> {
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }
  throw new TypeError('Accordion gap tokens must resolve to a number or string.');
}

function createHeaderLayoutStyleDefinition({ borderRadius, spacing }: FlexTokens): StyleDefinition<ViewStyle, SizeStateLevels> {
  return {
    small: {
      borderRadius: borderRadius.base200,
      gap: getGapValue(spacing.componentBase100),
      paddingHorizontal: spacing.componentBase200,
      paddingVertical: spacing.componentBase100,
    },
  };
}

const getHeaderLayoutStyle = getThemedStateStyleFactory('Accordion.headerLayout', createHeaderLayoutStyleDefinition, sizeStateLevels);

function createTitleTypographyStyleDefinition({ fontFamily, fontSize, fontWeight, lineHeight }: FlexTokens): StyleDefinition<TextStyle, SizeStateLevels> {
  return {
    small: {
      fontFamily: fontFamily.functional,
      fontSize: fontSize.functionalBodySmall,
      fontWeight: fontWeight.functionalSemibold,
      lineHeight: lineHeight.functionalBodySmall,
    },
  };
}

const getTitleTypographyStyle = getThemedStateStyleFactory('Accordion.titleTypography', createTitleTypographyStyleDefinition, sizeStateLevels);

function createBodyTypographyStyleDefinition({ fontFamily, fontSize, fontWeight, lineHeight }: FlexTokens): StyleDefinition<TextStyle, SizeStateLevels> {
  return {
    small: {
      fontFamily: fontFamily.functional,
      fontSize: fontSize.functionalBodySmall,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodySmall,
    },
  };
}

const getBodyTypographyStyle = getThemedStateStyleFactory('Accordion.bodyTypography', createBodyTypographyStyleDefinition, sizeStateLevels);

function createBodyLayoutStyleDefinition({ spacing }: FlexTokens): StyleDefinition<ViewStyle, SizeStateLevels> {
  return {
    small: {
      paddingHorizontal: spacing.componentBase200,
      paddingTop: spacing.componentBase200,
    },
  };
}

const getBodyLayoutStyle = getThemedStateStyleFactory('Accordion.bodyLayout', createBodyLayoutStyleDefinition, sizeStateLevels);

function createHeaderFocusStyleDefinition({ color, strokeWidth }: FlexTokens): StyleDefinition<ViewStyle, [['focused']]> {
  return {
    focused: {
      borderColor: color.strokeFocusInner,
      outlineColor: color.strokeFocusOuter,
      outlineOffset: strokeWidth.thin,
      outlineStyle: 'solid',
      outlineWidth: strokeWidth.thick,
    },
  };
}

const getHeaderFocusStyle = getThemedStateStyleFactory('Accordion.headerFocus', createHeaderFocusStyleDefinition, [['focused']]);

const headerBackgroundStateLevels = [['pressed', 'hovered']] as const;
type HeaderBackgroundStateLevels = typeof headerBackgroundStateLevels;

const headerBackgroundDefinition: ColorStyleDefinition<ViewColorStyle, HeaderBackgroundStateLevels> = {
  backgroundColor: 'backgroundNeutralTransparent',
  hovered: {
    backgroundColor: 'backgroundNeutralSubtle',
  },
  pressed: {
    backgroundColor: 'backgroundNeutralSubtle',
  },
};

const headerForegroundDefinition: ColorStyleDefinition<TextColorStyle, HeaderBackgroundStateLevels> = {
  color: 'foregroundNeutralPrimary',
};

const bodyForegroundDefinition: ColorStyleDefinition<TextColorStyle, SizeStateLevels> = {
  color: 'foregroundNeutralPrimary',
};

const getHeaderBackgroundStyle = getThemedColorStyleFactory<ViewColorStyle, HeaderBackgroundStateLevels>(
  'Accordion.headerBackground',
  headerBackgroundDefinition,
  headerBackgroundStateLevels,
);

const getHeaderForegroundStyle = getThemedColorStyleFactory<TextColorStyle, HeaderBackgroundStateLevels>(
  'Accordion.headerForeground',
  headerForegroundDefinition,
  headerBackgroundStateLevels,
);

const getBodyForegroundStyle = getThemedColorStyleFactory<TextColorStyle, SizeStateLevels>(
  'Accordion.bodyForeground',
  bodyForegroundDefinition,
  sizeStateLevels,
);

const layoutStateLevels = [['chevronStart', 'chevronEnd']] as const;
type LayoutStateLevels = typeof layoutStateLevels;

const titleLayoutStyleDefinition: StyleDefinition<TextStyle, LayoutStateLevels> = {
  chevronStart: {
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
  },
  chevronEnd: {
    flexGrow: 0,
    flexShrink: 1,
  },
};

const chevronLayoutStyleDefinition: StyleDefinition<ViewStyle, LayoutStateLevels> = {
  chevronStart: {},
  chevronEnd: {
    marginStart: 'auto',
  },
};

const getTitleLayoutStyle = getStateStyleFactory<TextStyle, LayoutStateLevels>(titleLayoutStyleDefinition, layoutStateLevels);
const getChevronLayoutStyle = getStateStyleFactory<ViewStyle, LayoutStateLevels>(chevronLayoutStyleDefinition, layoutStateLevels);

const expansionStateLevels = [['collapsed', 'expanded']] as const;
type ExpansionStateLevels = typeof expansionStateLevels;

const chevronRotationStyleDefinition: StyleDefinition<ViewStyle, ExpansionStateLevels> = {
  collapsed: {
    transform: [{ rotate: '0deg' }],
  },
  expanded: {
    transform: [{ rotate: '90deg' }],
  },
};

const bodyVisibilityStyleDefinition: StyleDefinition<ViewStyle, ExpansionStateLevels> = {
  collapsed: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  expanded: {
    opacity: 1,
    overflow: 'visible',
  },
};

const getChevronRotationStyle = getStateStyleFactory<ViewStyle, ExpansionStateLevels>(
  chevronRotationStyleDefinition,
  expansionStateLevels,
);
const getBodyVisibilityStyle = getStateStyleFactory<ViewStyle, ExpansionStateLevels>(bodyVisibilityStyleDefinition, expansionStateLevels);

export function getAccordionHeaderLayoutStyle(state: AccordionState): ViewStyle {
  return getHeaderLayoutStyle(state, [state.size]);
}

export function getAccordionHeaderFocusStyle(state: AccordionState): ViewStyle | undefined {
  return state.focused ? getHeaderFocusStyle(state, ['focused']) : undefined;
}

export function getAccordionHeaderColorStyles(state: AccordionState): {
  background: ViewColorStyle;
  foreground: TextColorStyle;
} {
  const source = [state.pressed ? 'pressed' : undefined, state.hovered ? 'hovered' : undefined].filter(Boolean) as ('pressed' | 'hovered')[];
  return {
    background: getHeaderBackgroundStyle(state, source),
    foreground: getHeaderForegroundStyle(state, source),
  };
}

export function getAccordionTitleLayoutStyle(state: AccordionState): TextStyle {
  return getTitleLayoutStyle([state.layout]);
}

export function getAccordionTitleTypographyStyle(state: AccordionState): TextStyle {
  return getTitleTypographyStyle(state, [state.size]);
}

export function getAccordionBodyTypographyStyle(state: AccordionState): TextStyle {
  return getBodyTypographyStyle(state, [state.size]);
}

export function getAccordionBodyLayoutStyle(state: AccordionState): ViewStyle {
  return getBodyLayoutStyle(state, [state.size]);
}

export function getAccordionBodyForegroundStyle(state: AccordionState): TextStyle {
  return getBodyForegroundStyle(state, [state.size]);
}

export function getAccordionChevronLayoutStyle(state: AccordionState): ViewStyle {
  return getChevronLayoutStyle([state.layout]);
}

export function getAccordionChevronRotationStyle(state: AccordionState): ViewStyle {
  return getChevronRotationStyle([state.expanded ? 'expanded' : 'collapsed']);
}

export function getAccordionBodyVisibilityStyle(state: AccordionState): ViewStyle {
  return getBodyVisibilityStyle([state.expanded ? 'expanded' : 'collapsed']);
}

export function getAccordionIconSize(): number {
  return size160;
}
