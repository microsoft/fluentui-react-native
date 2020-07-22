import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Separator } from '@fluentui-react-native/separator';

export type TestSection = {
  name: string;
  status: string; // shipped, beta, experimental
  testID: string;
  component: React.FunctionComponent<{}>;
};

export interface TestProps {
  name: string;
  description: string;
  sections: TestSection[];
}

const styles = StyleSheet.create({
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0B6A0B',
    marginTop: 4
  },
  description: {},
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
        return (
          <View key={index}>
            <Text key={index} style={styles.section}>
              {section.name}
              <Text key={index} style={styles.status}>{'   '}{section.status}</Text>
            </Text>
            <Separator key={index} />
            {/* {section.component} */}
          </View>
        );
      })}
    </View>
  );
};