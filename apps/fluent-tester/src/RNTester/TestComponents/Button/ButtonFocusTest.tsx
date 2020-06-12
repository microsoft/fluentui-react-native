import * as React from 'react';
import { findNodeHandle } from 'react-native';
import { Button, IFocusable } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { BUTTON_TESTPAGE } from './consts';

export const ButtonFocusTest: React.FunctionComponent<{}> = () => {
  const [state, setState] = React.useState({
    focused: false
  });
  const buttonRef = React.useRef<IFocusable>(null);

  const onFocus = React.useCallback(() => {
    setState({ focused: !state.focused });
    if (buttonRef.current && !state.focused) {
      const node = findNodeHandle(buttonRef.current);
      console.log(node);
      buttonRef.current.focus();

    }
  }, [state, setState]);

  return (
    <Stack style={stackStyle}>
      <Button
        testID={BUTTON_TESTPAGE}
        content={state.focused ? 'Focused' : 'Not Focused'}
        componentRef={buttonRef}
        accessibilityLabel="overridden button name"
      />
      <Button content="Click to focus" onClick={onFocus} tooltip="button tooltip" />
    </Stack>
  );
};
