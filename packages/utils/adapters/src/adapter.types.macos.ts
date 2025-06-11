import type {
  TextProps,
  ViewProps,
  ImageProps,
  HostComponent,
  NativeSyntheticEvent,
  Animated,
  StyleProp,
  ImageStyle,
  TextStyle,
  ViewStyle,
} from 'react-native';

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/UIEvent
 */
export interface NativeUIEvent {
  /**
   * Returns a long with details about the event, depending on the event type.
   */
  readonly detail: number;
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
 */
export interface NativeMouseEvent extends NativeUIEvent {
  /**
   * The X coordinate of the mouse pointer in global (screen) coordinates.
   */
  readonly screenX: number;
  /**
   * The Y coordinate of the mouse pointer in global (screen) coordinates.
   */
  readonly screenY: number;
  /**
   * The X coordinate of the mouse pointer relative to the whole document.
   */
  readonly pageX: number;
  /**
   * The Y coordinate of the mouse pointer relative to the whole document.
   */
  readonly pageY: number;
  /**
   * The X coordinate of the mouse pointer in local (DOM content) coordinates.
   */
  readonly clientX: number;
  /**
   * The Y coordinate of the mouse pointer in local (DOM content) coordinates.
   */
  readonly clientY: number;
  /**
   * Alias for NativeMouseEvent.clientX
   */
  readonly x: number;
  /**
   * Alias for NativeMouseEvent.clientY
   */
  readonly y: number;
  /**
   * Returns true if the control key was down when the mouse event was fired.
   */
  readonly ctrlKey: boolean;
  /**
   * Returns true if the shift key was down when the mouse event was fired.
   */
  readonly shiftKey: boolean;
  /**
   * Returns true if the alt key was down when the mouse event was fired.
   */
  readonly altKey: boolean;
  /**
   * Returns true if the meta key was down when the mouse event was fired.
   */
  readonly metaKey: boolean;
  /**
   * The button number that was pressed (if applicable) when the mouse event was fired.
   */
  readonly button: number;
  /**
   * The buttons being depressed (if any) when the mouse event was fired.
   */
  readonly buttons: number;
  /**
   * The secondary target for the event, if there is one.
   */
  readonly relatedTarget: null | number | React.ElementRef<HostComponent<unknown>>;
  // offset is proposed: https://drafts.csswg.org/cssom-view/#extensions-to-the-mouseevent-interface
  /**
   * The X coordinate of the mouse pointer between that event and the padding edge of the target node
   */
  readonly offsetX: number;
  /**
   * The Y coordinate of the mouse pointer between that event and the padding edge of the target node
   */
  readonly offsetY: number;
}
export interface MouseEvent extends NativeSyntheticEvent<NativeMouseEvent> {}

// [macOS
export interface NativeKeyEvent {
  // Modifier keys
  capsLockKey: boolean;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  numericPadKey: boolean;
  helpKey: boolean;
  functionKey: boolean;
  // Key options
  ArrowLeft: boolean;
  ArrowRight: boolean;
  ArrowUp: boolean;
  ArrowDown: boolean;
  key: string;
}

export interface KeyEvent extends NativeSyntheticEvent<NativeKeyEvent> {}
export type DraggedType = 'fileUrl';
export type DraggedTypesType = DraggedType | DraggedType[];

type AnimatableNumericValue = number | Animated.AnimatedNode;
type AnimatableStringValue = string | Animated.AnimatedNode;
interface PerpectiveTransform {
  perspective: AnimatableNumericValue;
}

interface RotateTransform {
  rotate: AnimatableStringValue;
}

interface RotateXTransform {
  rotateX: AnimatableStringValue;
}

interface RotateYTransform {
  rotateY: AnimatableStringValue;
}

interface RotateZTransform {
  rotateZ: AnimatableStringValue;
}

interface ScaleTransform {
  scale: AnimatableNumericValue;
}

interface ScaleXTransform {
  scaleX: AnimatableNumericValue;
}

interface ScaleYTransform {
  scaleY: AnimatableNumericValue;
}

interface TranslateXTransform {
  translateX: AnimatableNumericValue;
}

interface TranslateYTransform {
  translateY: AnimatableNumericValue;
}

interface SkewXTransform {
  skewX: AnimatableStringValue;
}

interface SkewYTransform {
  skewY: AnimatableStringValue;
}

interface MatrixTransform {
  matrix: AnimatableNumericValue[];
}

type MaximumOneOf<T, K extends keyof T = keyof T> = K extends keyof T ? { [P in K]: T[K] } & { [P in Exclude<keyof T, K>]?: never } : never;

type MutableTransformStyle<T> = T & {
  transform?:
    | MaximumOneOf<
        PerpectiveTransform &
          RotateTransform &
          RotateXTransform &
          RotateYTransform &
          RotateZTransform &
          ScaleTransform &
          ScaleXTransform &
          ScaleYTransform &
          TranslateXTransform &
          TranslateYTransform &
          SkewXTransform &
          SkewYTransform &
          MatrixTransform
      >[]
    | string
    | undefined;
};

export type IAdapterMacOSViewProps = ViewProps & {
  acceptsFirstMouse?: boolean | undefined;
  allowsVibrancy?: boolean | undefined;
  mouseDownCanMoveWindow?: boolean | undefined;
  enableFocusRing?: boolean | undefined;
  onMouseEnter?: ((event: MouseEvent) => void) | undefined;
  onMouseLeave?: ((event: MouseEvent) => void) | undefined;
  onDragEnter?: ((event: MouseEvent) => void) | undefined;
  onDragLeave?: ((event: MouseEvent) => void) | undefined;
  onDrop?: ((event: MouseEvent) => void) | undefined;
  onKeyDown?: ((event: KeyEvent) => void) | undefined;
  onKeyUp?: ((event: KeyEvent) => void) | undefined;
  validKeysDown?: string[] | undefined;
  validKeysUp?: string[] | undefined;
  draggedTypes?: DraggedTypesType | undefined;

  style?: StyleProp<MutableTransformStyle<ViewStyle>> | undefined;
};
export type IAdapterMacOSTextProps = Omit<TextProps, 'style'> & {
  style?: StyleProp<MutableTransformStyle<TextStyle>> | undefined;
};
export type IAdapterMacOSImageProps = ImageProps & {
  tooltip?: string;
  style?: StyleProp<MutableTransformStyle<ImageStyle>> | undefined;
};
