import * as React from 'react';

export type onChangeCallback = (key: string) => void;

// This hook updates the selected button and calls the client's onChange callback with the new button
export function useAsRadioGroupSelection(defaultSelectedKey: string, userCallback?: onChangeCallback) {
  const [selectedKey, setSelectedKey] = React.useState(defaultSelectedKey);

  const onChange = React.useCallback(
    (key: string) => {
      setSelectedKey(key);
      userCallback && userCallback(key);
    },
    [selectedKey, userCallback]
  );

  return { onChange, selectedKey };
}
