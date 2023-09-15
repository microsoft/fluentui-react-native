import * as React from 'react';
import { Platform, Switch, View } from 'react-native';

import { Text } from '@fluentui/react-native';
import { Button } from '@fluentui-react-native/button';
import { NativeDatePicker } from '@fluentui-react-native/experimental-native-date-picker';
import { Stack } from '@fluentui-react-native/stack';

import { NATIVEDATEPICKER_TESTPAGE } from './consts';
import { stackStyle, commonTestStyles as commonStyles } from '../Common/styles';
import type { PlatformStatus, TestSection } from '../Test';
import { Test } from '../Test';

const NativeDatePickerAndroidUsage: React.FunctionComponent = () => {
  const today = new Date();
  const [startDate, setStartDate] = React.useState<Date>(today);
  const [endDate, setEndDate] = React.useState<Date>(today);

  return (
    <Stack style={stackStyle}>
      <Text variant="headerStandard">Selected Start Date/Time</Text>
      <Text variant="subheaderStandard">
        {startDate?.toString()} {'\n'}
      </Text>

      <Text variant="headerStandard">Selected End Date/Time</Text>
      <Text variant="subheaderStandard">
        {endDate?.toString() ?? 'N/A'} {'\n'}
      </Text>

      <Button
        content="Date Picker"
        onClick={() => {
          NativeDatePicker.present({
            mode: 'date',
            startDate: startDate,
            endDate: endDate,
            callback: (date1: string, date2: string) => {
              console.warn(`${date1} - ${date2}`);
              setStartDate(NativeDatePicker.parseISOString(date1));
            },
          });
        }}
      />
      <Text variant="headerStandard">Ranged Datepicker</Text>
      <View style={{ flexDirection: 'row' }}>
        <Button
          content="Start Date"
          onClick={() => {
            NativeDatePicker.present({
              mode: 'dateRange',
              dateRangeMode: 'start',
              startDate: startDate,
              endDate: endDate,
              callback: (date1: string, date2: string) => {
                console.warn(`${date1} - ${date2}`);
                setStartDate(NativeDatePicker.parseISOString(date1));
                setEndDate(NativeDatePicker.parseISOString(date2));
              },
            });
          }}
        />

        <Button
          content="End Date"
          onClick={() => {
            NativeDatePicker.present({
              mode: 'dateRange',
              dateRangeMode: 'end',
              startDate: startDate,
              endDate: endDate,
              callback: (date1: string, date2: string) => {
                console.warn(`${date1} - ${date2}`);
                setStartDate(NativeDatePicker.parseISOString(date1));
                setEndDate(NativeDatePicker.parseISOString(date2));
              },
            });
          }}
        />
      </View>

      <Text variant="headerStandard">Date and Time</Text>
      <Button
        content="Date Time Picker"
        onClick={() => {
          NativeDatePicker.present({
            mode: 'dateTime',
            startDate: startDate,
            endDate: endDate,
            callback: (date1: string, date2: string) => {
              console.warn(`${date1} - ${date2}`);
              setStartDate(NativeDatePicker.parseISOString(date1));
            },
          });
        }}
      />

      <Text variant="headerStandard">Ranged Date Time Picker</Text>
      <View style={{ flexDirection: 'row' }}>
        <Button
          content="Date Time Range"
          onClick={() => {
            NativeDatePicker.present({
              mode: 'dateTimeRange',
              dateRangeMode: 'start',
              startDate: startDate,
              endDate: endDate,
              callback: (date1: string, date2: string) => {
                console.warn(`${date1} - ${date2}`);
                setStartDate(NativeDatePicker.parseISOString(date1));
                setEndDate(NativeDatePicker.parseISOString(date2));
              },
            });
          }}
        />
      </View>
    </Stack>
  );
};

