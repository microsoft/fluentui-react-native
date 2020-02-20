import * as React from 'react';
import { GestureResponderEvent, StyleProp } from 'react-native';

/**
 * Gesture responder states
 */
export type IState =
  | 'NOT_RESPONDER'
  | 'RESPONDER_INACTIVE_PRESS_IN'
  | 'RESPONDER_INACTIVE_PRESS_OUT'
  | 'RESPONDER_ACTIVE_PRESS_IN'
  | 'RESPONDER_ACTIVE_PRESS_OUT'
  | 'RESPONDER_ACTIVE_LONG_PRESS_IN'
  | 'RESPONDER_ACTIVE_LONG_PRESS_OUT'
  | 'ERROR';

/**
 * Signals into the gesture responder system
 */
export type ISignal =
  | 'DELAY'
  | 'RESPONDER_GRANT'
  | 'RESPONDER_RELEASE'
  | 'RESPONDER_TERMINATED'
  | 'ENTER_PRESS_RECT'
  | 'LEAVE_PRESS_RECT'
  | 'LONG_PRESS_DETECTED';

type ISignalTransitions = { [P in ISignal]: IState };

/**
 * Map of State to [Signal -> State],
 * describing state transition maps
 */
export type ITransitions = { [P in IState]: ISignalTransitions };

/**
 * Describes lookup maps of states meeting
 * some specified criteria
 */
export type IStateConditions = { [P in IState]: boolean };

/**
 * Describes the position at which an event occurred
 */
export interface IPosition {
  left: number;
  top: number;
}

export interface IRect extends IPosition {
  right: number;
  bottom: number;
}

/**
 * Describes the height and width of a control
 */
export interface IDimensions {
  width: number;
  height: number;
}

/**
 * Describes the base of the semi-processed events
 * that will be passed into callback functions
 */
export interface ISyntheticEvent<T> {
  bubbes?: boolean;
  cancelable?: boolean;
  currentTarget: number;
  defaultPrevent?: boolean;
  disatchConfig: {
    registrationName: string;
  };
  eventPhase?: number;
  preventDefault: () => void;
  isDefaultPrevent: () => boolean;
  stopPropagation: () => void;
  isPropagationStopped: () => boolean;
  isTrusted?: boolean;
  nativeEvent: T;
  persist: () => void;
  target?: number;
  timestamp?: number;
  type?: React.ElementType;
}

/**
 * Describes a touch
 */
export interface ITouchInfo {
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
}

/**
 * More fully defines an event by augmenting touchHistory
 */
export interface IResponderSyntheticEvent<T> extends ISyntheticEvent<T> {
  touchHistory: {
    indexOfSingleActiveTouch: number;
    mostRecentTimeStamp: number;
    numberActiveTouches: number;
    touchBank: ITouchInfo[];
  };
}

/**
 * This encompasses all information used by TouchableWin32 based controls
 * during callbacks and in response to press events
 */
export type IPressEvent = IResponderSyntheticEvent<{
  changedTouches: IPressEvent[];
  force: number;
  identifier: number;
  locationX: number;
  locationY: number;
  pageX: number;
  pageY: number;
  target?: number;
  timestamp: number;
  touches: IPressEvent[];
}> &
  GestureResponderEvent;

/**
 * Describes both the global and relative position of a press
 */
export interface IPressInLocation {
  pageX: number;
  pageY: number;
  locationX: number;
  locationY: number;
}

/**
 * Used by IRenderChild, it simply describes a function that takes
 * some generic state type T and returns a ReactNode
 */
export type IChildAsFunction<T> = (state: T) => React.ReactNode;

/**
 * An IRenderChild describes children as a function that take the current
 * state of the parent component. It is up to the parent to invoke the function
 * and make proper use of the more typical ReactNode object that is returned
 * This is an especially helpful construct when children of a Touchable require
 * knowledge of the interaction state of their parent to properly render themselves
 * (e.g. foreground color of a text child)
 */
export type IRenderChild<T> = IChildAsFunction<T> | React.ReactNode;

/**
 * An IRenderStyle describes style as a function that takes the current
 * state of the parent component. It is up to the parent to invoke the function
 * and make proper use of the more typical StyleProp<S> object that is returned
 * This is convenient for when styles need to be calculated depending on interaction states.
 */
export type IRenderStyle<T, S> = (state: T) => StyleProp<S>;
