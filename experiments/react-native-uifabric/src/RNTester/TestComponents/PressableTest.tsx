import * as React from 'react';
import * as ReactNative from 'react-native';
import { Stack, Pressable, IPressableState } from '../../components';
import { Square } from './Square';

function renderStyle(state: IPressableState): ReactNative.ViewStyle {
    return (state.pressed && { opacity: 0.5 }) || {};
}

export const PressableTest: React.FunctionComponent<{}> = () => {
  return (
    <Stack horizontal gap={5}>
    <Square color="blue" />
    <Pressable renderStyle={renderStyle}>
      <Square />
    </Pressable>
    <Square color="green" />
  </Stack>
  );
};