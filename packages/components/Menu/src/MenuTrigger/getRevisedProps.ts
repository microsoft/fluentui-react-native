import { AccessibilityActionEvent } from 'react-native';
import { memoize } from '@fluentui-react-native/framework';
import { InteractionEvent, isMouseEvent } from '@fluentui-react-native/interactive-hooks';
import { MenuTriggerChildProps, MenuTriggerState } from './MenuTrigger.types';

export const getRevisedProps = memoize(getRevisedPropsWorker);
function getRevisedPropsWorker(state: MenuTriggerState, props: any): MenuTriggerChildProps {
  const revisedProps = { ...state.props };
  if (props.accessibilityState) {
    revisedProps.accessibilityState = { ...state.props.accessibilityState, ...props.accessibilityState };
  }

  if (props.accessibilityActions) {
    revisedProps.accessibilityActions = [...state.props.accessibilityActions, ...props.accessibilityActions];
  }

  if (props.onAccessibilityAction) {
    revisedProps.onAccessibilityAction = (e: AccessibilityActionEvent) => {
      props.onAccessibilityAction(e);
      state.props.onAccessibilityAction(e);
    };
  }

  if (props.onClick) {
    revisedProps.onClick = (e: InteractionEvent) => {
      props.onClick(e);
      state.props.onClick(e);
    };
  }

  let onHoverIn = undefined;
  if (props.onHoverIn) {
    onHoverIn = (e: InteractionEvent) => {
      props.onHoverIn(e);
      state.props.onHoverIn(isMouseEvent(e) && e);
    };
  }

  let onHoverOut = undefined;
  if (props.onHoverOut) {
    onHoverOut = (e: InteractionEvent) => {
      props.onHoverOut(e);
      state.props.onHoverOut(isMouseEvent(e) && e);
    };
  }

  return { ...revisedProps, onHoverIn, onHoverOut };
}
