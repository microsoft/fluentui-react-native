import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Separator } from '@fluentui-react-native/separator';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from './Common/styles';

export type TestSection = {
  name: string;
  testID?: string;
  component: React.FunctionComponent<{}>;
};

export type Status = 'production' | 'beta' | 'experimental' | 'backlog' | 'N/A';
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
  return (
    <View>
      <Text style={styles.name}>{props.name}</Text>
      <Separator />
      <Stack style={stackStyle}>
        <Text style={styles.description}>{props.description}</Text>
      </Stack>
      <Stack style={stackStyle}>
        <Text style={styles.statusHeader}>Platform Status</Text>
        <Text style={styles.statusLabel}>
          Win32:{' '}
          <Text style={styles.status}>{props.status.win32Status}</Text>
        </Text>
        <Text style={styles.statusLabel}>
          UWP:{' '}
          <Text style={styles.status}>{props.status.uwpStatus}</Text>
        </Text>
        <Text style={styles.statusLabel}>
          iOS:{' '}
          <Text style={styles.status}>{props.status.iosStatus}</Text>
        </Text>
        <Text style={styles.statusLabel}>
          macOS:{' '}
          <Text style={styles.status}>{props.status.macosStatus}</Text>
        </Text>
        <Text style={styles.statusLabel}>
          Android:{' '}
          <Text style={styles.status}>{props.status.androidStatus}</Text>
        </Text>
      </Stack>
      {props.sections.map((section, index) => {
        const TestComponent = section.component;
        return (
          <View key={index}>
            <Text style={styles.section} testID={section.testID}>{section.name}</Text>
            <Separator />
            <TestComponent />
          </View>
        );
      })}
    </View>
  );
};