import { useMemo } from 'react';
import { ViewProps, ColorValue } from 'react-native';
import { Theme } from '@fluentui-react-native/framework';
import { IconPropsV1 as IconProps } from '@fluentui-react-native/icon';
import { TextProps } from '@fluentui-react-native/text';
import { DividerTokens, DividerProps } from './Divider.types';

const getIconProps = (contentColor: ColorValue, icon: IconProps): IconProps => {
  if (icon.fontSource) {
    return {
      fontSource: {
        ...icon.fontSource,
        color: contentColor,
      },
    };
  } else if (icon.svgSource) {
    return {
      svgSource: {
        ...icon.svgSource,
        color: contentColor,
      },
    };
  } else {
    throw new Error('IconProps require either a fontSource or svgSource; neither has been passed.');
  }
};

export const useDividerSlotProps = (props: DividerProps, tokens: DividerTokens) => {
  const rootProps: ViewProps = useMemo(
    () => ({
      style: {
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        minWidth: tokens.minWidth,
        maxWidth: tokens.maxWidth,
        minHeight: tokens.minHeight,
        maxHeight: tokens.maxHeight,
        padding: tokens.padding,
        paddingStart: tokens.paddingStart,
        paddingEnd: tokens.paddingEnd,
        paddingHorizontal: tokens.paddingHorizontal,
        paddingVertical: tokens.paddingVertical,
        ...(props.vertical
          ? {
              flexDirection: 'column',
              paddingVertical: props.insetSize,
              height: '100%',
            }
          : {
              flexDirection: 'row',
              paddingHorizontal: props.insetSize,
            }),
      },
    }),
    [
      props.vertical,
      props.insetSize,
      tokens.minHeight,
      tokens.maxHeight,
      tokens.minWidth,
      tokens.maxWidth,
      tokens.padding,
      tokens.paddingHorizontal,
      tokens.paddingVertical,
      tokens.paddingStart,
      tokens.paddingEnd,
    ],
  );

  const beforeLineProps: ViewProps = useMemo(
    () => ({
      style: {
        flexBasis: tokens.minLineSize,
        flex: tokens.flexBefore,
        borderColor: tokens.lineColor,
        borderStyle: 'solid',
        ...(props.vertical
          ? { borderLeftWidth: tokens.thickness, minHeight: tokens.minLineSize }
          : { borderTopWidth: tokens.thickness, minWidth: tokens.minLineSize }),
      },
    }),
    [tokens.flexBefore, tokens.lineColor, tokens.minLineSize, tokens.thickness, props.vertical],
  );

  const afterLineProps: ViewProps = useMemo(
    () => ({
      style: {
        flexBasis: tokens.minLineSize,
        flex: tokens.flexAfter,
        borderColor: tokens.lineColor,
        borderStyle: 'solid',
        ...(props.vertical
          ? { borderLeftWidth: tokens.thickness, minHeight: tokens.minLineSize }
          : { borderTopWidth: tokens.thickness, minWidth: tokens.minLineSize }),
      },
    }),
    [tokens.flexAfter, tokens.lineColor, tokens.minLineSize, tokens.thickness, props.vertical],
  );

  const wrapperProps: ViewProps = useMemo(
    () => ({
      style: {
        flex: 0,
        ...(props.vertical ? { paddingVertical: tokens.contentPadding } : { paddingHorizontal: tokens.contentPadding }),
      },
    }),
    [tokens.contentPadding, props.vertical],
  );

  const textProps: TextProps = useMemo(
    () => ({
      style: {
        color: tokens.contentColor,
      },
    }),
    [tokens.contentColor],
  );

  const iconProps: IconProps = useMemo(
    () => (props.icon ? getIconProps(tokens.contentColor, props.icon) : {}),
    [props.icon, tokens.contentColor],
  );

  return { rootProps, beforeLineProps, afterLineProps, wrapperProps, textProps, iconProps };
};

/**
 * Helper function to set color tokens on divider. Fills tokens either (1) by using a passed color prop or (2) using the appearance
 * prop and grabbing the correct color tokens, which change based on set appearance, from the current theme.
 */
export const colorsFromPropsAndTheme = (props: DividerProps, theme: Theme): Pick<DividerTokens, 'contentColor' | 'lineColor'> => {
  if (props.color) {
    return {
      contentColor: props.color,
      lineColor: props.color,
    };
  }
  switch (props.appearance) {
    case 'default':
      return {
        contentColor: theme.colors.neutralForeground2,
        lineColor: theme.colors.neutralStroke2,
      };
    case 'subtle':
      return {
        contentColor: theme.colors.neutralForeground3,
        lineColor: theme.colors.neutralStroke3,
      };
    case 'brand':
      return {
        contentColor: theme.colors.brandForeground1,
        lineColor: theme.colors.brandStroke1,
      };
    case 'strong': {
      return {
        contentColor: theme.colors.neutralForeground1,
        lineColor: theme.colors.neutralStroke1,
      };
    }
  }
};
