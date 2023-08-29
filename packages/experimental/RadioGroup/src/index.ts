if (__DEV__) {
  console.warn(
    'The @fluentui-react-native/exprimental-radio-group package is deprecated. The contents of this package have been moved to @fluentui-react-native/radio-group. If you need to use the RadioGroup component from this package, please use RadioGroupV1 from @fluentui-react-native/radio-group.',
  );
}

export type {
  RadioGroupInfo,
  RadioGroupProps,
  RadioGroupSlotProps,
  RadioGroupState,
  RadioGroupTokens,
  RadioGroupType,
  RadioGroupContextValue,
  RadioProps,
  RadioSlotProps,
  RadioInfo,
  RadioTokens,
  RadioType,
} from '@fluentui-react-native/radio-group';
export {
  RadioGroupV1 as RadioGroup,
  radioGroupNameV1 as radioGroupName,
  RadioGroupContextV1 as RadioGroupContext,
  RadioGroupProvider,
  useRadioGroupContext,
  useRadioGroup,
  useRadioGroupContextValue,
  Radio,
  radioLookup,
  radioName,
  useRadio,
} from '@fluentui-react-native/radio-group';
