import * as React from 'react';

import { ButtonV1 as Button } from '@fluentui/react-native';
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
    (<Stack>
      <Button componentRef={buttonRef} accessibilityLabel="overridden button name">{state.focused ? 'Focused' : 'Not Focused'}</Button>
      <Button onClick={onFocus} tooltip="button tooltip">Click to focus</Button>
      <Button onClick={onFocus} tooltip="disabled button" disabled>Disabled Button</Button>
      <Button onClick={onFocus} appearance='primary'>Primary Button</Button>
      <Button onClick={onFocus} appearance='subtle'>Stealth Button</Button>
      <Button icon={testImage} tooltip="button tooltip" iconPosition='before'>Button with png Icon</Button>
      <Button icon={iconProps} tooltip="button tooltip" iconPosition='after'>Button with Right Icon</Button>
    </Stack>)
  );
};
