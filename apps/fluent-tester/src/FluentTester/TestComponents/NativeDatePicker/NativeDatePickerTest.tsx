import { Button } from '@fluentui-react-native/button';
import { NativeDatePicker } from '@fluentui-react-native/experimental-native-date-picker';
import { NATIVEDATEPICKER_TESTPAGE } from './consts';
import { PlatformStatus, Test, TestSection } from '../Test';
import * as React from 'react';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { Text } from '@fluentui/react-native';

const nativeDatePicker: React.FunctionComponent<{}> = () => {
  const [startDate, setStartDate] = React.useState<Date>(new Date())
  const [endDate, setEndDate] = React.useState<Date>(null)

  function didPickDates(pickedStartDate: string, pickedEndDate: string) {
    setStartDate(NativeDatePicker.parseISOString(pickedStartDate));
    setEndDate(NativeDatePicker.parseISOString(pickedEndDate));
  }

  // Here we set up some common options and use the spread operator to copy them repeatedly into examples.
  const fixedDates = {
    startDate: NativeDatePicker.parseISOString('2020-02-29T12:25:00.000Z'),
    endDate: NativeDatePicker.parseISOString('2020-03-07T11:55:00.000Z'),
  };
  const titles = {
    startTitle: 'Start Title',
    startSubitle: 'Start Subtitle',
    startTab: 'Start Tab',
    endTitle: 'End Title',
    endSubtitle: 'End Subtitle',
    endTab: 'End Tab',
    dateTitle: 'Date Title',
    dateSubtitle: 'Date Subtitle',
    timeTitle: 'Time Title',
    timeSubtitle: 'Time Subtitle',
  };

    return (
    <Stack style={stackStyle}>
      <Text variant='headerStandard'>Start Date/Time</Text>
      <Text variant='subheaderStandard'>{startDate?.toString()} {'\n'}</Text>

      <Text variant='headerStandard'>End Date/Time</Text>
      <Text variant='subheaderStandard'>{endDate?.toString()} {'\n'}</Text>

      <Button
        content='Date picker'
        onClick={() => NativeDatePicker.present({callback: didPickDates})}
      />
      <Button
        content='Date time picker'
        onClick={() => NativeDatePicker.present({mode: 'dateTime', callback: didPickDates})}
      />
      <Button
        content='Preselected date'
        onClick={() => NativeDatePicker.present({startDate: fixedDates.startDate, callback: didPickDates})}
      />
      <Button
        content='Date range (tabbed)'
        onClick={() => NativeDatePicker.present({mode: 'dateRange', callback: didPickDates})}
      />
      <Button
        content='Date range (tabbed) remembering last selection'
        onClick={() => NativeDatePicker.present({mode: 'dateRange', startDate: startDate, endDate: endDate, callback: didPickDates})}
      />

      {/* Shows 'Date Title' and 'Date Subtitle' only.  Other titles are ignored. */}
      <Button
        content='Date with custom titles'
        onClick={() => NativeDatePicker.present({...fixedDates, ...titles, callback: didPickDates})}
      />

      {/* Shows 'Date Title' and 'Date Subtitle' on the first page;
          shows 'Time Title' and 'Time Subtitle' on the second page. */}
      <Button
        content='Date time with custom titles'
        onClick={() => NativeDatePicker.present(
          {mode: 'dateTime', ...fixedDates, ...titles, callback: didPickDates}
        )}
      />

      {/* Shows 'Start Title' and 'Start Subtitle' on the first page;
          shows 'End Title' and 'End Subtitle' on the second page. */}
      <Button
        content='Date range with custom titles (paged)'
        onClick={() => NativeDatePicker.present(
          {mode: 'dateRange', dateRangePresentation: 'paged', ...fixedDates, ...titles, callback: didPickDates}
        )}
      />

      {/* Shows 'Date Title', 'Date Subtitle', 'Start Tab' and 'End Tab'. */}
      <Button 
        content='Date range with custom titles (tabbed)'
        onClick={() => NativeDatePicker.present(
          {mode: 'dateRange', ...fixedDates, ...titles, callback: didPickDates}
        )}
      />

      {/* WARNING:  The paged presenetation mode of the date time range picker is bugged.
                    It shows only a time picker with start and end tabs. */}
      {/* <Button
        content='Date time range with custom titles (paged)'
        onClick={() => NativeDatePicker.present(
          {mode: 'dateTimeRange', dateRangePresentation: 'paged', ...fixedDates, ...titles, callback: didPickDates}
        )}
      /> */}

      {/* Shows 'Date Title', 'Date Subtitle', 'Start Tab' and 'End Tab' on the first page;
          shows 'Time Title', 'Time Subtitle', 'Start Tab' and 'End Tab' on the second page */}
      <Button
        content='Date time range with custom titles (tabbed)'
        onClick={() => NativeDatePicker.present(
          {mode: 'dateTimeRange', ...fixedDates, ...titles, callback: didPickDates}
        )}
      />
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

  return <Test name='Native Date Picker Test' description={description} sections={nativeDatePickerSections} status={status}></Test>;
};
