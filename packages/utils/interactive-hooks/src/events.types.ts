import { AccessibilityActionEvent, GestureResponderEvent } from 'react-native';
import { KeyPressEvent } from '.';

export type InteractionEvent = GestureResponderEvent | KeyPressEvent | AccessibilityActionEvent;
