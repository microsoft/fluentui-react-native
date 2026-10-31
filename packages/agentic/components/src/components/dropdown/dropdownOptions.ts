import * as React from 'react';

import { ListboxItem } from '../listbox-item/listbox-item';
import type { ListboxItemProps } from '../listbox-item/listbox-item.types';
import { getListboxItemOptionLabel } from '../listbox-item/listboxItemOptionContext';

export interface DropdownOption {
  readonly value: string;
  readonly label: string;
  readonly disabled: boolean;
  /** One-based position among the options. */
  readonly position: number;
}

export interface DropdownOptions {
  readonly list: readonly DropdownOption[];
  readonly byValue: ReadonlyMap<string, DropdownOption>;
  /** Development warnings for the discovered children. */
  readonly warnings: readonly string[];
}

type OptionElementProps = Pick<ListboxItemProps, 'value' | 'content' | 'accessibilityLabel' | 'disabled' | 'variant'> & {
  children?: React.ReactNode;
};

/**
 * Discovers options: child elements with a string `value`, directly or inside Fragments. Other children are not
 * options; a list item without a value stays a standalone item, and a repeated value keeps its first option.
 */
export function collectDropdownOptions(children: React.ReactNode): DropdownOptions {
  const list: DropdownOption[] = [];
  const byValue = new Map<string, DropdownOption>();
  const warnings: string[] = [];
  const visit = (nodes: React.ReactNode) => {
    React.Children.forEach(nodes, (child) => {
      if (!React.isValidElement<OptionElementProps>(child)) {
        return;
      }
      if (child.type === React.Fragment) {
        visit(child.props.children);
        return;
      }
      const { value } = child.props;
      if (typeof value !== 'string') {
        if (child.type === ListboxItem && child.props.variant !== 'sectionHeader') {
          warnings.push('Dropdown: a ListboxItem without a string value is not an option.');
        }
        return;
      }
      if (byValue.has(value)) {
        warnings.push(`Dropdown: the option value "${value}" repeats; the first option with it wins.`);
        return;
      }
      const option: DropdownOption = {
        value,
        label: getListboxItemOptionLabel({ content: child.props.content, accessibilityLabel: child.props.accessibilityLabel, value }),
        disabled: child.props.disabled === true,
        position: list.length + 1,
      };
      list.push(option);
      byValue.set(value, option);
    });
  };
  visit(children);
  return { list, byValue, warnings };
}

/**
 * The selected options to display, in option order. In single mode only the first selected value that matches an
 * option counts. Selected values that match no option stay selected but are not displayed.
 */
export function getDisplayedOptions(options: DropdownOptions, selected: readonly string[], multiselect: boolean): DropdownOption[] {
  if (!multiselect) {
    const first = selected.find((value) => options.byValue.has(value));
    return first === undefined ? [] : [options.byValue.get(first)!];
  }
  const chosen = new Set(selected);
  return options.list.filter((option) => chosen.has(option.value));
}
