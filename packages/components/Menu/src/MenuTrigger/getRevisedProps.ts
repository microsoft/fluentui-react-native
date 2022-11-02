import { AccessibilityActionEvent } from 'react-native';
import { memoize } from '@fluentui-react-native/framework';
import { InteractionEvent, isMouseEvent } from '@fluentui-react-native/interactive-hooks';
import { MenuTriggerChildProps, MenuTriggerState } from './MenuTrigger.types';

/**
 * Creates a merged set of props between the MenuTrigger's child component's props
 * and the props that the MenuTrigger wants its child to have.
 *
 * Because children are not accessible in the outer render, we deal with the merge in this function.
 */
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
      state.props.onAccessibilityAction(e);
      props.onAccessibilityAction(e);
    };
  }

  if (props.onClick) {
    revisedProps.onClick = (e: InteractionEvent) => {
      state.props.onClick(e);
      props.onClick(e);
    };
  }

  if (props.onHoverIn) {
    revisedProps.onHoverIn = (e: InteractionEvent) => {
      state.props.onHoverIn(isMouseEvent(e) && e);
      props.onHoverIn(e);
    };
  }

  if (props.onHoverOut) {
    revisedProps.onHoverOut = (e: InteractionEvent) => {
      state.props.onHoverOut(isMouseEvent(e) && e);
      props.onHoverOut(e);
    };
  }

  return { ...revisedProps };
}
