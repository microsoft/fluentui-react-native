import type { ICalloutProps } from '@fluentui-react-native/callout';
import type { IPressableHooks } from '@fluentui-react-native/interactive-hooks';

export const listboxName = 'Listbox';

export interface ListboxTokens {}

export type ListboxProps = ICalloutProps;

export interface ListboxState extends IPressableHooks<ListboxProps & React.ComponentPropsWithRef<any>> {}
