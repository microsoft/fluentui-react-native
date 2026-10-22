import type { AccessibilityActionEvent } from 'react-native';

import type { ExpandActionProps } from './triggerExpandActions';
import { withTriggerExpandActions } from './triggerExpandActions.win32';

const action = (actionName: string) => ({ nativeEvent: { actionName } }) as AccessibilityActionEvent;

describe('Win32 trigger expand actions', () => {
  it('declares expand and collapse ahead of caller actions and routes them to the popup presence', () => {
    const setExpanded = jest.fn();
    const onAccessibilityAction = jest.fn();
    const props = withTriggerExpandActions({ accessibilityActions: [{ name: 'activate' }], onAccessibilityAction }, setExpanded);
    expect(props.accessibilityActions.map(({ name }) => name)).toEqual(['Expand', 'Collapse', 'activate']);

    props.onAccessibilityAction(action('Expand'));
    props.onAccessibilityAction(action('Collapse'));
    props.onAccessibilityAction(action('activate'));
    expect(setExpanded.mock.calls).toEqual([[true], [false]]);
    expect(onAccessibilityAction).toHaveBeenCalledTimes(3);
  });

  it('adds only the expand actions when the caller declares none', () => {
    const props = withTriggerExpandActions<ExpandActionProps>({}, jest.fn());
    expect(props.accessibilityActions.map(({ name }) => name)).toEqual(['Expand', 'Collapse']);
  });
});
