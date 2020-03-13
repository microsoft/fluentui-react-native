import * as React from 'react';

// isChecked will be the current state of the Checkbox
export function useAsToggleCheckbox(defaultVal: boolean) {
  const [checked, setChecked] = React.useState(defaultVal);

  const onChange = React.useCallback(() => {
    setChecked(!checked);
  }, [checked]);

  return { onChange, checked };
}
