import type { TextStyle, ViewStyle } from 'react-native';
import type { ThemeState } from '@fluentui-react-native/design';
import {
  alignItemsToken,
  alignSelfToken,
  colorToken,
  defineComponentTokens,
  dimensionToken,
  flexDirectionToken,
  getComponentTokens,
  getGapStyleValue,
  justifyContentToken,
  numericToken,
  overflowToken,
  positionToken,
  resolveTokenStates,
  stringToken,
} from '@fluentui-react-native/design/styling';
import type { ComponentTokenPatch } from '@fluentui-react-native/design/styling';
import { iconTokenProps } from '../../common/iconTokenProps';
import type { IconElementProps } from '../../primitives/icon/icon.types';
import type { ProgressBarStatus } from './progress-bar.types';
import schema from './spec/tokens.json' with { type: 'json' };

type ProgressBarTokenState = { status: ProgressBarStatus };
const domains = {
  root: { style: { alignSelf: alignSelfToken, flexShrink: numericToken, gap: getGapStyleValue }, props: {} },
  header: {
    style: {
      alignItems: alignItemsToken,
      flexDirection: flexDirectionToken,
      gap: getGapStyleValue,
      justifyContent: justifyContentToken,
      minWidth: dimensionToken,
    },
    props: {},
  },
  trailing: {
    style: { alignItems: alignItemsToken, flexDirection: flexDirectionToken, flexShrink: numericToken, gap: getGapStyleValue },
    props: {},
  },
  label: {
    style: {
      color: colorToken,
      flexGrow: numericToken,
      flexShrink: numericToken,
      fontFamily: stringToken,
      fontSize: numericToken,
      lineHeight: numericToken,
      minWidth: dimensionToken,
    },
    props: {},
  },
  valueText: { style: { color: colorToken, fontFamily: stringToken, fontSize: numericToken, lineHeight: numericToken }, props: {} },
  track: {
    style: {
      backgroundColor: colorToken,
      borderRadius: numericToken,
      height: dimensionToken,
      overflow: overflowToken,
      position: positionToken,
    },
    props: {},
  },
  indicator: {
    style: {
      backgroundColor: colorToken,
      borderRadius: numericToken,
      bottom: numericToken,
      start: numericToken,
      position: positionToken,
      top: numericToken,
    },
    props: {},
  },
  validationIcon: { style: {}, props: iconTokenProps },
};

declare module '@fluentui-react-native/design' {
  interface ComponentTokenRegistry {
    'furn.progress-bar': ComponentTokenPatch<ProgressBarTokenState, typeof domains>;
  }
}

const progressBarTokens = defineComponentTokens<ProgressBarTokenState, typeof domains>({ id: 'furn.progress-bar', slots: domains, schema });

export type ProgressBarThemeStyles = {
  root: ViewStyle;
  header: ViewStyle;
  trailing: ViewStyle;
  label: TextStyle;
  valueText: TextStyle;
  track: ViewStyle;
  indicator: ViewStyle;
  validationIcon: Pick<IconElementProps, 'color' | 'height' | 'width'>;
};

export function getProgressBarThemeStyles(theme: ThemeState, status: ProgressBarStatus): ProgressBarThemeStyles {
  const tokens = getComponentTokens(theme, progressBarTokens);
  const state = { status };
  return {
    root: resolveTokenStates(tokens.root, state).style,
    header: resolveTokenStates(tokens.header, state).style,
    trailing: resolveTokenStates(tokens.trailing, state).style,
    label: resolveTokenStates(tokens.label, state).style,
    valueText: resolveTokenStates(tokens.valueText, state).style,
    track: resolveTokenStates(tokens.track, state).style,
    indicator: resolveTokenStates(tokens.indicator, state).style,
    validationIcon: resolveTokenStates(tokens.validationIcon, state).props,
  };
}
