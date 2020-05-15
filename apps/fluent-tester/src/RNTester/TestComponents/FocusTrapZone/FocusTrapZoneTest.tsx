import { IFocusTrapZoneProps, Text, FocusTrapZone, KeyPressEvent } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { TouchableHighlight, TouchableHighlightProps, View, ViewProps } from 'react-native';
import { useFocusState } from '@fluentui/react-native';
import * as React from 'react';
import { stackStyle } from '../Common/styles';
import { FOCUSTRAPZONE_TESTPAGE } from '../../Consts';

const trapZoneStyle: IFocusTrapZoneProps['style'] = {
  padding: 10,
  borderWidth: 2,
  borderColor: '#ababab',
  borderStyle: 'dashed'
};

const activeTrapZoneStyle: IFocusTrapZoneProps['style'] = {
  padding: 10,
  borderColor: '#ababab',
  borderWidth: 2,
  borderStyle: 'solid'
};

const componentTwiddlerStyle: ViewProps['style'] = {
  borderWidth: 1,
  padding: 8,
  margin: 4,
  borderColor: '#ababab',
  borderStyle: 'solid'
};

const focusedComponentTwiddlerStyle: ViewProps['style'] = {
  ...componentTwiddlerStyle,
  borderColor: 'black',
  backgroundColor: 'lightblue'
};

interface IComponentTwiddlerProps {
  label?: string;
  onPress?: TouchableHighlightProps['onPress'];
}

const ComponentTwiddler: React.FunctionComponent<IComponentTwiddlerProps> = (props: IComponentTwiddlerProps) => {
  const [focusProps, focusState] = useFocusState({});

  return (
    <TouchableHighlight {...{ acceptsKeyboardFocus: false }} onPress={props.onPress}>
      <View
        {...{ acceptsKeyboardFocus: true, ...focusProps } as any}
        style={focusState.focused ? focusedComponentTwiddlerStyle : componentTwiddlerStyle}
      >
        <Text>{props.label}</Text>
      </View>
    </TouchableHighlight>
  );
};

export const FocusTrapTest: React.FunctionComponent<{}> = () => {
  const [state, setState] = React.useState({
    useTrapZone: false,
    renderTrapZone: true,
    disableFirstFocus: false,
    ignoreExternalFocusing: false,
    focusPreviouslyFocusedInnerElement: false
  });

  const ftzRef = React.useRef<View>(null);

  const onKeyDown = React.useCallback(
    (ev: KeyPressEvent) => {
      if (ev.nativeEvent.key === 'Enter') {
        setState({ ...state, useTrapZone: !state.useTrapZone });
      } else if (ev.nativeEvent.key === ' ') {
        setState({ ...state, renderTrapZone: !state.renderTrapZone });
      } else if (ev.nativeEvent.key === 'f' && ftzRef.current) {
        ftzRef.current!.focus();
      }
    },
    [state, setState]
  );

  const onTwiddleExternalFocusing = React.useCallback(() => {
    setState({ ...state, ignoreExternalFocusing: !state.ignoreExternalFocusing });
  }, [state, setState]);

  const onTwiddleFocusPrevious = React.useCallback(() => {
    setState({ ...state, focusPreviouslyFocusedInnerElement: !state.focusPreviouslyFocusedInnerElement });
  }, [state, setState]);

  const onTwiddleFirstFocus = React.useCallback(() => {
    setState({ ...state, disableFirstFocus: !state.disableFirstFocus });
  }, [state, setState]);

  return (
    <View {...{ onKeyDown: onKeyDown }}>
      <Stack style={stackStyle} gap={5}>
        <ComponentTwiddler label="Press space to render or enter to trap, f to focus" />
        <ComponentTwiddler
          label={state.ignoreExternalFocusing ? 'ignoreExternalFocusing: true' : 'ignoreExternalFocusing: false'}
          onPress={onTwiddleExternalFocusing}
        />
        <ComponentTwiddler
          label={
            state.focusPreviouslyFocusedInnerElement
              ? 'focusPreviouslyFocusedInnerElement: true'
              : 'focusPreviouslyFocusedInnerElement: false'
          }
          onPress={onTwiddleFocusPrevious}
        />
        <ComponentTwiddler
          label={state.disableFirstFocus ? 'disableFirstFocus: true' : 'disableFirstFocus: false'}
          onPress={onTwiddleFirstFocus}
        />
        {state.renderTrapZone && (
          <FocusTrapZone
            componentRef={ftzRef}
            disableFirstFocus={state.disableFirstFocus}
            ignoreExternalFocusing={state.ignoreExternalFocusing}
            focusPreviouslyFocusedInnerElement={state.focusPreviouslyFocusedInnerElement}
            disabled={!state.useTrapZone}
            style={state.useTrapZone ? activeTrapZoneStyle : trapZoneStyle}
          >
            <Text testID={FOCUSTRAPZONE_TESTPAGE}>{state.useTrapZone ? 'Trap Active' : 'Trap Active'}</Text>
            <ComponentTwiddler label="trapped" />
            <ComponentTwiddler label="trapped" />
            <ComponentTwiddler label="trapped" />
            <ComponentTwiddler label="trapped" />
          </FocusTrapZone>
        )}
      </Stack>
    </View>
  );
};
