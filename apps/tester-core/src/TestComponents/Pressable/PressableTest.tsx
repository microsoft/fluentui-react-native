import * as React from 'react';
import type { GestureResponderEvent, ViewProps, ViewStyle } from 'react-native';
import { Alert, StyleSheet, View, Text } from 'react-native';

import { Pressable } from '@fluentui/react-native';
import { PRESSABLE_TESTPAGE } from '@fluentui-react-native/e2e-testing';
import { useFocusState, useHoverState, usePressState } from '@fluentui-react-native/interactive-hooks';
import type { IPressableState } from '@fluentui-react-native/interactive-hooks';
import { Stack } from '@fluentui-react-native/stack';

import { Square } from '../Common/Square';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const styles = StyleSheet.create({
  dottedBorder: {
    borderWidth: 1,
    padding: 8,
    margin: 4,
    borderStyle: 'dotted',
    borderColor: 'red',
  },
  solidBorder: {
    borderWidth: 1,
    padding: 8,
    margin: 4,
    borderStyle: 'solid',
    borderColor: 'black',
  },
  notfocused: {
    borderWidth: 1,
    padding: 8,
    margin: 4,
    borderColor: '#ababab',
    borderStyle: 'solid',
  },
  focused: {
    borderWidth: 1,
    padding: 8,
    margin: 4,
    borderStyle: 'solid',
    borderColor: 'black',
    backgroundColor: 'lightblue',
  },
  notPressed: {
    borderWidth: 1,
    padding: 8,
    margin: 4,
    width: 30,
    height: 30,
    borderColor: '#ababab',
    borderStyle: 'solid',
  },
  pressed: {
    borderWidth: 1,
    padding: 8,
    margin: 4,
    width: 30,
    height: 30,
    borderStyle: 'dashed',
    borderColor: 'black',
    backgroundColor: 'lightgreen',
  },
});

function renderStyle(state: IPressableState): ViewStyle {
  return (state.pressed && { opacity: 0.5 }) || {};
}

/* Pressable that only has focusState */
const FocusComponent: React.FunctionComponent<ViewProps> = () => {
  const [focusProps, focusState] = useFocusState({});

  return (
    <Stack focusable={false}>
      <View focusable={true} {...(focusProps as any)} style={focusState.focused ? styles.focused : styles.notfocused} />
    </Stack>
  );
};

/* Pressable that only has pressState */
const PressComponent: React.FunctionComponent<ViewProps> = (props: ViewProps) => {
  const [pressProps, pressState] = usePressState(props);

  const onTouchEnd = React.useCallback(
    (e: GestureResponderEvent) => {
      pressProps.onTouchEnd && pressProps.onTouchEnd(e);
      Alert.alert('Alert.', 'Object has been pressed.');
    },
    [pressProps],
  );

  const onInvoke = React.useCallback(() => {
    Alert.alert('Alert.', 'Object has been pressed.');
  }, []);

  return (
    <Stack focusable={false}>
      <View
        accessible
        accessibilityLabel={'Press to alert'}
        onAccessibilityTap={onInvoke}
        accessibilityRole="button"
        focusable={true}
        {...pressProps}
        onTouchEnd={onTouchEnd}
        style={pressState.pressed ? styles.pressed : styles.notPressed}
      />
    </Stack>
  );
};

const PressableMainTest: React.FunctionComponent = () => {
  const [hoverProps, hoverState] = useHoverState({});

  return (
    <Stack horizontal gap={5}>
      <Square color="blue" />
      <Pressable renderStyle={renderStyle}>
        <Square />
      </Pressable>
      <Square color="green" />
      <Stack>
        <View {...(hoverProps as any)} style={hoverState.hovered ? styles.dottedBorder : styles.solidBorder}>
          <Text>{hoverState.hovered ? 'hovered' : 'not hovered'}</Text>
        </View>
      </Stack>
      <Stack>
        <Text>Click a component to initially focus and tab to keyboard focus to next component: </Text>
        <FocusComponent />
        <FocusComponent />
        <FocusComponent />
        <FocusComponent />
      </Stack>
      <Stack>
        <Text>Press to alert: </Text>
        <PressComponent />
      </Stack>
    </Stack>
  );
};

const pressableSections: TestSection[] = [
  {
    name: 'Pressable Components',
    testID: PRESSABLE_TESTPAGE,
    component: PressableMainTest,
  },
];

export const PressableTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Deprecated',
    uwpStatus: 'Deprecated',
    iosStatus: 'Deprecated',
    macosStatus: 'Deprecated',
    androidStatus: 'Deprecated',
  };

  const description = 'No description.';

  return <Test name="Pressable Test" description={description} sections={pressableSections} status={status} />;
};
