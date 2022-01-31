/** @jsx withSlots */
import { View } from 'react-native';
import { badgeName, BadgeType, BadgeProps } from './Badge.types';
import { Text } from '@fluentui-react-native/experimental-text';
import {
  compose,
  withSlots,
  UseSlots,
  mergeProps,
  compressible,
  UseTokens,
  buildUseTokens,
  useFluentTheme,
  mergeStyles,
  applyTokenLayers,
} from '@fluentui-react-native/framework';
import { BadgeTokens } from '.';
import { Icon } from '@fluentui-react-native/icon';
import { createIconProps } from '@fluentui-react-native/interactive-hooks';
import { stylingSettings } from './Badge.styling';
import { useBadge } from './useBadge';

export const badgeLookup = (layer: string, userProps: BadgeProps): boolean => {
  return (
    userProps[layer] ||
    layer === userProps['appearance'] ||
    (!userProps['appearance'] && layer === 'filled') ||
    layer === userProps['size'] ||
    (!userProps['size'] && layer === 'large') ||
    layer === userProps['shape'] ||
    (!userProps['shape'] && layer === 'rounded')
  );
};

export const Badge = compose<BadgeType>({
  displayName: badgeName,
  ...stylingSettings,
  slots: {
    root: View,
    icon: Icon,
    text: Text,
  },
  render: (userProps: BadgeProps, useSlots: UseSlots<BadgeType>) => {
    const iconProps = createIconProps(userProps.icon);
    const badge = useBadge(userProps);

    const Slots = useSlots(userProps, (layer) => badgeLookup(layer, userProps));

    return (final: BadgeProps, ...children: React.ReactNode[]) => {
      const { text, icon, iconPosition = 'before', ...mergedProps } = mergeProps(badge, final);
      return (
        <Slots.root {...mergedProps}>
          {icon && iconPosition === 'before' && <Slots.icon {...iconProps} />}
          {text && <Slots.text key="text">{text}</Slots.text>}
          {icon && iconPosition === 'after' && <Slots.icon {...iconProps} />}
          {children}
        </Slots.root>
      );
    };
  },
});

export default Badge;

const useBadgeTokens = buildUseTokens<BadgeTokens>(
  (t) => ({
    backgroundColor: t.colors.brandBackground,
    borderRadius: 9999,
    minWidth: 32,
    height: 32,
  }),
  badgeName,
);

// In future it'll be good to use compessible for Badge because it will make the component more flexible
export const CompressibleBadge = compressible<BadgeProps, BadgeTokens>((props: BadgeProps, useTokens: UseTokens<BadgeTokens>) => {
  const { text, ...rest } = props;
  const theme = useFluentTheme();
  let [tokens, cache] = useTokens(theme);

  [tokens, cache] = applyTokenLayers(tokens, ['outline, filled, circular, square, rounded'], cache, (state) => props[state]);

  const [tokenStyle] = cache(
    () => ({
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'row',
      alignSelf: 'flex-start',
      justifyContent: 'center',
      minWidth: tokens.minWidth,
      height: tokens.height,
      margin: 0,
      backgroundColor: tokens.backgroundColor,
      borderRadius: tokens.borderRadius,
      color: '#fff',
      paddingHorizontal: 20,
    }),
    ['borderRadius', 'minWidth', 'height', 'backgroundColor'],
  );

  return (extra: BadgeProps, children: React.ReactNode) => {
    const mergedProps = { text, tokenStyle, ...rest, ...extra, style: mergeStyles(tokenStyle) };
    return (
      <View {...mergedProps}>
        {text && <Text {...tokenStyle}>{text}</Text>}
        {children}
      </View>
    );
  };
}, useBadgeTokens);
