import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type TestSection = {
  name: string;
  component: React.FunctionComponent<{}>;
};

export interface TestProps {
  name: string;
  description: string;
  sections: TestSection[];
}

const styles = StyleSheet.create({
  name: {},
  description: {},
  section: {}
});

export const Test = (props: TestProps) => {
  return (
    <View>
      <Text style={styles.name}>{props.name}</Text>
      <Text style={styles.description}>{props.description}</Text>
      {props.sections.map((section) => {
        return (
          <Text style={styles.section}>{section.name}</Text>
          // {section.component}
        );
      })}
    </View>
  );
};