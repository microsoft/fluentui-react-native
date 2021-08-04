/** @jsx withSlots */
import { ViewProps } from 'react-native';
import { compose, buildProps, mergeProps, UseSlots, withSlots, LayoutTokens } from '@fluentui-react-native/framework';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const nativeRadioButtonName = 'NativeRadioButton';

const NativeRadioButtonView = ensureNativeComponent('RadioButtonView');

export type NativeRadioButtonProps = {
  /**
   * Radio button title, default title is set to "Button".
   */
  title?: string;
  /**
   * Whether the radio button is selectable or not, true by default.
   */
  enabled?: boolean;
  /**
   * Whether the radio button is selected or not, false by default.
   */
  isSelected?: boolean;
  /**
   * Unique identifier for each radio button.
   */
  buttonKey?: string;
  /**
   * On press event block
   */
  onPress?: () => void;
};

export type NativeRadioButtonTokens = LayoutTokens;

export type NativeRadioButtonViewProps = NativeRadioButtonProps & NativeRadioButtonTokens & ViewProps;

interface NativeRadioButtonType {
  props: NativeRadioButtonViewProps;
  slotProps: { root: NativeRadioButtonViewProps };
  tokens: NativeRadioButtonTokens;
}

export const NativeRadioButton = compose<NativeRadioButtonType>({
  displayName: nativeRadioButtonName,
  tokens: [
    {
      minWidth: 100,
      minHeight: 20,
    },
    nativeRadioButtonName,
  ],
  slots: { root: NativeRadioButtonView },
  slotProps: {
    root: buildProps((tokens) => ({
      style: {
        marginLeft: 4, // Fluent design on macOS
        marginTop: 4, // Fluent design on macOS
        minWidth: tokens.minWidth,
        minHeight: tokens.minHeight,
      },
    })),
  },
  render: (props: NativeRadioButtonViewProps, useSlots: UseSlots<NativeRadioButtonType>) => {
    const Root = useSlots(props).root;
    return (rest: NativeRadioButtonViewProps) => <Root {...mergeProps(props, rest)} />;
  },
});
