import * as React from 'react';
import * as ReactNative from 'react-native';
import { ScrollView } from 'react-native';
import { Stack, Text, Button, Pressable, IPressableState, PrimaryButton, StealthButton } from '../components';
import { Square } from './Square';
import { registerThemes } from './CustomThemes';
import { ThemeProvider, useTheme } from '@uifabricshared/theming-react-native';
import { FocusTrapTest } from './FocusTrapZoneTest';
import { SeparatorTest } from './SeparatorTest';
import { LinkTest } from './LinkTest.win32';
import { ButtonTest } from './ButtonTest';
// import RNTesterApp = require('./RNTester.win32');

// uncomment the below lines to enable message spy
/*
const msgq = require('MessageQueue');
msgq.spy(true);
*/

registerThemes();

const styles = ReactNative.StyleSheet.create({
  viewStyle: {
    minHeight: 200,
    justifyContent: 'space-between'
  },
  stackStyle: {
    borderWidth: 2,
    borderColor: '#bdbdbd',
    padding: 12,
    margin: 8
  },
  separatorStackStyle: {
    height: 200,
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  }
});

const Panel: React.FunctionComponent = () => {
  const [disabled, setDisabled] = React.useState(false);
  const onClick = React.useCallback(() => setDisabled(!disabled), [disabled, setDisabled]);
  const theme = useTheme();
  return (
    <ReactNative.View style={[styles.viewStyle, styles.stackStyle, { backgroundColor: theme.colors.background }]}>
      <PrimaryButton onClick={onClick} content="Primary Button" disabled={disabled} />
      <Button onClick={onClick} content="Default Button" disabled={disabled} />
      <StealthButton onClick={onClick} content="Stealth Button" disabled={disabled} />
      <Text>This is a text element</Text>
      <Button onClick={onClick} content="This button has longer text" disabled={disabled} />
    </ReactNative.View>
  );
};

export class FabricTester extends React.Component<{}, { c: number; t: string }> {
  constructor(props: object) {
    super(props);
    this.state = { c: 0, t: 'Clicked 0 times' };
  }

  public render(): JSX.Element {
    return (
      <ScrollView>
        <Stack gap={2}>
          <Stack horizontal gap={5}>
            <Square color="blue" />
            <Pressable renderStyle={this._pressableRenderStyle}>
              <Square />
            </Pressable>
            <Square color="green" />
          </Stack>
          <Panel />
          <ThemeProvider theme="Caterpillar">
            <Panel />
          </ThemeProvider>
          <FocusTrapTest />
          <SeparatorTest />
          <LinkTest />
          <ButtonTest />
        </Stack>
      </ScrollView>
    );
  }

  private _pressableRenderStyle = (state: IPressableState): ReactNative.ViewStyle => {
    return (state.pressed && { opacity: 0.5 }) || {};
  };
}
