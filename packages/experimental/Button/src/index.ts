if (__DEV__) {
  console.warn(
    'The @fluentui-react-native/exprimental-button package is deprecated. The contents of this package have been moved to @fluentui-react-native/button. If you need to use the Button component from this package, please use ButtonV1 from @fluentui-react-native/button.',
  );
}

export type {
  ButtonSize,
  ButtonAppearance,
  ButtonShape,
  ButtonCoreTokens,
  ButtonTokens,
  ButtonCoreProps,
  ButtonProps,
  ButtonInfo,
  ButtonSlotProps,
  ButtonType,
  CompoundButtonTokens,
  CompoundButtonProps,
  CompoundButtonSlotProps,
  CompoundButtonType,
  FABType,
  ToggleButtonTokens,
  ToggleButtonProps,
  ToggleButtonInfo,
  ToggleButtonSlotProps,
  ToggleButtonType,
} from '@fluentui-react-native/button';
export {
  buttonNameV1 as buttonName,
  ButtonV1 as Button,
  compoundButtonName,
  CompoundButton,
  fabName,
  FAB,
  toggleButtonName,
  ToggleButton,
} from '@fluentui-react-native/button';
