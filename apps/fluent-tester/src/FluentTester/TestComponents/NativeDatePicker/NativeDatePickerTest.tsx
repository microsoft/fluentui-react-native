import { Button } from '@fluentui-react-native/button';
import { NativeDatePicker } from '@fluentui-react-native/experimental-native-date-picker';
import { NATIVEDATEPICKER_TESTPAGE } from './consts';
import * as React from 'react';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { PlatformStatus, Test, TestSection } from '../Test';

const nativeDatePicker: React.FunctionComponent<{}> = () => {
  return (
    <Stack style={stackStyle}>
      <Button content="1" onClick={() => NativeDatePicker.present()}/>
      <Button content="2" onClick={() => NativeDatePicker.presentWithMode(0)}/>
      <Button content="3" />
      <Button content="4" />
    </Stack>
  );
};

const nativeDatePickerSections: TestSection[] = [
  {
    name: 'Native Date Picker',
    testID: NATIVEDATEPICKER_TESTPAGE,
    component: nativeDatePicker,
  },
];

export const NativeDatePickerTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'N/A',
    uwpStatus: 'N/A',
    iosStatus: 'Experimental',
    macosStatus: 'N/A',
    androidStatus: 'N/A',
  };

  const description =
  'A Native date picker component using the Fluent Design System.  Currently only implemented on iOS.';

  return <Test name="Native Date Picker Test" description={description} sections={nativeDatePickerSections} status={status}></Test>;
};
