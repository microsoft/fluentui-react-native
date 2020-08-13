import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Separator } from '@fluentui-react-native/separator';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from './Common/styles';
import { app } from '../FabricTester';

export type TestSection = {
  name: string;
  testID?: string;
  component: React.FunctionComponent<{}>;
};

export type Status = 'Production' | 'Beta' | 'Experimental' | 'Backlog' | 'N/A';
export type PlatformStatus = {
  win32Status: Status;
  uwpStatus: Status;
  iosStatus: Status;
  macosStatus: Status;
  androidStatus: Status;
}

export interface TestProps {
  name: string;
  description: string;
  status: PlatformStatus;
  sections: TestSection[];
}

const styles = StyleSheet.create({
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0B6A0B',
    marginTop: 4
  },
  description: {
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  section: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0B6A0B',
    marginTop: 12
  },
  statusView: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  statusHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0B6A0B',
    marginBottom: 6
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0B6A0B',
    marginTop: 2,
    marginStart: 4,
  },
  status: {
    color: 'black',
    fontWeight: 'normal',
  }
});

export const Test = (props: TestProps) => {

  const themeColor = () => {

    var color = "black"; // default: office (black)

    if (app == 'office') color = 'black';
    if (app == 'word') color = '#2B579A';
    if (app == 'excel') color = '#217346';
    if (app == 'powerpoint') color = '#B7472A';
    if (app == 'outlook') color = '#106EBE';

    return { color: color };
  }

  return (
    <View>
      <Text style={[styles.name, themeColor()]}>{props.name}</Text>
      <Separator />
      <Stack style={stackStyle}>
        <Text style={styles.description}>{props.description}</Text>
      </Stack>
      <Stack style={stackStyle}>
        <View style={styles.statusView}>

          <Stack>
            <Text style={[styles.statusHeader, themeColor()]}>Platform Status</Text>
            <Text style={[styles.statusLabel, themeColor()]}>
              Win32:{' '}
              <Text style={styles.status}>{props.status.win32Status}</Text>
            </Text>
            <Text style={[styles.statusLabel, themeColor()]}>
              UWP:{' '}
              <Text style={styles.status}>{props.status.uwpStatus}</Text>
            </Text>
            <Text style={[styles.statusLabel, themeColor()]}>
              iOS:{' '}
              <Text style={styles.status}>{props.status.iosStatus}</Text>
            </Text>
            <Text style={[styles.statusLabel, themeColor()]}>
              macOS:{' '}
              <Text style={styles.status}>{props.status.macosStatus}</Text>
            </Text>
            <Text style={[styles.statusLabel, themeColor()]}>
              Android:{' '}
              <Text style={styles.status}>{props.status.androidStatus}</Text>
            </Text>
          </Stack>

          <Stack style={stackStyle}>
            <Text style={[styles.statusHeader, themeColor()]}>Status Definitions</Text>
            <Text style={[styles.statusLabel, themeColor()]}>
              Production:{' '}
              <Text style={styles.status}>Control is ready for broad partner use and to be used in production-ready scenarios.</Text>
            </Text>
            <Text style={[styles.statusLabel, themeColor()]}>
              Beta:{' '}
              <Text style={styles.status}>Control is ready for partner consumption, but not ready for production release (e.g. fixing bugs).</Text>
            </Text>
            <Text style={[styles.statusLabel, themeColor()]}>
              Experimental:{' '}
              <Text style={styles.status}>Control code checked into repo, but not ready for partner use.</Text>
            </Text>
            <Text style={[styles.statusLabel, themeColor()]}>
              Backlog:{' '}
              <Text style={styles.status}>Control is in plan and on our backlog to deliver.</Text>
            </Text>
            <Text style={[styles.statusLabel, themeColor()]}>
              N/A:{' '}
              <Text style={styles.status}>Control is not in current plan.</Text>
            </Text>
          </Stack>

        </View>
      </Stack>
      {props.sections.map((section, index) => {
        const TestComponent = section.component;
        return (
          <View key={index}>
            <Text style={[styles.section, themeColor()]} testID={section.testID}>{section.name}</Text>
            <Separator />
            <TestComponent />
          </View>
        );
      })}
    </View>
  );
};