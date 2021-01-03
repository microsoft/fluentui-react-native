import { NativeButton } from '@fluentui-react-native/experimental-native-button';
import { NATIVEBUTTON_TESTPAGE } from './consts';
import * as React from 'react';
import { processColor } from 'react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { PlatformStatus, Test, TestSection } from '../Test';

export const nativeButtoniOS: React.FunctionComponent<{}> = () => {
  return (
    <Stack style={stackStyle}>
      <NativeButton
        title="Primary"
        buttonStyle="primary"
        style={{ width: 150, height: 35, marginBottom: 15 }}
        onPress={() => alert('Primary button clicked!')}
      />
      <NativeButton
        title="Secondary disabled"
        buttonStyle="secondary"
        isEnabled={false}
        style={{ width: 230, height: 35, marginBottom: 15 }}
      />
      <NativeButton
        title="Borderless"
        buttonStyle="borderless"
        style={{ width: 150, height: 35, marginBottom: 15 }}
        onPress={() => alert('Borderless button clicked!')}
      />
    </Stack>
  );
};

export const nativeButtonMacOS: React.FunctionComponent<{}> = () => {
  const CustomNativeButton = NativeButton.customize({
    contentTintColor: processColor('white'),
    accentColor: processColor('orange'),
  });
  return (
    <Stack style={stackStyle}>
      <NativeButton
        title="Primary"
        buttonStyle="primary"
        style={{ width: 150, height: 30, marginBottom: 15 }}
        onPress={() => alert('Primary button clicked!')}
      />
      <NativeButton
        title="Secondary"
        buttonStyle="secondary"
        style={{ width: 150, height: 30, marginBottom: 15 }}
        onPress={() => alert('Secondary button clicked! ')}
      />
      <NativeButton
        title="Borderless"
        buttonStyle="borderless"
        style={{ width: 150, height: 30, marginBottom: 15 }}
        onPress={() => alert('Borderless button clicked!')}
      />
      <NativeButton
        title="Acrylic"
        buttonStyle="acrylic"
        style={{ width: 150, height: 30, marginBottom: 15 }}
        onPress={() => alert('Acrylic button clicked!')}
      />
      <CustomNativeButton
        title="Custom Button"
        buttonStyle="primary"
        style={{ width: 200, height: 30, marginBottom: 15 }}
        onPress={() => alert('Custom button clicked!')}
      />
      <NativeButton title="Primary disabled" buttonStyle="primary" isEnabled={false} style={{ width: 200, height: 30, marginBottom: 15 }} />
    </Stack>
  );
};

const nativeButtonSections: TestSection[] = [
  {
    name: 'iOS Native Button',
    testID: NATIVEBUTTON_TESTPAGE,
    component: nativeButtoniOS,
  },
  {
    name: 'macOS Native Button',
    testID: NATIVEBUTTON_TESTPAGE,
    component: nativeButtonMacOS,
  },
];

export const NativeButtonTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'N/A',
    uwpStatus: 'N/A',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'N/A',
  };

  const description = 'Native button is awesome.';

  return <Test name="Native Button Test" description={description} sections={nativeButtonSections} status={status}></Test>;
};
