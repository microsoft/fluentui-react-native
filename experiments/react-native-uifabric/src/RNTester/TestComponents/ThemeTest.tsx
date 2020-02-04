import * as React from 'react';
import * as ReactNative from 'react-native';
import { ThemeProvider, useTheme } from '@uifabricshared/theming-react-native';
import { commonTestStyles } from '../styles';
import { Button, PrimaryButton, StealthButton, Text } from '../../components';

const Panel: React.FunctionComponent = () => {
  const [disabled, setDisabled] = React.useState(false);
  const onClick = React.useCallback(() => setDisabled(!disabled), [disabled, setDisabled]);
  const theme = useTheme();
  return (
    <ReactNative.View style={[commonTestStyles.viewStyle, commonTestStyles.stackStyle, { backgroundColor: theme.colors.background }]}>
      <PrimaryButton onClick={onClick} content="Primary Button" disabled={disabled} />
      <Button onClick={onClick} content="Default Button" disabled={disabled} />
      <StealthButton onClick={onClick} content="Stealth Button" disabled={disabled} />
      <Text>This is a text element</Text>
      <Button onClick={onClick} content="This button has longer text" disabled={disabled} />
    </ReactNative.View>
  );
};

export const ThemeTest: React.FunctionComponent = () => {
  return (
    <ReactNative.View>
      <Panel />
      <ThemeProvider theme="Caterpillar">
        <Panel />
      </ThemeProvider>
    </ReactNative.View>
  );
};