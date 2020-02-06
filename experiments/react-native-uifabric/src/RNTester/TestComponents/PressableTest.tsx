import * as React from 'react';
import * as ReactNative from 'react-native';
import { Stack, Text, Pressable, IPressableState } from '../../components';
import { useHoverState, useFocusState, usePressState } from '../../hooks';
import { Square } from './Square';
import { ViewWin32, IViewWin32Props } from '@office-iss/react-native-win32';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  dottedBorder: {
    borderWidth: 1,
    padding: 8,
    margin: 4,
    borderStyle: 'dotted',
    borderColor: 'red'
  },
  solidBorder: {
    borderWidth: 1,
    padding: 8,
    margin: 4,
    borderStyle: 'solid',
    borderColor: 'black'
  },
  notfocused: {
    borderWidth: 1,
    padding: 8,
    margin: 4,
    borderColor: '#ababab',
    borderStyle: 'solid'
  },
  focused: {
    borderWidth: 1,
    padding: 8,
    margin: 4,
    borderStyle: 'solid',
    borderColor: 'black',
    backgroundColor: 'lightblue'
  },
  notPressed: {
    borderWidth: 1,
    padding: 8,
    margin: 4,
    width: 30,
    height: 30,
    borderColor: '#ababab',
    borderStyle: 'solid'
  },
  pressed: {
    borderWidth: 1,
    padding: 8,
    margin: 4,
    width: 30,
    height: 30,
    borderStyle: 'dashed',
    borderColor: 'black',
    backgroundColor: 'lightgreen'
  }
});

function renderStyle(state: IPressableState): ReactNative.ViewStyle {
  return (state.pressed && { opacity: 0.5 }) || {};
}

export const PressableTest: React.FunctionComponent<{}> = () => {
  const [{ onMouseEnter, onMouseLeave }, hoverState] = useHoverState();

  return (
    <Stack horizontal gap={5}>
      <Square color="blue" />
      <Pressable renderStyle={renderStyle}>
        <Square />
      </Pressable>
      <Square color="green" />
      <Stack>
        <ViewWin32
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          style={hoverState.hovered ? styles.dottedBorder : styles.solidBorder}
        >
          <Text>{hoverState.hovered ? 'hovered' : 'not hovered'}</Text>
        </ViewWin32>
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
const FocusComponent: React.FunctionComponent<IViewWin32Props> = () => {
  const [{ onFocus, onBlur }, focusState] = useFocusState();

  return (
    <Stack {...{ acceptsKeyboardFocus: false }}>
      <ViewWin32 acceptsKeyboardFocus onFocus={onFocus} onBlur={onBlur} style={focusState.focused ? styles.focused : styles.notfocused} />
    </Stack>
  );
};

/* Pressable that only has pressState */
const PressComponent: React.FunctionComponent<IViewWin32Props> = (props: IViewWin32Props) => {
  const [pressProps, pressState] = usePressState(props);

  const onTouchEnd = React.useCallback(
    (e: ReactNative.GestureResponderEvent) => {
      pressProps.onTouchEnd && pressProps.onTouchEnd(e);
      ReactNative.Alert.alert('Alert.', 'Object has been pressed.');
    },
    [pressProps]
  );

  return (
    <Stack {...{ acceptsKeyboardFocus: false }}>
      <ViewWin32
        acceptsKeyboardFocus
        onTouchStart={pressProps.onTouchStart}
        onTouchCancel={pressProps.onTouchCancel}
        onTouchEnd={onTouchEnd}
        style={pressState.pressed ? styles.pressed : styles.notPressed}
      />
    </Stack>
  );
};
