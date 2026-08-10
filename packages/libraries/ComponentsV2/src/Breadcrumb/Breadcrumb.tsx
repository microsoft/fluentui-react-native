import * as React from 'react';
import type { AccessibilityActionEvent } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useKeyProps, usePressableState } from '@fluentui/react-native';
import { useFluentTheme } from '@fluentui-react-native/framework';
import { Path, Svg } from 'react-native-svg';

import { breadcrumbTokens } from './Breadcrumb.tokens';
import type {
  BreadcrumbButtonProps,
  BreadcrumbDividerProps,
  BreadcrumbFocusMode,
  BreadcrumbItemProps,
  BreadcrumbProps,
  BreadcrumbSize,
  PartitionBreadcrumbItems,
  PartitionBreadcrumbItemsOptions,
} from './Breadcrumb.types';

const DEFAULT_OVERFLOW_INDEX = 1;
const DEFAULT_MAX_DISPLAYED_ITEMS = 6;
const DEFAULT_MAX_NAME_LENGTH = 30;

interface BreadcrumbContextValue {
  focusMode: BreadcrumbFocusMode;
  size: BreadcrumbSize;
}

const BreadcrumbContext = React.createContext<BreadcrumbContextValue>({
  focusMode: 'tab',
  size: 'medium',
});

export const isTruncatableBreadcrumbContent = (content: string, maxLength: number): boolean =>
  content.length > maxLength;

export const truncateBreadcrumbLongName = (content: string, maxLength = DEFAULT_MAX_NAME_LENGTH): string =>
  isTruncatableBreadcrumbContent(content, maxLength)
    ? `${content.trim().slice(0, maxLength)}...`
    : content;

export const partitionBreadcrumbItems = <T,>(
  options: PartitionBreadcrumbItemsOptions<T>,
): PartitionBreadcrumbItems<T> => {
  const { items = [] } = options;
  const itemsCount = items.length;
  const maxDisplayedItems =
    options.maxDisplayedItems && options.maxDisplayedItems >= 0
      ? options.maxDisplayedItems
      : DEFAULT_MAX_DISPLAYED_ITEMS;
  let overflowIndex = options.overflowIndex ?? DEFAULT_OVERFLOW_INDEX;
  let startDisplayedItems = items.slice(0, overflowIndex);
  let overflowItems: readonly T[] | undefined;
  let endDisplayedItems: readonly T[] | undefined;
  const numberItemsToHide = itemsCount - maxDisplayedItems;

  if (numberItemsToHide > 0) {
    overflowIndex = overflowIndex >= maxDisplayedItems ? maxDisplayedItems - 1 : overflowIndex;
    const overflowEndIndex = overflowIndex + numberItemsToHide;
    startDisplayedItems = startDisplayedItems.slice(0, overflowIndex);
    overflowItems = items.slice(overflowIndex, overflowEndIndex);
    if (overflowEndIndex < itemsCount) {
      endDisplayedItems = items.slice(overflowEndIndex, itemsCount);
    }
  } else if (overflowIndex < itemsCount) {
    endDisplayedItems = items.slice(overflowIndex, itemsCount);
  }

  return { startDisplayedItems, overflowItems, endDisplayedItems };
};

export const Breadcrumb = React.forwardRef<View, BreadcrumbProps>((props, ref) => {
  const {
    accessibilityLabel = 'breadcrumb',
    children,
    focusMode = 'tab',
    size = 'medium',
    style,
    ...rest
  } = props;
  const contextValue = React.useMemo(() => ({ focusMode, size }), [focusMode, size]);

  return (
    <BreadcrumbContext.Provider value={contextValue}>
      <View
        {...rest}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="list"
        ref={ref}
        style={[styles.breadcrumb, { columnGap: breadcrumbTokens.gap }, style]}
      >
        {children}
      </View>
    </BreadcrumbContext.Provider>
  );
});

Breadcrumb.displayName = 'Breadcrumb';

export const BreadcrumbItem = React.forwardRef<View, BreadcrumbItemProps>((props, ref) => {
  const { children, size, style, ...rest } = props;
  const context = React.useContext(BreadcrumbContext);
  const resolvedSize = size ?? context.size;

  return (
    <View
      {...rest}
      accessibilityRole="text"
      ref={ref}
      style={[styles.item, { minHeight: breadcrumbTokens.sizes[resolvedSize].buttonHeight }, style]}
    >
      {children}
    </View>
  );
});

BreadcrumbItem.displayName = 'BreadcrumbItem';

