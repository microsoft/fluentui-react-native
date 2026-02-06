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

import type { HostComponent } from './InternalTypes';
export type {
  BlurEvent,
  FocusEvent,
  MouseEvent,
  LayoutChangeEvent as LayoutEvent,
  TextLayoutEvent,
  ScrollResponderEvent as ScrollEvent,
} from 'react-native';

export type SyntheticEvent<T> = Readonly<{
  bubbles?: boolean;
  cancelable?: boolean;
  currentTarget: number | React.ElementRef<HostComponent<any>>;
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
  target?: number | React.ElementRef<HostComponent<any>>;
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

export type KeyPressEvent = SyntheticEvent<
  Readonly<{
    key: string;
    target?: number;
    eventCounter?: number;
  }>
>;
