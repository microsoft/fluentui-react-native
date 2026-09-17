import * as React from 'react';
import type { View } from 'react-native';

import { ThemedRoot } from '../index';
import type { InputModality, RootSettings, ThemedRootProps } from '../index';
import { ThemedRoot as ThemingRoot, useRootSettings } from './index';

function acceptsViewProps(props: React.ComponentPropsWithRef<typeof View>) {
  return React.createElement(ThemedRoot, props);
}

function readOnlyRoot(root: RootSettings) {
  const modality: InputModality = root.inputModality;
  // @ts-expect-error Consumers may query, but not modify, scene state.
  root.inputModality = 'pointer';
  return modality;
}

const props: ThemedRootProps = {
  appearance: { colorScheme: 'system', contrast: 'highContrast' },
  onKeyDownCapture: (event) => {
    const key: string = event.nativeEvent.key;
    return key;
  },
  onStartShouldSetResponderCapture: () => false,
};
// @ts-expect-error Modality is limited to keyboard and pointer.
const invalidModality: InputModality = 'touch';
// @ts-expect-error ThemedRoot uses the structured appearance contract.
const invalidAppearance: ThemedRootProps = { appearance: 'dark' };

describe('ThemedRoot types', () => {
  it('exports the same component through both public entrypoints', () => {
    expect(ThemedRoot).toBe(ThemingRoot);
    expect(useRootSettings).toEqual(expect.any(Function));
    expect(acceptsViewProps({ testID: 'view' }).type).toBe(ThemedRoot);
    expect(readOnlyRoot).toEqual(expect.any(Function));
    expect(props.appearance.colorScheme).toBe('system');
    expect(invalidModality).toBe('touch');
    expect(invalidAppearance.appearance).toBe('dark');
  });
});
