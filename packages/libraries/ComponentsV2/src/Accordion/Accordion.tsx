import * as React from 'react';
import type { AccessibilityActionEvent, ColorValue, LayoutChangeEvent } from 'react-native';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useKeyProps, usePressableState } from '@fluentui/react-native';
import { useFluentTheme } from '@fluentui-react-native/framework';
import { Path, Svg } from 'react-native-svg';

import {
  accordionHeaderSizeTokens,
  accordionMotionDuration,
  accordionPanelTokens,
} from './Accordion.tokens';
import type {
  AccordionHeaderProps,
  AccordionItemProps,
  AccordionItemValue,
  AccordionPanelProps,
  AccordionProps,
} from './Accordion.types';

interface AccordionContextValue {
  isOpen: (value: AccordionItemValue) => boolean;
  requestToggle: (event: Parameters<NonNullable<AccordionProps['onToggle']>>[0], value: AccordionItemValue) => void;
}

interface AccordionItemContextValue {
  disabled: boolean;
  open: boolean;
  value: AccordionItemValue;
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined);
const AccordionItemContext = React.createContext<AccordionItemContextValue | undefined>(undefined);
const accordionEasing = Easing.bezier(0.1, 0.9, 0.2, 1);

function normalizeOpenItems(
  items: readonly AccordionItemValue[] | undefined,
  multiple: boolean,
): AccordionItemValue[] {
  if (!items) {
    return [];
  }
  const uniqueItems = Array.from(new Set(items));
  return multiple ? uniqueItems : uniqueItems.slice(0, 1);
}

function useAccordionItemContext(componentName: string): AccordionItemContextValue {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error(`${componentName} must be rendered inside an AccordionItem.`);
  }
  return context;
}

function ExpandChevron({ color, size }: { color: ColorValue | undefined; size: number }): React.ReactElement {
  return (
    <Svg height={size} viewBox="0 0 20 20" width={size}>
      <Path
        d="M7.65 4.65a.5.5 0 0 1 .7 0l5 5a.5.5 0 0 1 0 .7l-5 5a.5.5 0 0 1-.7-.7L12.29 10 7.65 5.35a.5.5 0 0 1 0-.7Z"
        fill={color}
      />
    </Svg>
  );
}

export const Accordion = React.forwardRef<View, AccordionProps>((props, ref) => {
  const {
    children,
    collapsible = false,
    defaultOpenItems,
    multiple = false,
    onToggle,
    openItems,
    style,
    ...rest
  } = props;
  const [uncontrolledOpenItems, setUncontrolledOpenItems] = React.useState(() =>
    normalizeOpenItems(defaultOpenItems, multiple),
  );
  const currentOpenItems = normalizeOpenItems(openItems ?? uncontrolledOpenItems, multiple);

  const requestToggle = React.useCallback(
    (event: Parameters<NonNullable<AccordionProps['onToggle']>>[0], value: AccordionItemValue) => {
      const currentlyOpen = currentOpenItems.includes(value);
      let nextOpenItems: AccordionItemValue[];

      if (multiple) {
        if (currentlyOpen) {
          if (currentOpenItems.length <= 1 && !collapsible) {
            return;
          }
          nextOpenItems = currentOpenItems.filter(item => item !== value);
        } else {
          nextOpenItems = [...currentOpenItems, value];
        }
      } else {
        nextOpenItems = currentlyOpen && collapsible ? [] : [value];
      }

      if (openItems === undefined) {
        setUncontrolledOpenItems(nextOpenItems);
      }
      onToggle?.(event, { openItems: nextOpenItems, value });
    },
    [collapsible, currentOpenItems, multiple, onToggle, openItems],
  );

  const context = React.useMemo<AccordionContextValue>(
    () => ({
      isOpen: value => currentOpenItems.includes(value),
      requestToggle,
    }),
    [currentOpenItems, requestToggle],
  );

  return (
    <AccordionContext.Provider value={context}>
      <View {...rest} ref={ref} style={[styles.accordion, style]}>
        {children}
      </View>
    </AccordionContext.Provider>
  );
});

Accordion.displayName = 'Accordion';

