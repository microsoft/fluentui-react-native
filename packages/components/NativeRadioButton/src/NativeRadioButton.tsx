/** @jsx withSlots */
import { ViewProps } from 'react-native';
import { compose, buildProps, mergeProps, UseSlots, withSlots } from '@fluentui-react-native/framework';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const nativeRadioButtonName = 'NativeRadioButton';

const NativeRadioButtonView = ensureNativeComponent('MSFRadioButtonView');

export type NativeRadioButtonProps = {
  title?: string;
  buttonKey?: string;
  enabled?: boolean;
  state?: boolean;
};

export type NativeRadioButtonTokens = {
  isBordered?: boolean;
};

export type NativeRadioButtonViewProps = NativeRadioButtonProps & NativeRadioButtonTokens & ViewProps;

interface NativeRadioButtonType {
  props: NativeRadioButtonViewProps;
  slotProps: { root: NativeRadioButtonViewProps };
  tokens: NativeRadioButtonTokens;
}

export const NativeRadioButton = compose<NativeRadioButtonType>({
  displayName: nativeRadioButtonName,
  tokens: [{}, nativeRadioButtonName],
  slots: { root: NativeRadioButtonView },
  slotProps: {
    root: buildProps(() => ({
      style: {
        marginLeft: 3,
        marginTop: 3,
        height: 20,
        width: 100,
      },
    })),
  },
  render: (props: NativeRadioButtonViewProps, useSlots: UseSlots<NativeRadioButtonType>) => {
    const Root = useSlots(props).root;
    return (rest: NativeRadioButtonViewProps) => <Root {...mergeProps(props, rest)} />;
  },
});
