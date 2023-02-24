import * as React from 'react';

import { Button } from '@fluentui/react-native';
import type { IFocusable } from '@fluentui-react-native/interactive-hooks';
import { Stack } from '@fluentui-react-native/stack';

import { stackStyle } from '../../Common/styles';

export const ButtonFocusTest_deprecated: React.FunctionComponent = () => {
  const [state, setState] = React.useState({
    focused: false,
  });
  const buttonRef = React.useRef<IFocusable>(null);

  const onFocus = React.useCallback(() => {
    setState({ focused: !state.focused });
    if (buttonRef.current && !state.focused) {
      buttonRef.current.focus();
    }
  }, [state, setState]);

  return (
    <Stack style={stackStyle}>
      <Button content={state.focused ? 'Focused' : 'Not Focused'} componentRef={buttonRef} accessibilityLabel="overridden button name" />
      <Button content="Click to focus" onClick={onFocus} tooltip="button tooltip" />
      <Button content="Disabled Button" onClick={onFocus} tooltip="disabled button" disabled />
    </Stack>
  );
};