export const AccordionItem = React.forwardRef<View, AccordionItemProps>((props, ref) => {
  const { children, disabled = false, style, value, ...rest } = props;
  const accordion = React.useContext(AccordionContext);
  if (!accordion) {
    throw new Error('AccordionItem must be rendered inside an Accordion.');
  }

  const context = React.useMemo<AccordionItemContextValue>(
    () => ({ disabled, open: accordion.isOpen(value), value }),
    [accordion, disabled, value],
  );

  return (
    <AccordionItemContext.Provider value={context}>
      <View {...rest} ref={ref} style={[styles.item, style]}>
        {children}
      </View>
    </AccordionItemContext.Provider>
  );
});

AccordionItem.displayName = 'AccordionItem';

export const AccordionHeader = React.forwardRef<React.ElementRef<typeof Pressable>, AccordionHeaderProps>(
  (props, ref) => {
    const {
      accessibilityActions,
      accessibilityLabel,
      accessibilityState,
      children,
      expandIcon,
      expandIconPosition = 'start',
      focusable,
      headingLevel = 2,
      icon,
      inline = false,
      onAccessibilityAction,
      size = 'medium',
      style,
      ...rest
    } = props;
    const accordion = React.useContext(AccordionContext);
    const item = useAccordionItemContext('AccordionHeader');
    const theme = useFluentTheme();
    const tokens = accordionHeaderSizeTokens[size];
    const rotation = React.useRef(new Animated.Value(item.open ? 1 : 0)).current;
    const [reduceMotion, setReduceMotion] = React.useState(false);

    React.useEffect(() => {
      let mounted = true;
      AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
        if (mounted) {
          setReduceMotion(enabled);
        }
      });
      const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
      return () => {
        mounted = false;
        subscription.remove();
      };
    }, []);

    React.useEffect(() => {
      const animation = Animated.timing(rotation, {
        duration: reduceMotion ? 0 : accordionMotionDuration,
        easing: accordionEasing,
        isInteraction: false,
        toValue: item.open ? 1 : 0,
        useNativeDriver: false,
      });
      animation.start();
      return () => animation.stop();
    }, [item.open, reduceMotion, rotation]);

    const requestToggle = React.useCallback(
      (event: Parameters<NonNullable<AccordionProps['onToggle']>>[0]) => {
        if (!item.disabled) {
          accordion?.requestToggle(event, item.value);
        }
      },
      [accordion, item.disabled, item.value],
    );
    const handleAccessibilityAction = React.useCallback(
      (event: AccessibilityActionEvent) => {
        if (event.nativeEvent.actionName === 'activate' || event.nativeEvent.actionName === 'toggle') {
          requestToggle(event);
        }
        onAccessibilityAction?.(event);
      },
      [onAccessibilityAction, requestToggle],
    );
    const pressable = usePressableState({ ...rest, disabled: item.disabled, onPress: requestToggle });
    const keyProps = useKeyProps(requestToggle, ' ', 'Enter');
    const resolvedStyle =
      typeof style === 'function' ? style({ pressed: !!pressable.state.pressed }) : style;
    const foreground = item.disabled
      ? theme.colors.neutralForegroundDisabled
      : pressable.state.pressed
        ? theme.colors.neutralForeground1
        : pressable.state.hovered
          ? theme.colors.neutralForeground2
          : theme.colors.neutralForeground1;
    const background = item.disabled
      ? 'transparent'
      : pressable.state.pressed
        ? theme.colors.subtleBackgroundPressed
        : pressable.state.hovered
          ? theme.colors.subtleBackgroundHover
          : theme.colors.subtleBackground;
    const iconElement = (
      <Animated.View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={{
          height: tokens.expandIconSize,
          transform: [
            {
              rotate: rotation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '90deg'],
              }),
            },
          ],
          width: tokens.expandIconSize,
        }}
      >
        {expandIcon ?? <ExpandChevron color={foreground} size={tokens.expandIconSize} />}
      </Animated.View>
    );

    return (
      <View accessibilityRole="header" aria-level={headingLevel}>
        <Pressable
          {...pressable.props}
          {...keyProps}
          accessibilityActions={accessibilityActions ?? [{ name: 'activate' }, { name: 'toggle' }]}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityState={{ ...accessibilityState, disabled: item.disabled, expanded: item.open }}
          focusable={focusable ?? !item.disabled}
          onAccessibilityAction={handleAccessibilityAction}
          ref={ref}
          style={[
            styles.header,
            {
              backgroundColor: background,
              gap: tokens.gap,
              minHeight: tokens.minHeight,
              paddingHorizontal: tokens.paddingHorizontal,
              paddingVertical: tokens.paddingVertical,
            },
            inline && styles.inlineHeader,
            resolvedStyle,
          ]}
        >
          {expandIconPosition === 'start' ? iconElement : null}
          {icon ? (
            <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.decorativeIcon}>
              {icon}
            </View>
          ) : null}
          <View style={inline ? styles.inlineContent : styles.headerContent}>
            {typeof children === 'string' || typeof children === 'number' ? (
              <Text
                style={{
                  color: foreground,
                  fontFamily: 'Segoe UI',
                  fontSize: tokens.fontSize,
                  fontWeight: tokens.fontWeight,
                  lineHeight: tokens.lineHeight,
                }}
              >
                {children}
              </Text>
            ) : (
              children
            )}
          </View>
          {expandIconPosition === 'end' ? iconElement : null}
          {pressable.state.focused && !item.disabled ? (
            <View
              pointerEvents="none"
              style={[styles.focusRing, { borderColor: theme.colors.strokeFocus2 }]}
            />
          ) : null}
        </Pressable>
      </View>
    );
  },
);

