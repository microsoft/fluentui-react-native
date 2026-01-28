/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

/**
 * Adapted from the flow code inside the react native project
 */

import type * as React from 'react';

export type SyntheticEvent<T> = Readonly<{
  bubbles?: boolean;
  cancelable?: boolean;
  currentTarget: number | React.ElementRef<any>;
  defaultPrevented?: boolean;
  dispatchConfig?: Readonly<{
    registrationName: string;
  }>;
  eventPhase?: number;
  preventDefault: () => void;
  isDefaultPrevented: () => boolean;
  stopPropagation: () => void;
  isPropagationStopped: () => boolean;
  isTrusted?: boolean;
  nativeEvent: T;
  persist: () => void;
  target?: number | React.ElementRef<any>;
  timeStamp: number;
  type?: string;
}>;

export type ResponderSyntheticEvent<T> = SyntheticEvent<T> &
  Readonly<{
    touchHistory: Readonly<{
      indexOfSingleActiveTouch: number;
      mostRecentTimeStamp: number;
      numberActiveTouches: number;
      touchBank: ReadonlyArray<
        Readonly<{
          touchActive: boolean;
          startPageX: number;
          startPageY: number;
          startTimeStamp: number;
          currentPageX: number;
          currentPageY: number;
          currentTimeStamp: number;
          previousPageX: number;
          previousPageY: number;
          previousTimeStamp: number;
        }>
      >;
    }>;
  }>;

export type Layout = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type TextLayout = Layout &
  Readonly<{
    ascender: number;
    capHeight: number;
    descender: number;
    text: string;
    xHeight: number;
  }>;

export type LayoutEvent = SyntheticEvent<
  Readonly<{
    layout: Layout;
  }>
>;

export type TextLayoutEvent = SyntheticEvent<
  Readonly<{
    lines: Array<TextLayout>;
  }>
>;

export type PressEvent = ResponderSyntheticEvent<
  Readonly<{
    changedTouches: ReadonlyArray<PressEvent['nativeEvent']>;
    force: number;
    identifier: number;
    locationX: number;
    locationY: number;
    pageX: number;
    pageY: number;
    target?: number;
    timestamp: number;
    touches: ReadonlyArray<PressEvent['nativeEvent']>;
  }>
>;

export type ScrollEvent = SyntheticEvent<
  Readonly<{
    contentInset: Readonly<{
      bottom: number;
      left: number;
      right: number;
      top: number;
    }>;
    contentOffset: Readonly<{
      y: number;
      x: number;
    }>;
    contentSize: Readonly<{
      height: number;
      width: number;
    }>;
    layoutMeasurement: Readonly<{
      height: number;
      width: number;
    }>;
    targetContentOffset?: Readonly<{
      y: number;
      x: number;
    }>;
    velocity?: Readonly<{
      y: number;
      x: number;
    }>;
    zoomScale?: number;
    responderIgnoreScroll?: boolean;
  }>
>;

export type BlurEvent = SyntheticEvent<
  Readonly<{
    target: number;
  }>
>;

export type FocusEvent = SyntheticEvent<
  Readonly<{
    target: number;
  }>
>;

export type MouseEvent = SyntheticEvent<
  Readonly<{
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
    timestamp: number;
  }>
>;

export type KeyPressEvent = SyntheticEvent<
  Readonly<{
    key: string;
    target?: number;
    eventCounter?: number;
  }>
>;
