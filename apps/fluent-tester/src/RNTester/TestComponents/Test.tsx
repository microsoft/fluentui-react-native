import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Separator } from '@fluentui-react-native/separator';

export type TestSection = {
  name: string;
  testID?: string;
  component: React.FunctionComponent<{}>;
};

export type Status = 'production' | 'beta' | 'experimental';
export type PlatformStatus = {
  winStatus: Status;
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
  status: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0B6A0B',
    marginTop: 12
  }
});

export const Test = (props: TestProps) => {
  return (
    <View>
      <Text style={styles.name}>{props.name}</Text>
      <Separator />
      <Text style={styles.description}>{props.description}</Text>
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