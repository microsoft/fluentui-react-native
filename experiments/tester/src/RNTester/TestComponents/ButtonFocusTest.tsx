import * as React from 'react';
import { Stack, Button, IFocusable } from '@fluentui/react-native';
import { stackStyle } from '../TesterStyles';

export const ButtonFocusTest: React.FunctionComponent<{}> = () => {
  const [state, setState] = React.useState({
    focused: false
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
      <Button content="Click to focus" onClick={onFocus} />
    </Stack>
  );
};