const NativeDatePickeriOSUsage: React.FunctionComponent = () => {
  const [startDate, setStartDate] = React.useState<Date>(new Date());
  const [endDate, setEndDate] = React.useState<Date>(null);
  const [customCalendarConfiguration, setCustomCalendarConfiguration] = React.useState(false);

  function didPickDates(pickedStartDate: string, pickedEndDate: string) {
    setStartDate(NativeDatePicker.parseISOString(pickedStartDate));
    setEndDate(NativeDatePicker.parseISOString(pickedEndDate));
  }

  const today = new Date();

  // Here we set up some common options and use the spread operator to copy them repeatedly into examples.
  const fixedDates = {
    startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
    endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14),
  };

  const customReferenceStartDate = today;
  const customReferenceEndDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const defaultReferenceStartDate = new Date(today.getFullYear() - 3, 1, 1);
  const defaultReferenceEndDate = new Date(defaultReferenceStartDate.getFullYear() + 10, 1, 1);

  const referenceStartDate = customCalendarConfiguration ? customReferenceStartDate : defaultReferenceStartDate;
  const referenceEndDate = customCalendarConfiguration ? customReferenceEndDate : defaultReferenceEndDate;

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
      <Text variant="headerStandard">Selected Start Date/Time</Text>
      <Text variant="subheaderStandard">
        {startDate?.toString()} {'\n'}
      </Text>

      <Text variant="headerStandard">Selected End Date/Time</Text>
      <Text variant="subheaderStandard">
        {endDate?.toString() ?? 'N/A'} {'\n'}
      </Text>

      <Button
        content="Date picker"
        onClick={() =>
          NativeDatePicker.present({
            referenceStartDate: referenceStartDate,
            referenceEndDate: referenceEndDate,
            callback: didPickDates,
          })
        }
      />
      <Button
        content="Date time picker"
        onClick={() =>
          NativeDatePicker.present({
            mode: 'dateTime',
            referenceStartDate: referenceStartDate,
            referenceEndDate: referenceEndDate,
            callback: didPickDates,
          })
        }
      />
      <Button
        content="Preselected date"
        onClick={() =>
          NativeDatePicker.present({
            startDate: fixedDates.startDate,
            referenceStartDate: referenceStartDate,
            referenceEndDate: referenceEndDate,
            callback: didPickDates,
          })
        }
      />
      <Button
        content="Date range (tabbed)"
        onClick={() =>
          NativeDatePicker.present({
            mode: 'dateRange',
            referenceStartDate: referenceStartDate,
            referenceEndDate: referenceEndDate,
            callback: didPickDates,
          })
        }
      />
      <Button
        content="Date range (tabbed) remembering last selection"
        onClick={() =>
          NativeDatePicker.present({
            mode: 'dateRange',
            startDate: startDate,
            endDate: endDate,
            referenceStartDate: referenceStartDate,
            referenceEndDate: referenceEndDate,
            callback: didPickDates,
          })
        }
      />

      {/* Shows 'Date Title' and 'Date Subtitle' only.  Other titles are ignored. */}
      <Button
        content="Date with custom titles"
        onClick={() =>
          NativeDatePicker.present({
            ...fixedDates,
            referenceStartDate: referenceStartDate,
            referenceEndDate: referenceEndDate,
            ...titles,
            callback: didPickDates,
          })
        }
      />

      {/* Shows 'Date Title' and 'Date Subtitle' on the first page;
          shows 'Time Title' and 'Time Subtitle' on the second page. */}
      <Button
        content="Date time with custom titles"
        onClick={() =>
          NativeDatePicker.present({
            mode: 'dateTime',
            ...fixedDates,
            referenceStartDate: referenceStartDate,
            referenceEndDate: referenceEndDate,
            ...titles,
            callback: didPickDates,
          })
        }
      />

      {/* Shows 'Start Title' and 'Start Subtitle' on the first page;
          shows 'End Title' and 'End Subtitle' on the second page. */}
      <Button
        content="Date range with custom titles (paged)"
        onClick={() =>
          NativeDatePicker.present({
            mode: 'dateRange',
            dateRangePresentation: 'paged',
            ...fixedDates,
            referenceStartDate: referenceStartDate,
            referenceEndDate: referenceEndDate,
            ...titles,
            callback: didPickDates,
          })
        }
      />

      {/* Shows 'Date Title', 'Date Subtitle', 'Start Tab' and 'End Tab'. */}
      <Button
        content="Date range with custom titles (tabbed)"
        onClick={() =>
          NativeDatePicker.present({
            mode: 'dateRange',
            ...fixedDates,
            referenceStartDate: referenceStartDate,
            referenceEndDate: referenceEndDate,
            ...titles,
            callback: didPickDates,
          })
        }
      />

      {/* WARNING:  The paged presentation mode of the date time range picker is bugged.
                    It shows only a time picker with start and end tabs. */}
      {/* <Button
        content="Date time range with custom titles (paged)"
        onClick={() =>
          NativeDatePicker.present({
            mode: 'dateTimeRange',
            dateRangePresentation: 'paged',
            ...fixedDates,
            referenceStartDate: referenceStartDate,
            referenceEndDate: referenceEndDate,
            ...titles,
            callback: didPickDates,
          })
        }
      /> */}

      {/* Shows 'Date Title', 'Date Subtitle', 'Start Tab' and 'End Tab' on the first page;
          shows 'Time Title', 'Time Subtitle', 'Start Tab' and 'End Tab' on the second page */}
      <Button
        content="Date time range with custom titles (tabbed)"
        onClick={() =>
          NativeDatePicker.present({
            mode: 'dateTimeRange',
            ...fixedDates,
            referenceStartDate: referenceStartDate,
            referenceEndDate: referenceEndDate,
            ...titles,
            callback: didPickDates,
          })
        }
      />

      <View style={commonStyles.switch}>
        <Text variant="headerStandard">Custom calendar configuration</Text>
        <Switch
          value={customCalendarConfiguration}
          onValueChange={(value) => {
            setCustomCalendarConfiguration(value);
          }}
        />
      </View>
      <Text variant="subheaderStandard">Reference start date: {customReferenceStartDate.toDateString()}</Text>
      <Text variant="subheaderStandard">Reference end date: {customReferenceEndDate.toDateString()}</Text>
    </Stack>
  );
};

const nativeDatePickerSections: TestSection[] = [
  ...Platform.select({
    android: [
      {
        name: 'Native Date Picker',
        component: NativeDatePickerAndroidUsage,
      },
    ],
    default: [
      {
        name: 'Native Date Picker',
        testID: NATIVEDATEPICKER_TESTPAGE,
        component: NativeDatePickeriOSUsage,
      },
    ],
  }),
];

export const NativeDatePickerTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'N/A',
    uwpStatus: 'N/A',
    iosStatus: 'Experimental',
    macosStatus: 'N/A',
    androidStatus: 'Experimental',
  };

  const description = 'A Native date picker component using the Fluent Design System.';

  return <Test name="Native Date Picker Test" description={description} sections={nativeDatePickerSections} status={status}></Test>;
};
