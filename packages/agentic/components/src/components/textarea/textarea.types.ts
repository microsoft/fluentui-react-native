import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, FocusTargetBinding, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { StyleProp, TextInput, TextInputProps, TextStyle, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { FocusVisualsSlots } from '../../common/useFocusVisuals';
import type { InputAccessibilityState, InputSize } from '../input/input.types';

export type TextareaSize = InputSize;
export type TextareaEditorProps = Pick<
  TextInputProps,
  | 'accessibilityLabel'
  | 'accessibilityHint'
  | 'accessibilityLabelledBy'
  | 'onFocus'
  | 'onBlur'
  | 'onSelectionChange'
  | 'maxLength'
  | 'selection'
  | 'autoCorrect'
  | 'autoCapitalize'
  | 'spellCheck'
  | 'testID'
  | 'nativeID'
  | 'style'
> & { ref?: PropsWithRefOf<typeof TextInput>['ref']; accessibilityState?: InputAccessibilityState };
export type TextareaProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'nativeID' | 'accessibilityLabel'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    testID?: string;
    size?: TextareaSize;
    value?: string;
    defaultValue?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    disabled?: boolean;
    error?: boolean;
    textInput?: TextareaEditorProps;
  };

export type TextareaState = ThemeState &
  FocusTargetBinding &
  ComponentState<FocusVisualsSlots & { root: Slot<typeof View>; textInput: Slot<typeof TextInput> }> & {
    size: TextareaSize;
    visualState: 'rest' | 'focused' | 'readOnly' | 'error' | 'disabled';
    editorStyle?: StyleProp<TextStyle>;
    userStyle?: StyleProp<ViewStyle>;
  };