export const BreadcrumbButton = React.forwardRef<React.ElementRef<typeof Pressable>, BreadcrumbButtonProps>(
  (props, ref) => {
    const {
      accessibilityActions,
      accessibilityHint,
      accessibilityLabel,
      accessibilityRole,
      accessibilityState,
      children,
      current = false,
      disabled = false,
      disabledFocusable = false,
      focusable,
      icon,
      onAccessibilityAction,
      onPress,
      size,
      style,
      testID,
      tooltip,
      truncate = true,
      ...rest
    } = props;
    const context = React.useContext(BreadcrumbContext);
    const theme = useFluentTheme();
    const resolvedSize = size ?? context.size;
    const sizeTokens = breadcrumbTokens.sizes[resolvedSize];
    const semanticallyDisabled = disabled || current;
    const nativeDisabled = disabled && !disabledFocusable;
    const maxLength = typeof truncate === 'number' ? truncate : DEFAULT_MAX_NAME_LENGTH;
    const stringContent = typeof children === 'string' ? children : undefined;
    const isTruncated =
      truncate !== false &&
      stringContent !== undefined &&
      isTruncatableBreadcrumbContent(stringContent, maxLength);
    const visibleContent =
      isTruncated && stringContent !== undefined
        ? truncateBreadcrumbLongName(stringContent, maxLength)
        : children;
    const resolvedHint = tooltip ?? (isTruncated ? stringContent : accessibilityHint);

    const handlePress = React.useCallback(
      (event: unknown) => {
        if (!semanticallyDisabled) {
          onPress?.(event as Parameters<NonNullable<BreadcrumbButtonProps['onPress']>>[0]);
        }
      },
      [onPress, semanticallyDisabled],
    );
    const handleAccessibilityAction = React.useCallback(
      (event: AccessibilityActionEvent) => {
        if (event.nativeEvent.actionName.toLocaleLowerCase() === 'activate' && !semanticallyDisabled) {
          handlePress(event);
        }
        onAccessibilityAction?.(event);
      },
      [handlePress, onAccessibilityAction, semanticallyDisabled],
    );
    const pressable = usePressableState({
      ...rest,
      disabled: nativeDisabled,
      onPress: handlePress,
    });
    const keyProps = useKeyProps(handlePress, ' ');
    const hovered = !!pressable.state.hovered;
    const pressed = !!pressable.state.pressed;
    const focused = !!pressable.state.focused;
    const foregroundColor = disabled
      ? theme.colors.neutralForegroundDisabled
      : pressed
        ? theme.colors.neutralForeground2BrandPressed
        : hovered
          ? theme.colors.neutralForeground2BrandHover
          : theme.colors.neutralForeground2;
    const backgroundColor = semanticallyDisabled
      ? theme.colors.transparentBackground
      : pressed
        ? theme.colors.subtleBackgroundPressed
        : hovered
          ? theme.colors.subtleBackgroundHover
          : theme.colors.transparentBackground;
    const resolvedStyle = typeof style === 'function' ? style({ pressed }) : style;
    const mergedAccessibilityActions = React.useMemo(
      () => [{ name: 'activate' as const }, ...(accessibilityActions ?? [])],
      [accessibilityActions],
    );

    return (
      <Pressable
        {...pressable.props}
        {...keyProps}
        accessibilityActions={mergedAccessibilityActions}
        accessibilityHint={resolvedHint}
        accessibilityLabel={accessibilityLabel ?? stringContent}
        accessibilityRole={accessibilityRole ?? 'button'}
        accessibilityState={{
          ...accessibilityState,
          disabled: semanticallyDisabled,
          selected: current || accessibilityState?.selected,
        }}
        aria-current={current ? 'page' : undefined}
        focusable={focusable ?? (!nativeDisabled || disabledFocusable)}
        onAccessibilityAction={handleAccessibilityAction}
        ref={ref}
        style={[
          styles.button,
          {
            backgroundColor,
            minHeight: sizeTokens.buttonHeight,
            paddingHorizontal: sizeTokens.paddingHorizontal,
          },
          resolvedStyle,
        ]}
        testID={testID}
      >
        {icon ? (
          <View
            accessible={false}
            focusable={false}
            style={[
              styles.icon,
              {
                height: sizeTokens.iconSize,
                marginRight: 4,
                width: sizeTokens.iconSize,
              },
            ]}
          >
            {icon}
          </View>
        ) : null}
        {typeof visibleContent === 'string' || typeof visibleContent === 'number' ? (
          <Text
            numberOfLines={1}
            style={{
              color: foregroundColor,
              fontFamily: 'Segoe UI',
              fontSize: sizeTokens.fontSize,
              fontWeight: current ? '600' : '400',
              lineHeight: sizeTokens.lineHeight,
            }}
          >
            {visibleContent}
          </Text>
        ) : (
          visibleContent
        )}
        {focused && !nativeDisabled ? (
          <>
            <View
              accessible={false}
              focusable={false}
              pointerEvents="none"
              style={[styles.focusOuter, { borderColor: theme.colors.strokeFocus2 }]}
            />
            <View
              accessible={false}
              focusable={false}
              pointerEvents="none"
              style={[styles.focusInner, { borderColor: theme.colors.strokeFocus1 }]}
            />
          </>
        ) : null}
      </Pressable>
    );
  },
);

BreadcrumbButton.displayName = 'BreadcrumbButton';

export const BreadcrumbDivider = React.forwardRef<View, BreadcrumbDividerProps>((props, ref) => {
  const { children, size, style, ...rest } = props;
  const context = React.useContext(BreadcrumbContext);
  const theme = useFluentTheme();
  const resolvedSize = size ?? context.size;
  const dividerSize = breadcrumbTokens.sizes[resolvedSize].dividerSize;

  return (
    <View
      {...rest}
      accessible={false}
      focusable={false}
      importantForAccessibility="no"
      ref={ref}
      style={[styles.divider, { height: dividerSize, width: dividerSize }, style]}
    >
      {children ?? (
        <Svg height={dividerSize} viewBox="0 0 16 16" width={dividerSize}>
          <Path
            d="M5.65 3.15a.5.5 0 000 .7L9.79 8l-4.14 4.15a.5.5 0 00.7.7l4.5-4.5a.5.5 0 000-.7l-4.5-4.5a.5.5 0 00-.7 0z"
            fill={theme.colors.neutralForeground2}
          />
        </Svg>
      )}
    </View>
  );
});

BreadcrumbDivider.displayName = 'BreadcrumbDivider';

const styles = StyleSheet.create({
  breadcrumb: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  button: {
    alignItems: 'center',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 0,
    position: 'relative',
  },
  divider: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
  focusInner: {
    borderRadius: 3,
    borderWidth: 1,
    bottom: 1,
    left: 1,
    position: 'absolute',
    right: 1,
    top: 1,
  },
  focusOuter: {
    borderRadius: 5,
    borderWidth: 2,
    bottom: -2,
    left: -2,
    position: 'absolute',
    right: -2,
    top: -2,
  },
  icon: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
  },
});
