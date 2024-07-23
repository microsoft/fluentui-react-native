import * as React from 'react';
import type { TouchableHighlightProps } from 'react-native';
import { TouchableHighlight, View } from 'react-native';

import { FocusTrapZone, Text } from '@fluentui/react-native';
import type { Theme } from '@fluentui-react-native/framework';
import type { KeyPressEvent } from '@fluentui-react-native/interactive-hooks';
import { useFocusState } from '@fluentui-react-native/interactive-hooks';
import { Stack } from '@fluentui-react-native/stack';
import { useTheme } from '@fluentui-react-native/theme-types';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';

import { FOCUSTRAPZONE_TESTPAGE } from '../../../../E2E/src/FocusTrapZone/consts';
import { stackStyle } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const getThemedStyles = themedStyleSheet((t: Theme) => {
  return {
    trapZoneStyle: {
      padding: 10,
      borderWidth: 2,
      borderColor: t.colors.neutralStroke1,
      borderStyle: 'dashed',
    },
    activeTrapZoneStyle: {
      padding: 10,
      borderColor: t.colors.neutralStroke1,
      borderWidth: 2,
      borderStyle: 'solid',
    },
    componentTwiddlerStyle: {
      borderWidth: 1,
      padding: 8,
      margin: 4,
      borderColor: t.colors.neutralStroke1,
      borderStyle: 'solid',
    },
    focusedComponentTwiddlerStyle: {
      borderWidth: 1,
      padding: 8,
      margin: 4,
      borderStyle: 'solid',
      borderColor: t.colors.strokeFocus2,
      backgroundColor: t.colors.neutralBackground1Hover,
    },
    componentTwiddlerText: {
      color: t.colors.neutralForeground1,
    },
    focusedComponentTwiddlerText: {
      color: t.colors.neutralForeground1Hover,
    },
  };
});

interface IComponentTwiddlerProps {
  label?: string;
  onPress?: TouchableHighlightProps['onPress'];
}

export const ComponentTwiddler: React.FunctionComponent<IComponentTwiddlerProps> = (props: IComponentTwiddlerProps) => {
  const [focusProps, focusState] = useFocusState({});
  const theme = useTheme();
  const themedStyles = getThemedStyles(theme);

  return (
    <TouchableHighlight {...{ focusable: false }} onPress={props.onPress}>
      <View
        focusable={true}
        {...(focusProps as any)}
        style={focusState.focused ? themedStyles.focusedComponentTwiddlerStyle : themedStyles.componentTwiddlerStyle}
      >
        <Text style={focusState.focused ? themedStyles.focusedComponentTwiddlerText : themedStyles.componentTwiddlerText}>
          {props.label}
        </Text>
      </View>
    </TouchableHighlight>
  );
};

const BasicFocusTrapZone: React.FunctionComponent = () => {
  const theme = useTheme();
  const themedStyles = getThemedStyles(theme);

  const [state, setState] = React.useState({
    useTrapZone: false,
    renderTrapZone: true,
    disableFirstFocus: false,
    ignoreExternalFocusing: false,
    focusPreviouslyFocusedInnerElement: false,
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
    [state, setState],
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
            style={state.useTrapZone ? themedStyles.activeTrapZoneStyle : themedStyles.trapZoneStyle}
          >
            <Text>{state.useTrapZone ? 'Trap Active' : 'Trap Active'}</Text>
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

const focusTrapZoneSections: TestSection[] = [
  {
    name: 'Basic FocusTrapZone Usage',
    testID: FOCUSTRAPZONE_TESTPAGE,
    component: BasicFocusTrapZone,
  },
];

export const FocusTrapTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Backlog',
    iosStatus: 'N/A',
    macosStatus: 'N/A',
    androidStatus: 'N/A',
  };

  const description =
    'FocusTrapZone is used to trap the focus in any html element. Pressing tab will circle focus within the inner focusable elements of the FocusTrapZone.';

  return <Test name="Focus Trap Zone Test" description={description} sections={focusTrapZoneSections} status={status}></Test>;
};
