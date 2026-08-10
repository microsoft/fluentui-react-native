import * as React from 'react';
import type {
  AccessibilityActionEvent,
  GestureResponderEvent,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useFluentTheme } from '@fluentui-react-native/framework';

import { Path, Svg } from 'react-native-svg';

import type {
  CarouselChangeType,
  CarouselIndexChangeData,
  CarouselInteractionEvent,
  CarouselMotion,
  CarouselProps,
} from './Carousel.types';

const DEFAULT_DURATION = 400;
const carouselEasing = Easing.bezier(0.1, 0.9, 0.2, 1);

function clampIndex(index: number, count: number): number {
  return Math.max(0, Math.min(index, Math.max(0, count - 1)));
}

function getMotion(motion: CarouselMotion): { duration: number; kind: 'fade' | 'slide' } {
  if (typeof motion === 'string') {
    return { duration: DEFAULT_DURATION, kind: motion };
  }
  return { duration: motion.duration ?? DEFAULT_DURATION, kind: motion.kind };
}

export const Carousel = React.forwardRef<View, CarouselProps>((props, ref) => {
  const {
    accessibilityActions,
    accessibilityLabel = 'Carousel',
    activeIndex,
    align = 'center',
    announcement = (index, total) => `Carousel slide ${index + 1} of ${total}`,
    appearance = 'flat',
    autoplay = false,
    autoplayInterval = 4000,
    children,
    circular = false,
    defaultActiveIndex = 0,
    draggable = false,
    gap = 0,
    indicatorImages,
    motion = 'slide',
    navigationPosition = 'bottom',
    onAccessibilityAction,
    onActiveIndexChange,
    showAutoplayButton = false,
    showControls = true,
    showIndicators = true,
    slideStyle,
    slideWidth,
    style,
    ...rest
  } = props;
  const theme = useFluentTheme();
  const slides = React.Children.toArray(children);
  const count = slides.length;
  const [uncontrolledIndex, setUncontrolledIndex] = React.useState(() => clampIndex(defaultActiveIndex, count));
  const currentIndex = clampIndex(activeIndex ?? uncontrolledIndex, count);
  const [viewportWidth, setViewportWidth] = React.useState(0);
  const [slideTrackHeight, setSlideTrackHeight] = React.useState(0);
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = React.useState(autoplay);
  const animatedOffset = React.useRef(new Animated.Value(0)).current;
  const animatedScrollOffset = React.useRef(new Animated.Value(0)).current;
  const animationRef = React.useRef<Animated.CompositeAnimation | null>(null);
  const scrollRef = React.useRef<ScrollView>(null);
  const hasPositionedRef = React.useRef(false);
  const draggingRef = React.useRef(false);
  const previousIndexRef = React.useRef(currentIndex);
  const dragStartOffsetRef = React.useRef(0);
  const { duration, kind } = getMotion(motion);
  const resolvedSlideWidth = slideWidth ?? viewportWidth;
  const step = resolvedSlideWidth + gap;
  const useClones = circular && count > 1 && kind === 'slide';
  const renderedSlides = useClones ? [slides[count - 1], ...slides, slides[0]] : slides;
  const basePosition = useClones ? currentIndex + 1 : currentIndex;

  React.useEffect(() => {
    setAutoplayEnabled(autoplay);
  }, [autoplay]);

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
    const listener = animatedScrollOffset.addListener(({ value }) => {
      if (draggable) {
        scrollRef.current?.scrollTo({ animated: false, x: value, y: 0 });
      }
    });
    return () => animatedScrollOffset.removeListener(listener);
  }, [animatedScrollOffset, draggable]);

  const setOffsetImmediately = React.useCallback(
    (position: number) => {
      animationRef.current?.stop();
      animatedOffset.setValue(position * step);
    },
    [animatedOffset, step],
  );

  React.useLayoutEffect(() => {
    if (!viewportWidth || !step) {
      return;
    }

    const previousIndex = previousIndexRef.current;
    let targetPosition = basePosition;
    let resetPosition: number | undefined;

    if (useClones && previousIndex === count - 1 && currentIndex === 0) {
      targetPosition = count + 1;
      resetPosition = 1;
    } else if (useClones && previousIndex === 0 && currentIndex === count - 1) {
      targetPosition = 0;
      resetPosition = count;
    }

    previousIndexRef.current = currentIndex;
    animationRef.current?.stop();

    if (kind === 'slide') {
      const targetOffset = targetPosition * step;
      if (!hasPositionedRef.current || reduceMotion) {
        animatedScrollOffset.setValue(targetOffset);
        if (draggable) {
          scrollRef.current?.scrollTo({ animated: false, x: targetOffset, y: 0 });
        }
        hasPositionedRef.current = true;
        if (resetPosition !== undefined) {
          animatedScrollOffset.setValue(resetPosition * step);
        }
        return;
      }

      hasPositionedRef.current = true;
      const animation = Animated.timing(animatedScrollOffset, {
        duration,
        easing: carouselEasing,
        isInteraction: false,
        toValue: targetOffset,
        useNativeDriver: false,
      });
      animationRef.current = animation;
      animation.start(({ finished }) => {
        if (finished && resetPosition !== undefined) {
          animatedScrollOffset.setValue(resetPosition * step);
        }
      });
      return () => animation.stop();
    }

    if (reduceMotion) {
      setOffsetImmediately(basePosition);
      return;
    }

    const animation = Animated.timing(animatedOffset, {
      duration,
      easing: carouselEasing,
      isInteraction: false,
      toValue: targetPosition * step,
      useNativeDriver: false,
    });
    animationRef.current = animation;
    animation.start(({ finished }) => {
      if (finished && resetPosition !== undefined) {
        animatedOffset.setValue(resetPosition * step);
      }
    });
    return () => animation.stop();
  }, [
    animatedOffset,
    animatedScrollOffset,
    basePosition,
    count,
    currentIndex,
    duration,
    draggable,
    kind,
    reduceMotion,
    setOffsetImmediately,
    step,
    useClones,
    viewportWidth,
  ]);

  const requestIndex = React.useCallback(
    (event: CarouselInteractionEvent, requestedIndex: number, type: CarouselChangeType) => {
      if (count <= 1) {
        return;
      }
      const nextIndex = circular
        ? ((requestedIndex % count) + count) % count
        : clampIndex(requestedIndex, count);
      if (nextIndex === currentIndex) {
        return;
      }
      if (activeIndex === undefined) {
        setUncontrolledIndex(nextIndex);
      }
      const data: CarouselIndexChangeData = { index: nextIndex, type };
      onActiveIndexChange?.(event, data);
    },
    [activeIndex, circular, count, currentIndex, onActiveIndexChange],
  );

  React.useEffect(() => {
    if (!autoplayEnabled || count <= 1) {
      return;
    }
    const timer = setTimeout(() => {
      requestIndex({} as GestureResponderEvent, currentIndex + 1, 'autoplay');
    }, autoplayInterval);
    return () => clearTimeout(timer);
  }, [autoplayEnabled, autoplayInterval, count, currentIndex, requestIndex]);

  const handleAccessibilityAction = React.useCallback(
    (event: AccessibilityActionEvent) => {
      if (event.nativeEvent.actionName === 'increment') {
        requestIndex(event, currentIndex + 1, 'click');
      } else if (event.nativeEvent.actionName === 'decrement') {
        requestIndex(event, currentIndex - 1, 'click');
      }
      onAccessibilityAction?.(event);
    },
    [currentIndex, onAccessibilityAction, requestIndex],
  );

  const handleScrollEnd = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!draggingRef.current || !step) {
        return;
      }
      draggingRef.current = false;
      const offset = event.nativeEvent.contentOffset.x;
      animatedScrollOffset.setValue(offset);
      const position = Math.round(offset / step);
      const nextIndex = useClones
        ? position === 0
          ? count - 1
          : position === count + 1
            ? 0
            : position - 1
        : position;
      requestIndex(event as unknown as GestureResponderEvent, nextIndex, 'drag');
    },
    [animatedScrollOffset, count, requestIndex, step, useClones],
  );

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          kind === 'fade' && draggable && Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
          animationRef.current?.stop();
          dragStartOffsetRef.current = basePosition * step;
        },
        onPanResponderMove: (_, gesture) => {
          if (step) {
            animatedOffset.setValue(dragStartOffsetRef.current - gesture.dx);
          }
        },
        onPanResponderRelease: (event, gesture) => {
          if (Math.abs(gesture.dx) >= Math.max(36, resolvedSlideWidth * 0.15)) {
            requestIndex(event, currentIndex + (gesture.dx < 0 ? 1 : -1), 'drag');
          } else {
            Animated.timing(animatedOffset, {
              duration: reduceMotion ? 0 : Math.min(duration, 240),
              easing: carouselEasing,
              isInteraction: false,
              toValue: basePosition * step,
              useNativeDriver: false,
            }).start();
          }
        },
        onPanResponderTerminate: () => setOffsetImmediately(basePosition),
      }),
    [
      animatedOffset,
      basePosition,
      draggable,
      duration,
      kind,
      currentIndex,
      reduceMotion,
      requestIndex,
      resolvedSlideWidth,
      setOffsetImmediately,
      step,
    ],
  );

  const contentInset =
    slideWidth === undefined
      ? 0
      : align === 'start'
        ? 0
        : align === 'end'
          ? Math.max(0, viewportWidth - resolvedSlideWidth)
          : Math.max(0, (viewportWidth - resolvedSlideWidth) / 2);
  const canGoPrevious = circular || currentIndex > 0;
  const canGoNext = circular || currentIndex < count - 1;
  const announcementText = count ? announcement(currentIndex, count) : '';

  const navigation = count > 1 ? (
    <View style={styles.navigation}>
      {showControls ? (
        <Pressable
          accessibilityLabel="Go to previous"
          accessibilityRole="button"
          disabled={!canGoPrevious}
          onPress={event => requestIndex(event, currentIndex - 1, 'click')}
          style={({ pressed }) => [
            styles.control,
            { backgroundColor: pressed ? theme.colors.subtleBackgroundPressed : theme.colors.subtleBackground },
            !canGoPrevious && styles.disabled,
          ]}
        >
          <Text style={[styles.controlText, { color: theme.colors.neutralForeground1 }]}>{'‹'}</Text>
        </Pressable>
      ) : null}
      {showIndicators ? (
        <View accessibilityRole="tablist" style={styles.indicators}>
          {slides.map((_, index) => {
            const selected = index === currentIndex;
            const image = indicatorImages?.[index];
            return (
              <Pressable
                accessibilityLabel={`Go to slide ${index + 1}`}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                key={index}
                onPress={event => requestIndex(event, index, 'click')}
                style={
                  image
                    ? [
                        styles.imageIndicator,
                        {
                          borderColor: selected
                            ? theme.colors.compoundBrandStroke1
                            : theme.colors.neutralStroke1,
                        },
                      ]
                    : styles.indicatorButton
                }
              >
                {image ? (
                  <Image source={image} style={styles.indicatorImage} />
                ) : (
                  <View
                    style={[
                      styles.indicator,
                      {
                        backgroundColor: theme.colors.neutralForeground1,
                        opacity: selected ? 1 : 0.6,
                        width: selected ? 16 : 8,
                      },
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {showControls ? (
        <Pressable
          accessibilityLabel="Go to next"
          accessibilityRole="button"
          disabled={!canGoNext}
          onPress={event => requestIndex(event, currentIndex + 1, 'click')}
          style={({ pressed }) => [
            styles.control,
            { backgroundColor: pressed ? theme.colors.subtleBackgroundPressed : theme.colors.subtleBackground },
            !canGoNext && styles.disabled,
          ]}
        >
          <Text style={[styles.controlText, { color: theme.colors.neutralForeground1 }]}>{'›'}</Text>
        </Pressable>
      ) : null}
      {showAutoplayButton ? (
        <Pressable
          accessibilityLabel={autoplayEnabled ? 'Pause autoplay' : 'Start autoplay'}
          accessibilityRole="button"
          onPress={() => setAutoplayEnabled(value => !value)}
          style={({ pressed }) => [
            styles.autoplay,
            { backgroundColor: pressed ? theme.colors.subtleBackgroundPressed : theme.colors.subtleBackground },
          ]}
        >
          <Svg height={20} viewBox="0 0 20 20" width={20}>
            <Path
              d={
                autoplayEnabled
                  ? 'M5.5 3.5A1.5 1.5 0 004 5v10a1.5 1.5 0 003 0V5a1.5 1.5 0 00-1.5-1.5zm9 0A1.5 1.5 0 0013 5v10a1.5 1.5 0 003 0V5a1.5 1.5 0 00-1.5-1.5z'
                  : 'M5 4.76v10.48a1.25 1.25 0 001.9 1.07l8.55-5.24a1.25 1.25 0 000-2.14L6.9 3.69A1.25 1.25 0 005 4.76z'
              }
              fill={theme.colors.neutralForeground1}
            />
          </Svg>
        </Pressable>
      ) : null}
    </View>
  ) : null;

  return (
    <View
      {...rest}
      ref={ref}
      style={[
        styles.root,
        appearance === 'elevated' && {
          backgroundColor: theme.colors.neutralBackground1,
          borderColor: theme.colors.neutralStroke2,
        },
        appearance === 'elevated' && styles.elevated,
        style,
      ]}
    >
      {navigationPosition === 'top' ? navigation : null}
      <View
        {...(kind === 'fade' ? panResponder.panHandlers : {})}
        accessibilityActions={accessibilityActions ?? [{ name: 'increment' }, { name: 'decrement' }]}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="adjustable"
        accessibilityValue={{ max: count, min: count ? 1 : 0, now: count ? currentIndex + 1 : 0, text: announcementText }}
        onAccessibilityAction={handleAccessibilityAction}
        onLayout={(event: LayoutChangeEvent) => setViewportWidth(event.nativeEvent.layout.width)}
        style={styles.viewport}
      >
        {kind === 'fade' ? (
          <View style={[styles.fadeStage, slideStyle, slideWidth ? { width: resolvedSlideWidth } : undefined]}>
            {slides.map((slide, index) => (
              <Animated.View
                accessibilityElementsHidden={index !== currentIndex}
                importantForAccessibility={index === currentIndex ? 'auto' : 'no-hide-descendants'}
                key={index}
                style={[
                  styles.fadeSlide,
                  slideStyle,
                  {
                    opacity: animatedOffset.interpolate({
                      extrapolate: 'clamp',
                      inputRange: [(index - 1) * step, index * step, (index + 1) * step],
                      outputRange: [0, 1, 0],
                    }),
                  },
                ]}
              >
                {slide}
              </Animated.View>
            ))}
          </View>
        ) : draggable ? (
          <ScrollView
            contentContainerStyle={[styles.track, { gap, paddingLeft: contentInset }]}
            decelerationRate="fast"
            disableIntervalMomentum
            horizontal
            onContentSizeChange={(_, height) => {
              const nextHeight = Math.ceil(height);
              setSlideTrackHeight(currentHeight => (currentHeight === nextHeight ? currentHeight : nextHeight));
            }}
            onMomentumScrollEnd={handleScrollEnd}
            onScrollBeginDrag={event => {
              draggingRef.current = true;
              animationRef.current?.stop();
              animatedScrollOffset.setValue(event.nativeEvent.contentOffset.x);
            }}
            ref={scrollRef}
            showsHorizontalScrollIndicator={false}
            snapToInterval={step || undefined}
            style={slideTrackHeight ? { height: slideTrackHeight } : undefined}
          >
            {renderedSlides.map((slide, index) => {
              const actualIndex = useClones ? (index - 1 + count) % count : index;
              const isVisible = actualIndex === currentIndex && (!useClones || index === basePosition);
              return (
                <View
                  accessibilityElementsHidden={!isVisible}
                  importantForAccessibility={isVisible ? 'auto' : 'no-hide-descendants'}
                  key={`${actualIndex}-${index}`}
                  style={[styles.slide, { width: resolvedSlideWidth }, slideStyle]}
                >
                  {slide}
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Animated.View
            style={[
              styles.track,
              {
                gap,
                paddingLeft: contentInset,
                transform: [{ translateX: Animated.multiply(animatedScrollOffset, -1) }],
              },
            ]}
          >
            {renderedSlides.map((slide, index) => {
              const actualIndex = useClones ? (index - 1 + count) % count : index;
              const isVisible = actualIndex === currentIndex && (!useClones || index === basePosition);
              return (
                <View
                  accessibilityElementsHidden={!isVisible}
                  importantForAccessibility={isVisible ? 'auto' : 'no-hide-descendants'}
                  key={`${actualIndex}-${index}`}
                  style={[styles.slide, { width: resolvedSlideWidth }, slideStyle]}
                >
                  {slide}
                </View>
              );
            })}
          </Animated.View>
        )}
      </View>
      <Text accessibilityLiveRegion="polite" style={styles.srOnly}>
        {announcementText}
      </Text>
      {navigationPosition === 'bottom' ? navigation : null}
    </View>
  );
});

Carousel.displayName = 'Carousel';

const styles = StyleSheet.create({
  autoplay: { alignItems: 'center', borderRadius: 4, height: 32, justifyContent: 'center', width: 32 },
  control: { alignItems: 'center', borderRadius: 4, height: 32, justifyContent: 'center', width: 32 },
  controlText: { fontFamily: 'Segoe UI', fontSize: 24, lineHeight: 26 },
  disabled: { opacity: 0.4 },
  elevated: {
    borderRadius: 12,
    borderWidth: 1,
    elevation: 8,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
  },
  fadeSlide: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  fadeStage: { flex: 1, minHeight: 1 },
  imageIndicator: { borderRadius: 4, borderWidth: 2, height: 40, overflow: 'hidden', width: 52 },
  indicator: { borderRadius: 4, height: 8 },
  indicatorButton: { alignItems: 'center', height: 24, justifyContent: 'center', width: 24 },
  indicatorImage: { height: '100%', resizeMode: 'cover', width: '100%' },
  indicators: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  navigation: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
  root: { gap: 12, overflow: 'hidden', position: 'relative', width: '100%' },
  slide: { flexShrink: 0 },
  srOnly: { height: 1, opacity: 0, position: 'absolute', width: 1 },
  track: { alignItems: 'stretch', flexDirection: 'row' },
  viewport: { overflow: 'hidden', width: '100%' },
});
