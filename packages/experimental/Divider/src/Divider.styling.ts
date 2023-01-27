import { useMemo } from 'react';
import { ViewProps } from 'react-native';
import { Theme } from '@fluentui-react-native/framework';
import { IconPropsV1 as IconProps } from '@fluentui-react-native/icon';
import { TextProps } from '@fluentui-react-native/text';
import { DividerTokens, DividerAppearance } from './Divider.types';

const getIconProps = (tokens: DividerTokens, icon: IconProps): IconProps => {
  if (icon.fontSource) {
    return {
      fontSource: {
        ...icon.fontSource,
        color: tokens.color || tokens.contentColor,
      },
    };
  } else if (icon.svgSource) {
    return {
      svgSource: {
        ...icon.svgSource,
        color: tokens.color || tokens.contentColor,
      },
    };
  } else {
    throw new Error('IconProps require either a fontSource or svgSource; neither has been passed.');
  }
};

export const useDividerSlotProps = (tokens: DividerTokens, icon?: IconProps) => {
  const rootProps: ViewProps = useMemo(
    () => ({
      style: {
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        flexDirection: tokens.vertical ? 'column' : 'row',
        minWidth: tokens.minWidth,
        maxWidth: tokens.maxWidth,
        minHeight: tokens.minHeight,
        maxHeight: tokens.maxHeight,
        padding: tokens.padding,
        paddingStart: tokens.paddingStart,
        paddingEnd: tokens.paddingEnd,
        paddingHorizontal: tokens.paddingHorizontal,
        paddingVertical: tokens.paddingVertical,
        ...(tokens.vertical
          ? {
              paddingVertical: tokens.insetSize,
              height: '100%',
            }
          : {
              paddingHorizontal: tokens.insetSize,
            }),
      },
    }),
    [
      tokens.vertical,
      tokens.insetSize,
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
        borderColor: tokens.color || tokens.lineColor,
        borderStyle: 'solid',
        ...(tokens.vertical
          ? { borderLeftWidth: tokens.thickness, minHeight: tokens.minLineSize }
          : { borderTopWidth: tokens.thickness, minWidth: tokens.minLineSize }),
      },
    }),
    [tokens.color, tokens.flexBefore, tokens.lineColor, tokens.minLineSize, tokens.thickness, tokens.vertical],
  );

  const afterLineProps: ViewProps = useMemo(
    () => ({
      style: {
        flexBasis: tokens.minLineSize,
        flex: tokens.flexAfter,
        borderColor: tokens.color || tokens.lineColor,
        borderStyle: 'solid',
        ...(tokens.vertical
          ? { borderLeftWidth: tokens.thickness, minHeight: tokens.minLineSize }
          : { borderTopWidth: tokens.thickness, minWidth: tokens.minLineSize }),
      },
    }),
    [tokens.color, tokens.flexAfter, tokens.lineColor, tokens.minLineSize, tokens.thickness, tokens.vertical],
  );

  const wrapperProps: ViewProps = useMemo(
    () => ({
      style: {
        flex: 0,
        ...(tokens.vertical ? { paddingVertical: tokens.contentPadding } : { paddingHorizontal: tokens.contentPadding }),
      },
    }),
    [tokens.contentPadding, tokens.vertical],
  );

  const textProps: TextProps = useMemo(
    () => ({
      style: {
        color: tokens.color || tokens.contentColor,
      },
    }),
    [tokens.color, tokens.contentColor],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const iconProps: IconProps = useMemo(() => (icon ? getIconProps(tokens, icon) : {}), [icon, tokens.color, tokens.contentColor]);

  return { rootProps, beforeLineProps, afterLineProps, wrapperProps, textProps, iconProps };
};

export const colorsFromAppearance = (appearance: DividerAppearance, theme: Theme): Pick<DividerTokens, 'contentColor' | 'lineColor'> => {
  switch (appearance) {
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
