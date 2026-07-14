import * as React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { ComponentMetadata } from '@fluentui-react-native/concepts';

import { runComponentMatrix } from './runComponentMatrix.ts';

interface ToyProps {
  disabled?: boolean;
  onPress?: () => void;
}

function Toy(props: ToyProps): React.ReactElement {
  return (
    <Pressable
      testID="root"
      accessibilityRole="button"
      accessibilityLabel="Hi"
      accessibilityState={{ disabled: props.disabled === true }}
      disabled={props.disabled}
      onPress={props.onPress}
    >
      <View>
        <Text>Hi</Text>
      </View>
    </Pressable>
  );
}

describe('runComponentMatrix', () => {
  const metadata: ComponentMetadata = {
    name: 'Toy',
    importPath: 'inline://toy',
    exportName: 'Toy',
    framework: 'none',
    platforms: ['ios'],
    states: ['disabled', 'press'],
    baseProps: { testID: 'root' },
  };

  it('produces one snapshot per derived state', async () => {
    const result = await runComponentMatrix(Toy, metadata);

    expect(result.component).toBe('Toy');
    // default + default-disabled + default-press
    expect(result.data.snapshots.map((s) => s.stateId)).toEqual(['default', 'default-disabled', 'default-press']);
    expect(result.data.issues).toEqual([]);
  });

  it('records accessibility state in the captured a11y tree', async () => {
    const result = await runComponentMatrix(Toy, metadata);

    const defaultSnap = result.data.snapshots.find((s) => s.stateId === 'default');
    expect(defaultSnap?.a11yTree?.role).toBe('button');
    expect(defaultSnap?.a11yTree?.label).toBe('Hi');
    expect(defaultSnap?.a11yTree?.state).toEqual({ disabled: false });

    const disabled = result.data.snapshots.find((s) => s.stateId === 'default-disabled');
    expect(disabled?.a11yTree?.state).toEqual({ disabled: true });
  });

  it('applies the press interaction and invokes the handler', async () => {
    const handler = jest.fn();
    const metadataWithHandler: ComponentMetadata = {
      ...metadata,
      baseProps: { ...metadata.baseProps, onPress: handler },
    };

    const result = await runComponentMatrix(Toy, metadataWithHandler);

    const pressed = result.data.snapshots.find((s) => s.stateId === 'default-press');
    expect(pressed?.error).toBeUndefined();
    expect(pressed?.renderTree).not.toBeNull();
    // The press interaction should fire exactly once per matrix mount.
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('continues past a failing state and reports the issue against it', async () => {
    function Broken(): React.ReactElement {
      throw new Error('boom');
    }
    const broken: ComponentMetadata = {
      name: 'Broken',
      importPath: 'inline://broken',
      exportName: 'Broken',
      framework: 'none',
      platforms: ['ios'],
      states: [],
      appearances: ['primary'],
    };

    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const result = await runComponentMatrix(Broken, broken);

      // Two branches (default + primary) and neither succeeded.
      expect(result.data.snapshots.length).toBe(2);
      for (const snap of result.data.snapshots) {
        expect(snap.error).toBeDefined();
      }
      expect(result.data.issues.length).toBeGreaterThanOrEqual(2);
    } finally {
      errSpy.mockRestore();
    }
  });

  it('captures the post-effect render, not the pre-effect tree', async () => {
    function Effect(): React.ReactElement {
      const [label, setLabel] = React.useState('pre');
      React.useEffect(() => {
        setLabel('post');
      }, []);
      return (
        <Pressable testID="root" accessibilityRole="button" accessibilityLabel={label}>
          <Text>{label}</Text>
        </Pressable>
      );
    }

    const effectMetadata: ComponentMetadata = {
      name: 'Effect',
      importPath: 'inline://effect',
      exportName: 'Effect',
      framework: 'none',
      platforms: ['ios'],
      states: [],
      baseProps: { testID: 'root' },
    };

    const result = await runComponentMatrix(Effect, effectMetadata);
    const snap = result.data.snapshots[0];
    expect(snap.error).toBeUndefined();
    expect(snap.a11yTree?.label).toBe('post');
  });
});
