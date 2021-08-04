/** @jsx withSlots */
import { ViewProps } from 'react-native';
import { compose, buildProps, mergeProps, UseSlots, LayoutTokens } from '@fluentui-react-native/framework';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import { withSlots } from '@uifabricshared/foundation-composable';

const nativeRadioButtonName = 'NativeRadioButton';

const NativeRadioButtonView = ensureNativeComponent('RadioButtonView');

export type NativeRadioButtonProps = {
  /**
   * Radio button title.
   */
  title?: string;
  /**
   * Whether the radio button is selectable or not, true by default.
   */
  enabled?: boolean;
  /**
   * Whether the radio button is selected or not, false by default.
   */
  selected?: boolean;
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
    root: buildProps(tokens => ({
      style: {
        // Fluent controls are designed to snap to a 4 px grid
        marginLeft: 4,
        marginTop: 4,
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
