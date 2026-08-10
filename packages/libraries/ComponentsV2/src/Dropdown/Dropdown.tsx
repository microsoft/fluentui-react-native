import * as React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import type {InteractionEvent} from '@fluentui/react-native';

import {Button} from '../Button';
import type {DropdownOptionProps, DropdownOptionSelectData, DropdownProps} from './Dropdown.types';

export function DropdownOption(_props: DropdownOptionProps): React.ReactElement | null {
  return null;
}

export function Dropdown({
  appearance = 'outline',
  children,
  clearable = false,
  defaultOpen = false,
  defaultSelectedOptions = [],
  disabled = false,
  multiselect = false,
  onOpenChange,
  onOptionSelect,
  open,
  placeholder = 'Select an option',
  selectedOptions,
  size = 'medium',
}: DropdownProps): React.ReactElement {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [uncontrolledSelected, setUncontrolledSelected] = React.useState(defaultSelectedOptions);
  const currentOpen = open ?? uncontrolledOpen;
  const currentSelected = selectedOptions ?? uncontrolledSelected;
  const options = React.Children.toArray(children)
    .filter(React.isValidElement<DropdownOptionProps>)
    .map(element => element.props);

  const setOpen = (event: InteractionEvent, nextOpen: boolean) => {
    if (open === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(event, {open: nextOpen});
  };

  const select = (event: InteractionEvent, option: DropdownOptionProps) => {
    if (option.disabled) {
      return;
    }
    const nextSelected = multiselect
      ? currentSelected.includes(option.value)
        ? currentSelected.filter(value => value !== option.value)
        : [...currentSelected, option.value]
      : [option.value];
    if (selectedOptions === undefined) {
      setUncontrolledSelected(nextSelected);
    }
    const data: DropdownOptionSelectData = {
      optionText: option.text ?? (typeof option.children === 'string' ? option.children : option.value),
      optionValue: option.value,
      selectedOptions: nextSelected,
    };
    onOptionSelect?.(event, data);
    if (!multiselect) {
      setOpen(event, false);
    }
  };

  const selectedText = options
    .filter(option => currentSelected.includes(option.value))
    .map(option => option.text ?? (typeof option.children === 'string' ? option.children : option.value))
    .join(', ');

  return (
    <View style={styles.root}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{disabled, expanded: currentOpen}}
        disabled={disabled}
        onPress={event => setOpen(event, !currentOpen)}
        style={[
          styles.trigger,
          styles[size],
          appearance === 'underline' && styles.underline,
          appearance === 'filled-darker' && styles.filledDarker,
          appearance === 'filled-lighter' && styles.filledLighter,
          disabled && styles.disabled,
        ]}
      >
        <Text numberOfLines={1} style={[styles.value, !selectedText && styles.placeholder]}>
          {selectedText || placeholder}
        </Text>
        {clearable && currentSelected.length ? (
          <Button
            accessibilityLabel="Clear selection"
            appearance="subtle"
            onClick={event => {
              if (selectedOptions === undefined) {
                setUncontrolledSelected([]);
              }
              onOptionSelect?.(event, {selectedOptions: []});
            }}
            size="small"
          >
            ×
          </Button>
        ) : <Text style={styles.chevron}>⌄</Text>}
      </Pressable>
      {currentOpen ? (
        <View accessibilityRole="menu" style={styles.listbox}>
          {options.map(option => {
            const selected = currentSelected.includes(option.value);
            return (
              <Pressable
                accessibilityRole="menuitem"
                accessibilityState={{disabled: option.disabled, selected}}
                disabled={option.disabled}
                key={option.value}
                onPress={event => select(event, option)}
                style={[styles.option, selected && styles.selectedOption, option.disabled && styles.disabled]}
              >
                {multiselect ? <Text style={styles.check}>{selected ? '✓' : ''}</Text> : null}
                {typeof option.children === 'string' ? <Text style={styles.value}>{option.children}</Text> : option.children}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  check: {color: '#0f6cbd', width: 18},
  chevron: {fontSize: 18},
  disabled: {opacity: 0.45},
  filledDarker: {backgroundColor: '#e0e0e0'},
  filledLighter: {backgroundColor: '#f5f5f5'},
  large: {minHeight: 40},
  listbox: {backgroundColor: '#ffffff', borderColor: '#d1d1d1', borderRadius: 4, borderWidth: 1, elevation: 6, marginTop: 4},
  medium: {minHeight: 32},
  option: {alignItems: 'center', flexDirection: 'row', minHeight: 36, paddingHorizontal: 10},
  placeholder: {color: '#707070'},
  root: {maxWidth: 320, minWidth: 0, width: '100%'},
  selectedOption: {backgroundColor: '#ebf3fc'},
  small: {minHeight: 24},
  trigger: {alignItems: 'center', backgroundColor: '#ffffff', borderColor: '#8a8886', borderRadius: 4, borderWidth: 1, flexDirection: 'row', paddingHorizontal: 10},
  underline: {borderLeftWidth: 0, borderRadius: 0, borderRightWidth: 0, borderTopWidth: 0},
  value: {color: '#242424', flex: 1},
});
