import { IViewProps } from '@fluentui-react-native/adapters';
import { IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';

// eslint-disable-next-line @typescript-eslint/ban-types
export type IPressableProps<TBase extends object = IViewProps> = IWithPressableOptions<TBase>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type IPressableType<TBase extends object = IViewProps> = {
  props: IPressableProps<TBase>;
  slotProps: {
    root: TBase;
  };
};
