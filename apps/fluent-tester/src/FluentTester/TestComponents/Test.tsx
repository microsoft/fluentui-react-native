import * as React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Text, Separator } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from './Common/styles';

export type TestSection = {
  name: string;
  testID?: string;
  component: React.FunctionComponent;
};

export type Status = 'Production' | 'Beta' | 'Experimental' | 'Backlog' | 'N/A';
export type PlatformStatus = {
  win32Status: Status;
  uwpStatus: Status;
  iosStatus: Status;
  macosStatus: Status;
  androidStatus: Status;
};

export interface TestProps {
  name: string;
  description: string;
  status: PlatformStatus;
  sections: TestSection[];
}

const styles = StyleSheet.create({
  name: {
    marginTop: 4,
  },
  description: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  section: {
    marginTop: 12,
  },
  statusView: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  statusHeader: {
    marginBottom: 6,
  },
  statusLabel: {
    marginTop: 2,
    marginStart: 4,
  },
  status: {
    fontWeight: 'normal',
  },
});

// mobile platform check to not render status components.
const isMobile = Platform.OS == 'android' || (Platform.OS == 'ios' && !Platform.isPad);

export const Test = (props: TestProps): React.ReactElement<Record<string, never>> => {
  return (
    <View>
      <Text style={[styles.name]} variant="heroSemibold">
        {props.name}
      </Text>
      <Separator />
      <Stack style={stackStyle}>
        <Text style={styles.description}>{props.description}</Text>
      </Stack>
      {!isMobile && (
        <Stack style={stackStyle}>
          <View style={styles.statusView}>
            <Stack>
              <Text style={[styles.statusHeader]} variant="headerStandard">
                Platform Status
              </Text>
              <Text style={[styles.statusLabel]} variant="bodySemibold">
                Win32: <Text style={styles.status}>{props.status.win32Status}</Text>
              </Text>
              <Text style={[styles.statusLabel]} variant="bodySemibold">
                UWP: <Text style={styles.status}>{props.status.uwpStatus}</Text>
              </Text>
              <Text style={[styles.statusLabel]} variant="bodySemibold">
                iOS: <Text style={styles.status}>{props.status.iosStatus}</Text>
              </Text>
              <Text style={[styles.statusLabel]} variant="bodySemibold">
                macOS: <Text style={styles.status}>{props.status.macosStatus}</Text>
              </Text>
              <Text style={[styles.statusLabel]} variant="bodySemibold">
                Android: <Text style={styles.status}>{props.status.androidStatus}</Text>
              </Text>
            </Stack>

            <Stack style={stackStyle}>
              <Text style={[styles.statusHeader]} variant="headerStandard">
                Status Definitions
              </Text>
              <Text style={[styles.statusLabel]} variant="bodySemibold">
                Production:{' '}
                <Text style={styles.status}>Control is ready for broad partner use and to be used in production-ready scenarios.</Text>
              </Text>
              <Text style={[styles.statusLabel]} variant="bodySemibold">
                Beta:{' '}
                <Text style={styles.status}>
                  Control is ready for partner consumption, but not ready for production release (e.g. fixing bugs).
                </Text>
              </Text>
              <Text style={[styles.statusLabel]} variant="bodySemibold">
                Experimental: <Text style={styles.status}>Control code checked into repo, but not ready for partner use.</Text>
              </Text>
              <Text style={[styles.statusLabel]} variant="bodySemibold">
                Backlog: <Text style={styles.status}>Control is in plan and on our backlog to deliver.</Text>
              </Text>
              <Text style={[styles.statusLabel]} variant="bodySemibold">
                N/A: <Text style={styles.status}>Control is not in current plan.</Text>
              </Text>
            </Stack>
          </View>
        </Stack>
      )}
      {props.sections.map((section, index) => {
        const TestComponent = section.component;
        return (
          <View key={index}>
            <Text style={[styles.section]} variant="headerSemibold" testID={section.testID}>
              {section.name}
            </Text>
            <Separator />
            <TestComponent />
          </View>
        );
      })}
    </View>
  );
};
