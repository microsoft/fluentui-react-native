import type { ICalloutProps } from '@fluentui-react-native/callout';
import type { IPressableHooks } from '@fluentui-react-native/interactive-hooks';

export const listboxName = 'Listbox';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ListboxTokens = {};

export type ListboxProps = ICalloutProps;

export type ListboxState = IPressableHooks<ListboxProps & React.ComponentPropsWithRef<any>>;