AccordionHeader.displayName = 'AccordionHeader';

export const AccordionPanel = React.forwardRef<View, AccordionPanelProps>((props, ref) => {
  const {
    children,
    collapseMotion,
    contentStyle,
    style,
    accessibilityElementsHidden,
    importantForAccessibility,
    ...rest
  } = props;
  const item = useAccordionItemContext('AccordionPanel');
  const duration = Math.max(0, collapseMotion?.duration ?? accordionMotionDuration);
  const animateOpacity = collapseMotion?.animateOpacity ?? true;
  const progress = React.useRef(new Animated.Value(item.open ? 1 : 0)).current;
  const [contentHeight, setContentHeight] = React.useState(0);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (mounted) {
        setReduceMotion(enabled);
      }
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  React.useEffect(() => {
    const animation = Animated.timing(progress, {
      duration: reduceMotion ? 0 : duration,
      easing: accordionEasing,
      isInteraction: false,
      toValue: item.open ? 1 : 0,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [duration, item.open, progress, reduceMotion]);

  const handleContentLayout = React.useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.ceil(event.nativeEvent.layout.height);
    setContentHeight(currentHeight => (currentHeight === nextHeight ? currentHeight : nextHeight));
  }, []);

  return (
    <Animated.View
      accessibilityElementsHidden={accessibilityElementsHidden ?? !item.open}
      importantForAccessibility={importantForAccessibility ?? (item.open ? 'auto' : 'no-hide-descendants')}
      style={[
        styles.panelClip,
        {
          height: progress.interpolate({ inputRange: [0, 1], outputRange: [0, contentHeight] }),
          opacity: animateOpacity ? progress : 1,
        },
      ]}
    >
      <View
        {...rest}
        onLayout={handleContentLayout}
        ref={ref}
        style={[styles.panelContent, accordionPanelTokens, contentStyle, style]}
      >
        {children}
      </View>
    </Animated.View>
  );
});

AccordionPanel.displayName = 'AccordionPanel';

const styles = StyleSheet.create({
  accordion: {
    width: '100%',
  },
  decorativeIcon: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
  focusRing: {
    borderRadius: 4,
    borderWidth: 2,
    bottom: 1,
    left: 1,
    position: 'absolute',
    right: 1,
    top: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
  },
  headerContent: {
    flex: 1,
    minWidth: 0,
  },
  inlineContent: {
    flexShrink: 1,
  },
  inlineHeader: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  item: {
    width: '100%',
  },
  panelClip: {
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  panelContent: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
