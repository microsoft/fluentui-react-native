import * as React from 'react';
//import { IKeyboardEvent } from '@office-iss/react-native-win32';

export type onChangeCallback = (key: string) => void;

// This hook updates the selected button and calls the client's onChange callback with the new button
export function useAsRadioGroupSelection(defaultSelectedKey: string, userCallback?: onChangeCallback) {
  const [selectedKey, setSelectedKey] = React.useState(defaultSelectedKey);

  const onChange = React.useCallback(
    (key: string) => {
      setSelectedKey(key);
      userCallback && userCallback(key);
    },
    [setSelectedKey, userCallback]
  );

  return { onChange, selectedKey };
}

// This hook will be used to capture onKeyDown
// export function onKeyDown(args: IKeyboardEvent, info: { selectedKey: string; onButtonSelect: (key: string) => void }, buttonKey: string) {
//   const [keyDown, onChangeKeyDown] = React.useState('');

//   // const key = args.nativeEvent.key;

//   // const onNewKey = React.useCallback(
//   //   (newKey: string, onButtonSelect: (key: string) => void) => {
//   //     onChangeKeyDown(newKey);
//   //     onButtonSelect(buttonKey);
//   //   },
//   //   [key]
//   // );

//   // return { onNewKey, keyDown };
// }
