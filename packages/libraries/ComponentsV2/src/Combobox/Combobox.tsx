import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFluentTheme } from '@fluentui-react-native/framework';
import { Path, Svg } from 'react-native-svg';

import { comboboxSizeTokens } from './Combobox.tokens';
import type {
  ComboboxInteractionEvent,
  ComboboxOptionData,
  ComboboxOptionGroupProps,
  ComboboxOptionProps,
  ComboboxProps,
} from './Combobox.types';

interface ParsedOption extends ComboboxOptionData {
  checkIcon?: React.ReactNode;
  content: React.ReactNode;
  groupLabel?: React.ReactNode;
  groupLabelStyle?: ComboboxOptionGroupProps['labelStyle'];
}

function optionText(props: ComboboxOptionProps): string {
  if (props.text !== undefined) {
    return props.text;
  }
  if (typeof props.children === 'string' || typeof props.children === 'number') {
    return String(props.children);
  }
  return '';
}

function parseOptions(children: React.ReactNode): ParsedOption[] {
  const options: ParsedOption[] = [];

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) {
      return;
    }

    if (child.type === ComboboxOption) {
      const props = child.props as ComboboxOptionProps;
      const text = optionText(props);
      options.push({
        checkIcon: props.checkIcon,
        content: props.children ?? text,
        disabled: !!props.disabled,
        text,
        value: props.value ?? text,
      });
      return;
    }

    if (child.type === ComboboxOptionGroup) {
      const groupProps = child.props as ComboboxOptionGroupProps;
      React.Children.forEach(groupProps.children, optionChild => {
        if (!React.isValidElement(optionChild) || optionChild.type !== ComboboxOption) {
          return;
        }
        const props = optionChild.props as ComboboxOptionProps;
        const text = optionText(props);
        options.push({
          checkIcon: props.checkIcon,
          content: props.children ?? text,
          disabled: !!props.disabled,
          groupLabel: groupProps.label,
          groupLabelStyle: groupProps.labelStyle,
          text,
          value: props.value ?? text,
        });
      });
    }
  });

  return options;
}

function ClearIcon({ color, size }: { color: string; size: number }): React.ReactElement {
  return (
    <Svg height={size} viewBox="0 0 20 20" width={size}>
      <Path
        d="M5.47 5.47a.75.75 0 0 1 1.06 0L10 8.94l3.47-3.47a.75.75 0 1 1 1.06 1.06L11.06 10l3.47 3.47a.75.75 0 1 1-1.06 1.06L10 11.06l-3.47 3.47a.75.75 0 0 1-1.06-1.06L8.94 10 5.47 6.53a.75.75 0 0 1 0-1.06Z"
        fill={color}
      />
    </Svg>
  );
}

function Checkmark({ color }: { color: string }): React.ReactElement {
  return (
    <Svg height={16} viewBox="0 0 16 16" width={16}>
      <Path
        d="M13.85 3.65a.5.5 0 0 1 0 .7l-7.5 7.5a.5.5 0 0 1-.7 0l-3.5-3.5a.5.5 0 1 1 .7-.7L6 10.79l7.15-7.14a.5.5 0 0 1 .7 0Z"
        fill={color}
      />
    </Svg>
  );
}

export const ComboboxOption = (_props: ComboboxOptionProps): React.ReactElement | null => null;
ComboboxOption.displayName = 'ComboboxOption';

export const ComboboxOptionGroup = (_props: ComboboxOptionGroupProps): React.ReactElement | null => null;
ComboboxOptionGroup.displayName = 'ComboboxOptionGroup';

