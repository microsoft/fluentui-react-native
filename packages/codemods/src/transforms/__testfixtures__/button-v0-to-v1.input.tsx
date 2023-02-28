import * as React from 'react';

import { Button, PrimaryButton, StealthButton } from '@fluentui/react-native';
import type { SvgIconProps } from '@fluentui-react-native/icon';
import type { IFocusable } from '@fluentui-react-native/interactive-hooks';
import { Stack } from '@fluentui-react-native/stack';

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
  const testImage = require('./assets/icon_24x24.png');

  const svgProps: SvgIconProps = {
    viewBox: '0 0 500 500',
  };
  const iconProps = { svgSource: svgProps, width: 20, height: 20 };

  return (
    <Stack>
      <Button content={state.focused ? 'Focused' : 'Not Focused'} componentRef={buttonRef} accessibilityLabel="overridden button name" />
      <Button content="Click to focus" onClick={onFocus} tooltip="button tooltip" />
      <Button content="Disabled Button" onClick={onFocus} tooltip="disabled button" disabled />
      <PrimaryButton content="Primary Button" onClick={onFocus} />
      <StealthButton content="Stealth Button" onClick={onFocus} />
      <Button startIcon={testImage} content="Button with png Icon" tooltip="button tooltip" />
      <Button endIcon={iconProps} content="Button with Right Icon" tooltip="button tooltip" />
    </Stack>
  );
};
