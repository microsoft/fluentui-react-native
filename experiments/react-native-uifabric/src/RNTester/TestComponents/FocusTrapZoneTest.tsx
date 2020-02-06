import { ViewWin32, IKeyboardEvent, IViewWin32Props, IViewWin32 } from '@office-iss/react-native-win32';
import { IFocusTrapZoneProps, Text, Stack, FocusTrapZone } from '../../components';
import { TouchableHighlight, TouchableHighlightProps } from 'react-native';
import { useFocusState } from '../../hooks';
import * as React from 'react';
import { stackStyle } from '../TesterStyles';

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

const componentTwiddlerStyle: IViewWin32Props['style'] = {
  borderWidth: 1,
  padding: 8,
  margin: 4,
  borderColor: '#ababab',
  borderStyle: 'solid'
};

const focusedComponentTwiddlerStyle: IViewWin32Props['style'] = {
  ...componentTwiddlerStyle,
  borderColor: 'black',
  backgroundColor: 'lightblue'
};

interface IComponentTwiddlerProps {
  label?: string;
  onPress?: TouchableHighlightProps['onPress'];
}

const ComponentTwiddler: React.FunctionComponent<IComponentTwiddlerProps> = (props: IComponentTwiddlerProps) => {
  const [{ onFocus, onBlur }, focusState] = useFocusState();

  return (
    <TouchableHighlight {...{ acceptsKeyboardFocus: false }} onPress={props.onPress}>
      <ViewWin32
        acceptsKeyboardFocus
        onFocus={onFocus}
        onBlur={onBlur}
        style={focusState.focused ? focusedComponentTwiddlerStyle : componentTwiddlerStyle}
      >
        <Text>{props.label}</Text>
      </ViewWin32>
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

  const ftzRef = React.useRef<IViewWin32>(null);

  const onKeyDown = React.useCallback(
    (ev: IKeyboardEvent) => {
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
    <ViewWin32 onKeyDown={onKeyDown}>
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
            <Text>{state.useTrapZone ? 'Trap Active' : 'Trap Active'}</Text>
            <ComponentTwiddler label="trapped" />
            <ComponentTwiddler label="trapped" />
            <ComponentTwiddler label="trapped" />
            <ComponentTwiddler label="trapped" />
          </FocusTrapZone>
        )}
      </Stack>
    </ViewWin32>
  );
};
