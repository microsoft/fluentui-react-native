import { AccessibilityActionEvent, GestureResponderEvent } from 'react-native';
import { KeyPressEvent } from '.';

export type CallbackEvent = GestureResponderEvent | KeyPressEvent | AccessibilityActionEvent;
