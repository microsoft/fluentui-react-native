import * as React from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useFluentTheme } from '@fluentui-react-native/framework';

import { Avatar } from '../Avatar';
import type { AvatarSize } from '../Avatar';
import { avatarGroupSizeTokens } from './AvatarGroup.tokens';
import type {
  AvatarGroupItemProps,
  AvatarGroupLayout,
  AvatarGroupOverflowIndicatorProps,
  AvatarGroupPartition,
  AvatarGroupProps,
} from './AvatarGroup.types';

interface AvatarGroupContextValue {
  layout: AvatarGroupLayout;
  size: AvatarSize;
}

const AvatarGroupContext = React.createContext<AvatarGroupContextValue>({ layout: 'spread', size: 32 });

export function partitionAvatarGroupItems<T>(
  items: readonly T[],
  maxItems: number = 5,
  layout: AvatarGroupLayout = 'spread',
): AvatarGroupPartition<T> {
  const normalizedMax = Math.max(0, Math.floor(maxItems));
  if (layout === 'pie') {
    return {
      inlineItems: items.slice(0, Math.min(3, normalizedMax)),
      overflowItems: items.length > 3 ? [...items] : [],
    };
  }
  if (items.length <= normalizedMax) {
    return {
      inlineItems: [...items],
      overflowItems: [],
    };
  }
  const inlineCount = Math.max(0, normalizedMax - 1);
  return {
    inlineItems: inlineCount > 0 ? items.slice(-inlineCount) : [],
    overflowItems: inlineCount > 0 ? items.slice(0, -inlineCount) : [...items],
  };
}

function nativeTitleProps(tooltip?: string): ViewProps {
  return tooltip ? ({ title: tooltip } as unknown as ViewProps) : {};
}

export const AvatarGroupItem = React.forwardRef<React.ElementRef<typeof View>, AvatarGroupItemProps>((props, ref) => {
  const { accessibilityHint, size, style, tooltip, ...rest } = props;
  const context = React.useContext(AvatarGroupContext);
  const theme = useFluentTheme();
  const resolvedSize = size ?? context.size;

  return (
    <Avatar
      {...nativeTitleProps(tooltip)}
      {...rest}
      accessibilityHint={accessibilityHint ?? tooltip}
      ref={ref}
      size={resolvedSize}
      style={[
        context.layout === 'stack' && {
          borderColor: theme.colors.neutralBackground2,
          borderWidth: avatarGroupSizeTokens[resolvedSize].pieDividerWidth,
          overflow: 'hidden',
        },
        style,
      ]}
    />
  );
});

AvatarGroupItem.displayName = 'AvatarGroupItem';

export const AvatarGroupOverflowIndicator = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  AvatarGroupOverflowIndicatorProps
>((props, ref) => {
  const {
    accessibilityHint,
    accessibilityLabel,
    appearance = 'count',
    count = 0,
    icon,
    onPress,
    size,
    style,
    testID,
    tooltip,
    ...rest
  } = props;
  const theme = useFluentTheme();
  const context = React.useContext(AvatarGroupContext);
  const resolvedSize = size ?? context.size;
  const tokens = avatarGroupSizeTokens[resolvedSize];

  return (
    <Pressable
      {...nativeTitleProps(tooltip)}
      {...rest}
      accessibilityHint={accessibilityHint ?? tooltip}
      accessibilityLabel={accessibilityLabel ?? (appearance === 'count' ? `${count} more` : tooltip)}
      accessibilityRole={onPress ? 'button' : 'image'}
      accessible
      onPress={onPress}
      ref={ref}
      style={[
        styles.indicator,
        {
          backgroundColor: theme.colors.neutralBackground1,
          borderColor: theme.colors.neutralStroke1,
          borderRadius: resolvedSize / 2,
          borderWidth: tokens.indicatorBorderWidth,
          height: resolvedSize,
          width: resolvedSize,
        },
        style,
      ]}
      testID={testID}
    >
      {appearance === 'icon' && icon !== undefined ? (
        icon
      ) : (
        <Text
          style={{
            color: theme.colors.neutralForeground3,
            fontFamily: 'Segoe UI',
            fontSize: tokens.indicatorFontSize,
            fontWeight: '600',
          }}
        >
          {appearance === 'icon' ? '\u2026' : `+${count}`}
        </Text>
      )}
    </Pressable>
  );
});

AvatarGroupOverflowIndicator.displayName = 'AvatarGroupOverflowIndicator';

function renderPieItems(
  items: readonly React.ReactNode[],
  size: AvatarSize,
  dividerWidth: number,
  testID?: string,
): React.ReactNode {
  if (items.length === 1) {
    return (
      <View style={styles.pieSegment} testID={testID ? `${testID}-pie-segment-0` : undefined}>
        {items[0]}
      </View>
    );
  }

  const halfSize = size / 2;
  const quarterSize = size / 4;
  return items.slice(0, 3).map((item, index) => {
    const isPrimary = index === 0;
    const isThreeItemPie = items.length >= 3;
    const segmentStyle: ViewStyle = isPrimary
      ? {
          bottom: 0,
          left: 0,
          top: 0,
          width: halfSize - dividerWidth / 2,
        }
      : isThreeItemPie
        ? {
            height: halfSize - dividerWidth / 2,
            left: halfSize + dividerWidth / 2,
            top: index === 1 ? 0 : halfSize + dividerWidth / 2,
            width: halfSize - dividerWidth / 2,
          }
        : {
            bottom: 0,
            left: halfSize + dividerWidth / 2,
            top: 0,
            width: halfSize - dividerWidth / 2,
          };

    return (
      <View
        key={React.isValidElement(item) && item.key != null ? item.key : index}
        pointerEvents="box-none"
        style={[styles.pieSegment, segmentStyle]}
        testID={testID ? `${testID}-pie-segment-${index}` : undefined}
      >
        <View
          style={{
            left: -quarterSize,
            position: 'absolute',
            top: isPrimary || !isThreeItemPie ? 0 : -quarterSize,
            transform: isPrimary || !isThreeItemPie ? undefined : [{ scale: 0.5 }],
          }}
        >
          {item}
        </View>
      </View>
    );
  });
}