export const Combobox = React.forwardRef<TextInput, ComboboxProps>((props, ref) => {
  const {
    accessibilityLabel,
    appearance = 'outline',
    children,
    clearable = false,
    defaultSelectedOptions = [],
    defaultValue = '',
    disabled = false,
    freeform = false,
    inputProps,
    inputStyle,
    listboxStyle,
    multiselect = false,
    onActiveOptionChange,
    onChangeText,
    onOpenChange,
    onOptionSelect,
    open,
    placeholder,
    selectedOptions,
    size = 'medium',
    style,
    testID,
    value,
    ...rest
  } = props;
  const theme = useFluentTheme();
  const options = React.useMemo(() => parseOptions(children), [children]);
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [internalSelectedOptions, setInternalSelectedOptions] = React.useState(defaultSelectedOptions);
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentOpen = open ?? internalOpen;
  const currentSelectedOptions = selectedOptions ?? internalSelectedOptions;
  const currentValue = value ?? internalValue;
  const sizeTokens = comboboxSizeTokens[size];
  const foregroundColor = disabled
    ? String(theme.colors.neutralForegroundDisabled ?? '#a0a0a0')
    : String(theme.colors.neutralForeground1 ?? '#242424');
  const iconColor = disabled
    ? String(theme.colors.neutralForegroundDisabled ?? '#a0a0a0')
    : String(theme.colors.neutralStrokeAccessible ?? '#616161');

  const requestOpenChange = React.useCallback(
    (event: ComboboxInteractionEvent, nextOpen: boolean) => {
      if (disabled || nextOpen === currentOpen) {
        return;
      }
      if (open === undefined) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(event, { open: nextOpen });
    },
    [currentOpen, disabled, onOpenChange, open],
  );

  const requestValueChange = React.useCallback(
    (nextValue: string) => {
      if (value === undefined) {
        setInternalValue(nextValue);
      }
      onChangeText?.(nextValue);
    },
    [onChangeText, value],
  );

  const clearSelection = React.useCallback(
    (event: ComboboxInteractionEvent) => {
      if (disabled) {
        return;
      }
      if (selectedOptions === undefined) {
        setInternalSelectedOptions([]);
      }
      requestValueChange('');
      onOptionSelect?.(event, { selectedOptions: [] });
    },
    [disabled, onOptionSelect, requestValueChange, selectedOptions],
  );

  const selectOption = React.useCallback(
    (event: ComboboxInteractionEvent, option: ParsedOption) => {
      if (disabled || option.disabled) {
        return;
      }

      const isSelected = currentSelectedOptions.includes(option.value);
      const nextSelectedOptions = multiselect
        ? isSelected
          ? currentSelectedOptions.filter(item => item !== option.value)
          : [...currentSelectedOptions, option.value]
        : [option.value];

      if (selectedOptions === undefined) {
        setInternalSelectedOptions(nextSelectedOptions);
      }
      requestValueChange(multiselect ? '' : option.text);
      onOptionSelect?.(event, {
        optionText: option.text,
        optionValue: option.value,
        selectedOptions: nextSelectedOptions,
      });
      if (!multiselect) {
        requestOpenChange(event, false);
      }
    },
    [
      currentSelectedOptions,
      disabled,
      multiselect,
      onOptionSelect,
      requestOpenChange,
      requestValueChange,
      selectedOptions,
    ],
  );

  const showClearIcon = clearable && !multiselect && currentSelectedOptions.length > 0 && !disabled;
  // The catalog page already owns vertical scrolling; cap inline options to avoid nested Win32 scroll hosts.
  const renderedOptions = options.length > 8 ? options.slice(0, 8) : options;
  let previousGroup: React.ReactNode;

  return (
    <View {...rest} style={[styles.container, style]} testID={testID}>
      <View
        style={[
          styles.field,
          {
            backgroundColor:
              appearance === 'filled-darker' ? '#f0f0f0' : appearance === 'filled-lighter' ? '#ffffff' : 'transparent',
            borderBottomColor: disabled ? '#e0e0e0' : '#616161',
            borderBottomWidth: 1,
            borderColor: disabled ? '#e0e0e0' : '#d1d1d1',
            borderRadius: appearance === 'underline' ? 0 : 4,
            borderWidth: appearance === 'underline' ? 0 : 1,
            minHeight: sizeTokens.height,
            paddingLeft: sizeTokens.paddingLeft,
          },
        ]}
        testID={testID ? `${testID}-field` : undefined}
      >
        <TextInput
          {...inputProps}
          editable={!disabled}
          onChangeText={nextValue => {
            if (nextValue === currentValue) {
              return;
            }
            requestValueChange(nextValue);
            if (!currentOpen) {
              requestOpenChange({} as GestureResponderEvent, true);
            }
          }}
          onSubmitEditing={event => {
            if (freeform && currentValue.trim()) {
              const matchingOption = options.find(
                option => option.text.toLocaleLowerCase() === currentValue.trim().toLocaleLowerCase(),
              );
              if (matchingOption) {
                selectOption(event as unknown as ComboboxInteractionEvent, matchingOption);
              } else {
                const customOption: ParsedOption = {
                  content: currentValue.trim(),
                  disabled: false,
                  text: currentValue.trim(),
                  value: currentValue.trim(),
                };
                selectOption(event as unknown as ComboboxInteractionEvent, customOption);
              }
            }
            inputProps?.onSubmitEditing?.(event);
          }}
          placeholder={placeholder}
          placeholderTextColor={disabled ? '#a0a0a0' : '#707070'}
          ref={ref}
          style={[
            styles.input,
            {
              color: foregroundColor,
              fontSize: sizeTokens.fontSize,
            },
            inputStyle,
          ]}
          value={currentValue}
        />
        {showClearIcon ? (
          <Pressable
            accessibilityLabel="Clear selection"
            accessibilityRole="button"
            disabled={disabled}
            onPress={clearSelection}
            style={styles.iconButton}
            testID={testID ? `${testID}-clear` : undefined}
          >
            <ClearIcon color={iconColor} size={sizeTokens.iconSize} />
          </Pressable>
        ) : (
          <Pressable
            accessibilityLabel={currentOpen ? 'Close' : 'Open'}
            accessibilityRole="button"
            disabled={disabled}
            onPress={event => requestOpenChange(event, !currentOpen)}
            style={styles.iconButton}
            testID={testID ? `${testID}-expand` : undefined}
          >
            <Text style={{ color: iconColor, fontSize: 12 }}>v</Text>
          </Pressable>
        )}
      </View>
      {currentOpen && !disabled ? (
        <View style={[styles.listbox, listboxStyle]} testID={testID ? `${testID}-listbox` : undefined}>
          {renderedOptions.map(option => {
            const selected = currentSelectedOptions.includes(option.value);
            const showGroup = option.groupLabel !== undefined && option.groupLabel !== previousGroup;
            previousGroup = option.groupLabel;
            return (
              <React.Fragment key={`${String(option.groupLabel)}-${option.value}`}>
                {showGroup ? (
                  <Text style={[styles.groupLabel, option.groupLabelStyle]}>{option.groupLabel}</Text>
                ) : null}
                <Pressable
                  accessibilityLabel={option.text}
                  accessibilityRole={multiselect ? 'checkbox' : 'menuitem'}
                  accessibilityState={{ checked: multiselect ? selected : undefined, disabled: option.disabled, selected }}
                  disabled={option.disabled}
                  onFocus={event => onActiveOptionChange?.(event as unknown as ComboboxInteractionEvent, { nextOption: option })}
                  onHoverIn={event => onActiveOptionChange?.(event as unknown as ComboboxInteractionEvent, { nextOption: option })}
                  onPress={event => selectOption(event, option)}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && !option.disabled && styles.optionPressed,
                    option.disabled && styles.optionDisabled,
                  ]}
                >
                  <View style={styles.checkSlot}>
                    {selected ? option.checkIcon ?? <Checkmark color="#0f6cbd" /> : null}
                  </View>
                  <View style={styles.optionContent}>
                    {typeof option.content === 'string' || typeof option.content === 'number' ? (
                      <Text style={[styles.optionText, option.disabled && styles.optionTextDisabled]}>
                        {option.content}
                      </Text>
                    ) : (
                      option.content
                    )}
                  </View>
                </Pressable>
              </React.Fragment>
            );
          })}
        </View>
      ) : null}
    </View>
  );
});

Combobox.displayName = 'Combobox';

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
  },
  checkSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
  },
  field: {
    alignItems: 'center',
    flexDirection: 'row',
    minWidth: 120,
  },
  groupLabel: {
    color: '#616161',
    fontFamily: 'Segoe UI',
    fontSize: 12,
    fontWeight: '600',
    paddingBottom: 4,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  input: {
    borderWidth: 0,
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  iconButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    width: 32,
  },
  listbox: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d1d1',
    borderRadius: 4,
    borderWidth: 1,
    elevation: 16,
    marginTop: 2,
    maxHeight: 250,
    minWidth: 160,
    shadowColor: '#000000',
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  option: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 32,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  optionContent: {
    flex: 1,
    minWidth: 0,
  },
  optionDisabled: {
    opacity: 0.45,
  },
  optionPressed: {
    backgroundColor: '#e8e8e8',
  },
  optionSelected: {
    backgroundColor: '#ebf3fc',
  },
  optionText: {
    color: '#242424',
    fontFamily: 'Segoe UI',
    fontSize: 14,
  },
  optionTextDisabled: {
    color: '#a0a0a0',
  },
});
