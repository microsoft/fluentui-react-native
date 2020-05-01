import * as React from 'react';
import { Text, Pressable, IPressableState } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { useHoverState, useFocusState, usePressState } from '@fluentui/react-native';
import { Square } from '../Common/Square';
import { Alert, GestureResponderEvent, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

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

export const PressableTest: React.FunctionComponent<{}> = () => {
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

/* Pressable that only has focusState */
const FocusComponent: React.FunctionComponent<ViewProps> = () => {
  const [focusProps, focusState] = useFocusState({});

  return (
    <Stack {...{ acceptsKeyboardFocus: false }}>
      <View {...({ acceptsKeyboardFocus: true, ...focusProps } as any)} style={focusState.focused ? styles.focused : styles.notfocused} />
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
    [pressProps]
  );

  return (
    <Stack {...{ acceptsKeyboardFocus: false }}>
      <View
        {...{ acceptsKeyboardFocus: true, ...pressProps, onTouchEnd: onTouchEnd }}
        style={pressState.pressed ? styles.pressed : styles.notPressed}
      />
    </Stack>
  );
};
