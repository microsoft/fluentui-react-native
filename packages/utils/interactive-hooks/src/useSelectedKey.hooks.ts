import * as React from 'react';

export type onKeySelectCallback = (key: string) => void;

// This hook updates the selected button and calls the client's onChange callback with the new button
export function useSelectedKey(defaultSelectedKey: string | null, userCallback?: onKeySelectCallback) {
  const [selectedKey, setSelectedKey] = React.useState(defaultSelectedKey);

  const onKeySelect = React.useCallback(
    (key: string) => {
      setSelectedKey(key);
      userCallback && userCallback(key);
    },
    [setSelectedKey, userCallback],
  );

  return { onKeySelect, selectedKey };
}
