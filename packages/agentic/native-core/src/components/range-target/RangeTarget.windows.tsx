import NativeRangeTarget from '../../specs/components/RangeTargetNativeComponent';
import type { RangeTargetProps } from './RangeTarget';

export function RangeTarget(props: RangeTargetProps) {
  const { targetLabel, targetTestID, disabled } = props;
  return (
    <NativeRangeTarget
      {...props}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={targetLabel}
      accessibilityState={{ disabled }}
      focusable={!disabled}
      testID={targetTestID ?? props.testID}
    />
  );
}

export type { RangeTargetProps };
