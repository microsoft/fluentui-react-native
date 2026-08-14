/** @jsxImportSource @fluentui-react-native/framework-base */
import { Circle } from 'react-native-svg';

import type { SpinnerState } from './spinner.types';

/**
 * Renders the Spinner component.
 */
export function renderSpinner_unstable(state: SpinnerState) {
  const indicatorPathProps = { pathLength: 100 } as any;

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
          {...indicatorPathProps}
          r={state.radius}
          stroke={state.indicatorColor}
          strokeDasharray="25 75"
          strokeLinecap="round"
          strokeWidth={state.strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      </state.svg>
    </state.root>
  );
}
