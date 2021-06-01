import { Button } from '@fluentui-react-native/button';
import { MSFDatePickerManager } from '@fluentui-react-native/experimental-native-date-picker';
import { NATIVEDATEPICKER_TESTPAGE } from './consts';
import * as React from 'react';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { PlatformStatus, Test, TestSection } from '../Test';
import { Text } from '@fluentui/react-native';

const nativeDatePicker: React.FunctionComponent<{}> = () => {
  const [date, setDate] = React.useState('Foo')

return (
    <Stack style={stackStyle}>
      <Text>{date}</Text>
      <Button content="Get Date" onClick={() => setDate(MSFDatePickerManager.startDate)} />
      <Button content="Show date picker" onClick={() => MSFDatePickerManager.present()} />
      <Button content="Show date time picker" onClick={() => {
        var dp = MSFDatePickerManager
        dp.mode = "dateTime"
        dp.present()
      }} />
      <Button content="3" />
      <Button content="4" />
      <Text>{ MSFDatePickerManager.date }</Text>
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
