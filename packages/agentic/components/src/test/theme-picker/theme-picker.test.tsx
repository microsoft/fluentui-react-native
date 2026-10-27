import * as React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';

import { render } from '../../common/renderWithTheme';
import { StoryStatus } from '../story-status/story-status';
import type { TestThemeSelection } from './theme-picker.types';
import { ThemePicker } from './theme-picker';

const keyboardPress = { nativeEvent: { key: 'Enter' } };

jest.mock('react-native/Libraries/ReactNative/RendererProxy', () => ({
  ...jest.requireActual('react-native/Libraries/ReactNative/RendererProxy'),
  dispatchCommand: jest.fn(),
  findNodeHandle: jest.fn(() => 42),
}));

async function selectOption(triggerID: string, listboxID: string, optionID: string) {
  await fireEvent(screen.getByTestId(triggerID), 'press', keyboardPress);
  const listbox = screen.getByTestId(listboxID);
  await fireEvent(listbox, 'ready', { nativeEvent: { generation: listbox.props.commandGeneration } });
  await fireEvent(screen.getByTestId(optionID), 'press', keyboardPress);
}

function Harness() {
  const [selection, setSelection] = React.useState<TestThemeSelection>({ source: 'inherit' });
  return (
    <>
      <ThemePicker onSelectionChange={setSelection} selection={selection} testIDPrefix="picker" />
      <StoryStatus testID="selection">{JSON.stringify(selection)}</StoryStatus>
    </>
  );
}

describe('ThemePicker', () => {
  it('uses named dropdowns and keeps appearance controls disabled while inheriting', async () => {
    await render(<Harness />);

    expect(screen.getByTestId('picker-source-trigger').props.accessibilityLabel).toBe('Theme source');
    expect(screen.getByTestId('picker-color-scheme-trigger').props.accessibilityLabel).toBe('Color scheme');
    expect(screen.getByTestId('picker-contrast-trigger').props.accessibilityLabel).toBe('Contrast');
    expect(screen.getByTestId('picker-color-scheme-trigger').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByTestId('picker-contrast-trigger').props.accessibilityState.disabled).toBe(true);
  });

  it('changes the source and color scheme independently while preserving the contrast request', async () => {
    await render(<Harness />);
    await selectOption('picker-source-trigger', 'picker-source-listbox', 'picker-source-fluent');
    expect(screen.getByTestId('selection').props.accessibilityLabel).toBe(
      JSON.stringify({ source: 'fluent', appearance: { colorScheme: 'system', contrast: 'system', interfaceLevel: 'system' } }),
    );

    await selectOption('picker-color-scheme-trigger', 'picker-color-scheme-listbox', 'picker-color-scheme-dark');
    expect(screen.getByTestId('selection').props.accessibilityLabel).toBe(
      JSON.stringify({ source: 'fluent', appearance: { colorScheme: 'dark', contrast: 'system', interfaceLevel: 'system' } }),
    );
  });
});
