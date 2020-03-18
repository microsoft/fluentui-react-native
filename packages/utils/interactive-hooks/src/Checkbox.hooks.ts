import * as React from 'react';

export type onToggleCallback = (val: boolean) => void;

// isChecked will be the current state of the Checkbox
export function useAsToggleCheckbox(defaultVal: boolean, userCallback?: onToggleCallback) {
  const [checked, setChecked] = React.useState(defaultVal);

  const onChange = React.useCallback(() => {
    userCallback && userCallback(!checked);
    setChecked(!checked);
  }, [checked]);

  return { onChange, checked };
}