export const AvatarGroup = React.forwardRef<React.ElementRef<typeof View>, AvatarGroupProps>((props, ref) => {
  const {
    children,
    layout = 'spread',
    maxItems,
    overflowIcon,
    overflowIndicatorAppearance,
    overflowTooltip,
    size = 32,
    style,
    testID,
    ...rest
  } = props;
  const [overflowOpen, setOverflowOpen] = React.useState(false);
  const theme = useFluentTheme();
  const allItems = React.Children.toArray(children);
  const explicitIndicatorIndex = allItems.findIndex(
    child => React.isValidElement(child) && child.type === AvatarGroupOverflowIndicator,
  );
  const explicitIndicator = explicitIndicatorIndex >= 0 ? allItems[explicitIndicatorIndex] : undefined;
  const avatarItems =
    explicitIndicatorIndex >= 0 ? allItems.filter((_, index) => index !== explicitIndicatorIndex) : allItems;
  const requestedMax = maxItems ?? avatarItems.length;
  const { inlineItems, overflowItems } = partitionAvatarGroupItems(avatarItems, requestedMax, layout);
  const generatedIndicator =
    overflowItems.length > 0 ? (
      <AvatarGroupOverflowIndicator
        appearance={overflowIndicatorAppearance ?? (size < 24 ? 'icon' : 'count')}
        count={overflowItems.length}
        icon={overflowIcon}
        onPress={() => setOverflowOpen(open => !open)}
        testID={testID ? `${testID}-overflow` : undefined}
        tooltip={overflowTooltip}
      />
    ) : undefined;
  const indicator = explicitIndicator ?? generatedIndicator;
  const displayItems = indicator ? [...inlineItems, indicator] : [...inlineItems];
  const tokens = avatarGroupSizeTokens[size];
  const resolvedStyle: StyleProp<ViewStyle> = style;

  return (
    <AvatarGroupContext.Provider value={{ layout, size }}>
      <View
        {...rest}
        ref={ref}
        style={[styles.container, resolvedStyle]}
        testID={testID}
      >
        <View
          style={[
            styles.root,
            layout === 'spread' && { gap: tokens.spreadGap },
            layout === 'pie' && {
              borderRadius: size / 2,
              height: size,
              overflow: 'hidden',
              width: size,
            },
          ]}
        >
          {layout === 'pie' ? (
            <>
              {renderPieItems(inlineItems.slice(0, 3), size, tokens.pieDividerWidth, testID)}
              {indicator ? (
                <View pointerEvents="box-none" style={styles.pieIndicator}>
                  {indicator}
                </View>
              ) : null}
            </>
          ) : (
            displayItems.map((item, index) => (
                <View
                  key={React.isValidElement(item) && item.key != null ? item.key : index}
                  pointerEvents="box-none"
                  style={
                    layout === 'stack'
                      ? {
                          marginLeft: index > 0 ? -tokens.stackOverlap : 0,
                          zIndex: displayItems.length - index,
                        }
                      : undefined
                  }
                  testID={testID ? `${testID}-item-${index}` : undefined}
                >
                  {item}
                </View>
              ))
          )}
        </View>
        {overflowOpen && overflowItems.length > 0 ? (
          <AvatarGroupContext.Provider value={{ layout: 'spread', size }}>
            <ScrollView
              nestedScrollEnabled
              style={[
                styles.overflowPopover,
                {
                  backgroundColor: theme.colors.neutralBackground1,
                  borderColor: theme.colors.neutralStroke1,
                  top: size + 8,
                },
              ]}
              testID={testID ? `${testID}-popover` : undefined}
            >
              {overflowItems.map((item, index) => {
                const name =
                  React.isValidElement<AvatarGroupItemProps>(item) && typeof item.props.name === 'string'
                    ? item.props.name
                    : undefined;
                return (
                  <View
                    key={React.isValidElement(item) && item.key != null ? item.key : index}
                    style={styles.overflowRow}
                  >
                    {item}
                    {name ? (
                      <Text style={[styles.overflowLabel, { color: theme.colors.neutralForeground1 }]}>{name}</Text>
                    ) : null}
                  </View>
                );
              })}
            </ScrollView>
          </AvatarGroupContext.Provider>
        ) : null}
      </View>
    </AvatarGroupContext.Provider>
  );
});

AvatarGroup.displayName = 'AvatarGroup';

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    position: 'relative',
  },
  indicator: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pieSegment: {
    overflow: 'hidden',
    position: 'absolute',
  },
  pieIndicator: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
  },
  overflowLabel: {
    fontFamily: 'Segoe UI',
    fontSize: 14,
  },
  overflowPopover: {
    borderRadius: 4,
    borderWidth: 1,
    elevation: 8,
    left: 0,
    maxHeight: 220,
    minWidth: 220,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    zIndex: 1000,
  },
  overflowRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  root: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
