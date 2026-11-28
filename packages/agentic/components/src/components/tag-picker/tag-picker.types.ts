import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { KeyedFocus } from '../../common/useKeyedFocus';
import type { Dropdown } from '../dropdown/dropdown';
import type { DropdownOpenChangeData, DropdownSize, DropdownVariant } from '../dropdown/dropdown.types';

export type TagPickerOption = { value: string; label: string; disabled?: boolean; testID?: string };
export type TagPickerSelectionReason = 'option' | 'remove';
export type TagPickerSelectionChange = { value: string; reason: TagPickerSelectionReason };
export type TagPickerProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    options: readonly TagPickerOption[];
    entryMode?: 'selectOnly';
    selectedValues?: readonly string[];
    defaultSelectedValues?: readonly string[];
    onSelectionChange?: (values: readonly string[], details: TagPickerSelectionChange) => void;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, details: DropdownOpenChangeData) => void;
    variant?: DropdownVariant;
    size?: DropdownSize;
    disabled?: boolean;
    error?: boolean;
    accessibilityLabel: string;
    triggerLabel?: string;
    triggerTestID?: string;
    placeholder?: string;
    formatRemoveLabel: (option: TagPickerOption) => string;
    formatAddLabel?: (option: TagPickerOption) => string;
  };

export type TagPickerState = ThemeState &
  ComponentState<{ root: Slot<typeof View>; tags: Slot<typeof View>; picker: Slot<typeof Dropdown> }> & {
    size: DropdownSize;
    visualState: 'rest' | 'hovered' | 'pressed' | 'disabled';
    options: readonly TagPickerOption[];
    selected: readonly TagPickerOption[];
    userStyle?: StyleProp<ViewStyle>;
    tagFocus: KeyedFocus;
    formatRemoveLabel: TagPickerProps['formatRemoveLabel'];
    formatAddLabel?: TagPickerProps['formatAddLabel'];
    remove(value: string): void;
  };
