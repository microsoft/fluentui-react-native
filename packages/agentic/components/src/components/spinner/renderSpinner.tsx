/** @jsxImportSource @fluentui-react-native/framework-base */
import { Circle } from 'react-native-svg';

import type { SpinnerState } from './spinner.types';

/**
 * Renders the Spinner component.
 */
export function renderSpinner_unstable(state: SpinnerState) {
  const circumference = 2 * Math.PI * state.radius;

  return (
    <state.root>
      <state.svg>
        <Circle
          cx={state.center}
          cy={state.center}
          fill="none"
          testID="spinner-track"
          r={state.radius}
          stroke={state.trackColor}
          strokeLinecap="round"
          strokeWidth={state.strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
        <Circle
          cx={state.center}
          cy={state.center}
          fill="none"
          testID="spinner-indicator"
          r={state.radius}
          stroke={state.indicatorColor}
          strokeDasharray={[circumference / 4, (circumference * 3) / 4]}
          strokeLinecap="round"
          strokeWidth={state.strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      </state.svg>
    </state.root>
  );
}
