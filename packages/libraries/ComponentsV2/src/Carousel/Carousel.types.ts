import type * as React from 'react';
import type {
  AccessibilityActionEvent,
  GestureResponderEvent,
  ImageSourcePropType,
  StyleProp,
  ViewProps,
  ViewStyle,
} from 'react-native';

export type CarouselAlignment = 'start' | 'center' | 'end';
export type CarouselAppearance = 'flat' | 'elevated';
export type CarouselChangeType = 'autoplay' | 'click' | 'drag';
export type CarouselMotion = 'slide' | 'fade' | { kind: 'slide' | 'fade'; duration?: number };
export type CarouselNavigationPosition = 'top' | 'bottom';

export interface CarouselIndexChangeData {
  index: number;
  type: CarouselChangeType;
}

export type CarouselInteractionEvent = GestureResponderEvent | AccessibilityActionEvent;

export interface CarouselProps extends Omit<ViewProps, 'children'> {
  /**
   * The controlled active slide index.
   */
  activeIndex?: number;

  /**
   * Aligns fixed-width slides within the viewport.
   * @default 'center'
   */
  align?: CarouselAlignment;

  /**
   * Adds a Fluent surfaced treatment around the carousel.
   * @default 'flat'
   */
  appearance?: CarouselAppearance;

  /**
   * Advances the carousel automatically while the autoplay control is enabled.
   * @default false
   */
  autoplay?: boolean;

  /**
   * Delay between autoplay transitions in milliseconds.
   * @default 4000
   */
  autoplayInterval?: number;

  /**
   * Accessible announcement generated after the active slide changes.
   */
  announcement?: (index: number, totalSlides: number) => string;

  /**
   * Carousel slides.
   */
  children: React.ReactNode;

  /**
   * Loops from the last slide to the first and vice versa.
   * @default false
   */
  circular?: boolean;

  /**
   * The initial active slide for an uncontrolled carousel.
   * @default 0
   */
  defaultActiveIndex?: number;

  /**
   * Enables horizontal swipe navigation.
   * @default false
   */
  draggable?: boolean;

  /**
   * Space between slides.
   * @default 0
   */
  gap?: number;

  /**
   * Optional preview images used instead of dot indicators.
   */
  indicatorImages?: readonly ImageSourcePropType[];

  /**
   * Configures the slide or fade transition.
   * @default 'slide'
   */
  motion?: CarouselMotion;

  /**
   * Position of the integrated navigation.
   * @default 'bottom'
   */
  navigationPosition?: CarouselNavigationPosition;

  /**
   * Called when interaction requests a new active slide.
   */
  onActiveIndexChange?: (event: CarouselInteractionEvent, data: CarouselIndexChangeData) => void;

  /**
   * Shows the previous and next buttons.
   * @default true
   */
  showControls?: boolean;

  /**
   * Shows the play/pause button.
   * @default false
   */
  showAutoplayButton?: boolean;

  /**
   * Shows direct-navigation indicators.
   * @default true
   */
  showIndicators?: boolean;

  /**
   * Uses a fixed slide width. By default each slide fills the viewport.
   */
  slideWidth?: number;

  /**
   * Style applied to each slide wrapper.
   */
  slideStyle?: StyleProp<ViewStyle>;
}
