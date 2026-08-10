import { act } from 'react';
import { Pressable, TextInput } from 'react-native';

import * as renderer from 'react-test-renderer';

import { Combobox, ComboboxOption, ComboboxOptionGroup } from './Combobox';

describe('ComponentsV2 Combobox', () => {
  it('opens, selects an option, updates the value, and closes', () => {
    const onOptionSelect = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Combobox accessibilityLabel="Best pet" onOptionSelect={onOptionSelect} testID="combo">
          <ComboboxOption>Cat</ComboboxOption>
          <ComboboxOption disabled>Ferret</ComboboxOption>
          <ComboboxOption>Dog</ComboboxOption>
        </Combobox>,
      );
    });

    const expand = component!.root.findByProps({ testID: 'combo-expand' });
    act(() => expand.props.onPress({ nativeEvent: {} }));
    expect(component!.root.findByProps({ testID: 'combo-input' }).props.accessibilityState.expanded).toBe(true);

    const dog = component!.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === 'Dog')!;
    act(() => dog.props.onPress({ nativeEvent: {} }));

    expect(component!.root.findByType(TextInput).props.value).toBe('Dog');
    expect(component!.root.findByProps({ testID: 'combo-input' }).props.accessibilityState.expanded).toBe(false);
    expect(onOptionSelect).toHaveBeenCalledWith(expect.anything(), {
      optionText: 'Dog',
      optionValue: 'Dog',
      selectedOptions: ['Dog'],
    });
  });

  it('supports multiselect and disabled options', () => {
    const onOptionSelect = jest.fn();
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Combobox multiselect onOptionSelect={onOptionSelect} open>
          <ComboboxOption>Cat</ComboboxOption>
          <ComboboxOption disabled>Ferret</ComboboxOption>
        </Combobox>,
      );
    });

    const cat = component!.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === 'Cat')!;
    const ferret = component!.root.findAllByType(Pressable).find(node => node.props.accessibilityLabel === 'Ferret')!;
    act(() => cat.props.onPress({ nativeEvent: {} }));
    act(() => ferret.props.onPress?.({ nativeEvent: {} }));

    expect(onOptionSelect).toHaveBeenCalledTimes(1);
    expect(onOptionSelect).toHaveBeenLastCalledWith(expect.anything(), {
      optionText: 'Cat',
      optionValue: 'Cat',
      selectedOptions: ['Cat'],
    });
    expect(component!.root.findByType(TextInput).props.accessibilityState.expanded).toBe(true);
  });

  it('renders groups and custom option content', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Combobox open>
          <ComboboxOptionGroup label="Land">
            <ComboboxOption text="Katri Athokas">
              <TextInput value="Persona content" />
            </ComboboxOption>
          </ComboboxOptionGroup>
        </Combobox>,
      );
    });

    expect(component!.root.findByProps({ children: 'Land' })).toBeTruthy();
    expect(component!.root.findByProps({ accessibilityLabel: 'Katri Athokas' })).toBeTruthy();
  });

  it('clears a selected single value and blocks disabled expansion', () => {
    let clearable: renderer.ReactTestRenderer;
    act(() => {
      clearable = renderer.create(
        <Combobox clearable defaultSelectedOptions={['Blue']} defaultValue="Blue" testID="clearable">
          <ComboboxOption>Blue</ComboboxOption>
        </Combobox>,
      );
    });
    act(() => clearable!.root.findByProps({ testID: 'clearable-clear' }).props.onPress({ nativeEvent: {} }));
    expect(clearable!.root.findByType(TextInput).props.value).toBe('');

    let disabled: renderer.ReactTestRenderer;
    act(() => {
      disabled = renderer.create(
        <Combobox disabled testID="disabled">
          <ComboboxOption>Cat</ComboboxOption>
        </Combobox>,
      );
    });
    expect(disabled!.root.findByProps({ testID: 'disabled-expand' }).props.disabled).toBe(true);
    expect(disabled!.root.findByType(TextInput).props.editable).toBe(false);
  });
});
