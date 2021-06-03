import { Button } from '@fluentui-react-native/button';
import { NativeDatePicker } from '@fluentui-react-native/experimental-native-date-picker';
import { NATIVEDATEPICKER_TESTPAGE } from './consts';
import * as React from 'react';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { PlatformStatus, Test, TestSection } from '../Test';

const nativeDatePicker: React.FunctionComponent<{}> = () => {
  // The arg list is flat, but for presentWithOptionsAndTitles it's also very long.
  // We'll set up some common options and use the spread operator to copy them.
  const dates = [
    "2020-02-28T12:00:00.000Z",
    "2020-03-07T12:00:00.000Z",
  ];
  const titles = [
    "Start Title",
    "Start Subtitle",
    "Start Tab",
    "End Title",
    "End Subtitle",
    "End Tab",
    "Date Title",
    "Date Subtitle",
    "Time Title",
    "Time Subtitle",
  ];

    return (
    <Stack style={stackStyle}>
      <Button content="Date picker" onClick={() => NativeDatePicker.present()}/>

      {/* The dateRangePresentation (#2) and endDate (#5) args are ignored in the following two cases. */}
      <Button content="Date time picker" onClick={() => NativeDatePicker.presentWithOptions("dateTime", "tabbed", "calendar", null, null)}/>
      <Button content="Preselected date" onClick={() => NativeDatePicker.presentWithOptions("date", "tabbed", "calendar", "2020-02-29T12:00:00.000Z", null)}/>

      <Button content="Date range (tabbed)" onClick={() => NativeDatePicker.presentWithOptions("dateRange", "tabbed", "calendar", null, null)}/>

      {/* Shows "Date Title" and "Date Subtitle" only.  Other title args are ignored. */}
      <Button content="Date with custom titles" onClick={() => NativeDatePicker.presentWithOptionsAndTitles("date", "tabbed", "calendar", ...dates, ...titles)}/>

      {/* Shows "Date Title" and "Date Subtitle" on the first page;
          shows "Time Title" and "Time Subtitle" on the second page. */}
      <Button content="Date time with custom titles" onClick={() => NativeDatePicker.presentWithOptionsAndTitles("dateTime", "tabbed", "calendar", ...dates, ...titles)}/>

      {/* Shows "Start Title" and "Start Subtitle" on the first page;
          shows "End Title" and "End Subtitle" on the second page. */}
      <Button content="Date range with custom titles (paged)" onClick={() => NativeDatePicker.presentWithOptionsAndTitles("dateRange", "paged", "calendar", ...dates, ...titles)}/>

      {/* Shows "Date Title", "Date Subtitle", "Start Tab" and "End Tab". */}
      <Button content="Date range with custom titles (tabbed)" onClick={() => NativeDatePicker.presentWithOptionsAndTitles("dateRange", "tabbed", "calendar", ...dates, ...titles)}/>

      {/* NOTE: The paged presenetation mode of the date time range picker is bugged.  It shows a time picker with start and end tabs. */}
      {/* <Button content="Date time range with custom titles (paged)" onClick={() => NativeDatePicker.presentWithOptionsAndTitles("dateTimeRange", "paged", "calendar", ...dates, ...titles)}/> */}

      {/* Shows "Date Title", "Date Subtitle", "Start Tab" and "End Tab" on the first page;
          shows "Time Title", "Time Subtitle", "Start Tab" and "End Tab" on the second page */}
      <Button content="Date time range with custom titles (tabbed)" onClick={() => NativeDatePicker.presentWithOptionsAndTitles("dateTimeRange", "tabbed", "calendar", ...dates, ...titles)}/>
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
