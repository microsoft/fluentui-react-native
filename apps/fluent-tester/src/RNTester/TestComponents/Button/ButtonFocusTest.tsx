// import { Button } from '@fluentui-react-native/button';
// import { IFocusable } from '@fluentui-react-native/interactive-hooks';
// import { Stack } from '@fluentui-react-native/stack';
// import * as React from 'react';
// import { View, findNodeHandle, Text } from 'react-native';
// import { Separator } from '@fluentui-react-native/separator';
// import { stackStyle, commonTestStyles as commonStyles } from '../Common/styles';
// import { BUTTON_TESTPAGE } from './consts';

// export const ButtonFocusTest: React.FunctionComponent<{}> = () => {
//   const [state, setState] = React.useState({
//     focused: false
//   });
//   const buttonRef = React.useRef<IFocusable>(null);

//   const onFocus = React.useCallback(() => {
//     setState({ focused: !state.focused });
//     if (buttonRef.current && !state.focused) {
//       const node = findNodeHandle(buttonRef.current);
//       console.log(node);
//       buttonRef.current.focus();

//     }
//   }, [state, setState]);

//   return (
//     <View>
//       <Text style={commonStyles.section} testID={BUTTON_TESTPAGE}>
//         Basic Buttons
//       </Text>
//       <Separator />
//       <Stack style={stackStyle}>
//         <Button content={state.focused ? 'Focused' : 'Not Focused'} componentRef={buttonRef} accessibilityLabel="overridden button name" />
//         <Button content="Click to focus" onClick={onFocus} tooltip="button tooltip" />
//       </Stack>
//     </View>
//   );
// };

import { Button } from '@fluentui-react-native/button';
import { IFocusable } from '@fluentui-react-native/interactive-hooks';
import { Stack } from '@fluentui-react-native/stack';
import * as React from 'react';
import { findNodeHandle } from 'react-native';
import { stackStyle } from '../Common/styles';
import { BUTTON_TESTPAGE } from './consts';
import { Test, TestSection } from '../Test';

const basicButton: React.FunctionComponent<{}> = () => {
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
      <Button content={state.focused ? 'Focused' : 'Not Focused'} componentRef={buttonRef} accessibilityLabel="overridden button name" />
      <Button content="Click to focus" onClick={onFocus} tooltip="button tooltip" />
    </Stack>
  );
}

const buttonSections: TestSection[] = [
  {
    name: 'Basic Button',
    testID: BUTTON_TESTPAGE,
    component: basicButton
  }
];

export const ButtonFocusTest: React.FunctionComponent<{}> = () => {
  return (
    <Test name="Button Test" description="No description." sections={buttonSections} winStatus="BETA" iosStatus="EXPERIMENTAL" macosStatus="EXPERIMENTAL" androidStatus="EXPERIMENTAL"></Test>
  );
};