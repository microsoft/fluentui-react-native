import { Button } from '@fluentui-react-native/button';
import { NativeDatePicker } from '@fluentui-react-native/experimental-native-date-picker';
import { NATIVEDATEPICKER_TESTPAGE } from './consts';
import { PlatformStatus, Test, TestSection } from '../Test';
import * as React from 'react';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { Text } from '@fluentui/react-native';

const nativeDatePicker: React.FunctionComponent<{}> = () => {
  const [startDate, setStartDate] = React.useState(Date())
  const [endDate, setEndDate] = React.useState(null)

  function didPickDates(pickedStartDate: string, pickedEndDate: string) {
    setStartDate(pickedStartDate)
    setEndDate(pickedEndDate)
  }

  // Here we set up some common options and use the spread operator to copy them repeatedly into examples.
  const fixedDates = {
    startDate: "2020-02-28T12:00:00.000Z",
    endDate: "2020-03-07T12:00:00.000Z",
  };
  const currentDates = {
    startDate: startDate,
    endDate: endDate,
  }
  const titles = {
    startTitle: "Start Title",
    startSubitle: "Start Subtitle",
    startTab: "Start Tab",
    endTitle: "End Title",
    endSubtitle: "End Subtitle",
    endTab: "End Tab",
    dateTitle: "Date Title",
    dateSubtitle: "Date Subtitle",
    timeTitle: "Time Title",
    timeSubtitle: "Time Subtitle",
  };

    return (
    <Stack style={stackStyle}>
      <Text>Start Date: {startDate}</Text>
      <Text>End Date: {endDate}</Text>
      <Button content="Simple date picker" onClick={() => NativeDatePicker.presentSimple(didPickDates)}/>
      <Button content="Date picker" onClick={() => NativeDatePicker.present({callback: didPickDates})}/>
      <Button content="Date time picker" onClick={() => NativeDatePicker.present({callback: didPickDates, mode: "dateTime"})}/>
      <Button content="Preselected date" onClick={() => NativeDatePicker.present({callback: didPickDates, startDate: fixedDates.startDate})}/>
      <Button content="Date range (tabbed)" onClick={() => NativeDatePicker.present({callback: didPickDates, mode: "dateRange"})}/>
      <Button content="Date range (tabbed) remembering last selection" onClick={() => NativeDatePicker.present({callback: didPickDates, mode: "dateRange", ...currentDates})}/>

      {/* Shows "Date Title" and "Date Subtitle" only.  Other titles are ignored. */}
      <Button content="Date with custom titles" onClick={() => NativeDatePicker.present({callback: didPickDates, ...fixedDates, ...titles})}/>

      {/* Shows "Date Title" and "Date Subtitle" on the first page;
          shows "Time Title" and "Time Subtitle" on the second page. */}
      <Button content="Date time with custom titles" onClick={() => NativeDatePicker.present({callback: didPickDates, mode: "dateTime", ...fixedDates, ...titles})}/>

      {/* Shows "Start Title" and "Start Subtitle" on the first page;
          shows "End Title" and "End Subtitle" on the second page. */}
      <Button content="Date range with custom titles (paged)" onClick={() => NativeDatePicker.present({callback: didPickDates, mode: "dateRange", dateRangePresentation: "paged", ...fixedDates, ...titles})}/>

      {/* Shows "Date Title", "Date Subtitle", "Start Tab" and "End Tab". */}
      <Button content="Date range with custom titles (tabbed)" onClick={() => NativeDatePicker.present({callback: didPickDates, mode: "dateRange", ...fixedDates, ...titles})}/>

      {/* WARNING: The paged presenetation mode of the date time range picker is bugged.  It shows only a time picker with start and end tabs. */}
      {/* <Button content="Date time range with custom titles (paged)" onClick={() => NativeDatePicker.present({callback: didPickDates, mode: "dateTimeRange", dateRangePresentation: "paged", ...fixedDates, ...titles})}/> */}

      {/* Shows "Date Title", "Date Subtitle", "Start Tab" and "End Tab" on the first page;
          shows "Time Title", "Time Subtitle", "Start Tab" and "End Tab" on the second page */}
      <Button content="Date time range with custom titles (tabbed)" onClick={() => NativeDatePicker.present({callback: didPickDates, mode: "dateTimeRange", ...fixedDates, ...titles})}/>
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
