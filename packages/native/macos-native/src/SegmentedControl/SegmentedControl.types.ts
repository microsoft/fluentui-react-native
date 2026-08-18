import type { ViewProps } from 'react-native';

/** A single segment within a SegmentedControl. */
export interface SegmentDescriptor {
  /** Text label shown for this segment. */
  label?: string;
  /** Whether this segment can be selected. Defaults to true. */
  enabled?: boolean;
  /** Fixed width for this segment, in points. Segments auto-size if omitted. */
  width?: number;
}

/**
 * How the control interprets user interaction across its segments.
 * https://developer.apple.com/documentation/appkit/nssegmentedcontrol/tracking-swift.enum
 */
export type SegmentedControlTrackingMode = 'selectOne' | 'selectAny' | 'momentary';

/**
 * Visual style of the segmented control.
 * https://developer.apple.com/documentation/appkit/nssegmentstyle
 */
export type SegmentedControlSegmentStyle =
  | 'automatic'
  | 'rounded'
  | 'texturedRounded'
  | 'roundRect'
  | 'texturedSquare'
  | 'capsule'
  | 'smallSquare'
  | 'separated';

/**
 * Thin wrapper around the AppKit `NSSegmentedControl` control.
 * https://developer.apple.com/documentation/appkit/nssegmentedcontrol
 */
export interface SegmentedControlProps extends ViewProps {
  /** The segments to render, in order. */
  segments: SegmentDescriptor[];
  /** Index of the currently selected segment (meaningful for 'selectOne' tracking mode). */
  selectedIndex?: number;
  /** How selection is tracked across segments. Defaults to 'selectOne'. */
  trackingMode?: SegmentedControlTrackingMode;
  /** Visual style of the segments. Defaults to 'automatic'. */
  segmentStyle?: SegmentedControlSegmentStyle;
  /** Disables user interaction with the entire control. */
  disabled?: boolean;
  /** Native tooltip shown on hover. */
  tooltip?: string;
  /** Fired when the selected segment changes. */
  onChange?: (selectedIndex: number) => void;
}
