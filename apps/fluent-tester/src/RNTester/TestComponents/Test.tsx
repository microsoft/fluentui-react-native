import * as React from 'react';
import { Text } from 'react-native';

export interface TestProps {
  description: string;
  sections: any[];
}

export const Test = (props: TestProps) => {
  return (
    <Text>{props.description}</Text>
  );
};