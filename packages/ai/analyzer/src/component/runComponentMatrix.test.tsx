import * as React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { ComponentMetadata } from './ComponentMetadata.ts';
import { runComponentMatrix } from './runComponentMatrix.ts';

interface ToyProps {
  disabled?: boolean;
  onPress?: () => void;
}

/**
 * Tiny inline component used to exercise the matrix without depending
 * on a real FluentUI component. Covers a Pressable with a testID and a
 * disabled prop wired into `accessibilityState`, which is what the
 * matrix and the a11y analyzer key off of.
 */
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
    baseProps: { testID: 'root' },
    states: [
      { id: 'default' },
      { id: 'disabled', props: { disabled: true } },
      {
        id: 'pressed',
        interactions: [{ kind: 'press', targetTestID: 'root' }],
      },
    ],
  };

  it('produces one snapshot per state, in input order', async () => {
    const result = await runComponentMatrix(Toy, metadata);

    expect(result.component).toBe('Toy');
    expect(result.data.snapshots.map((s) => s.state.id)).toEqual(['default', 'disabled', 'pressed']);
    expect(result.data.issues).toEqual([]);
  });

  it('records accessibility state in the captured a11y tree', async () => {
    const result = await runComponentMatrix(Toy, metadata);

    const defaultSnapshot = result.data.snapshots[0];
    expect(defaultSnapshot.a11yTree?.role).toBe('button');
    expect(defaultSnapshot.a11yTree?.label).toBe('Hi');
    expect(defaultSnapshot.a11yTree?.state).toEqual({ disabled: false });

    const disabledSnapshot = result.data.snapshots[1];
    expect(disabledSnapshot.a11yTree?.state).toEqual({ disabled: true });
  });

  it('applies the press interaction and surfaces no errors on the pressed state', async () => {
    const handler = jest.fn();
    const metadataWithHandler: ComponentMetadata = {
      ...metadata,
      baseProps: { ...metadata.baseProps, onPress: handler },
    };

    const result = await runComponentMatrix(Toy, metadataWithHandler);

    const pressed = result.data.snapshots.find((s) => s.state.id === 'pressed');
    expect(pressed).toBeDefined();
    expect(pressed?.error).toBeUndefined();
    expect(pressed?.renderTree).not.toBeNull();
    // The press interaction should have invoked the handler once (and
    // only once, since each state mounts and unmounts independently).
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
      states: [{ id: 'default' }, { id: 'second' }],
    };

    // Suppress the error log react-test-renderer emits for the throw.
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const result = await runComponentMatrix(Broken, broken);

      expect(result.data.snapshots).toHaveLength(2);
      expect(result.data.snapshots[0].error).toBeDefined();
      expect(result.data.snapshots[1].error).toBeDefined();
      expect(result.data.issues.length).toBeGreaterThanOrEqual(2);
      for (const issue of result.data.issues) {
        expect(issue.severity).toBe('error');
      }
    } finally {
      errSpy.mockRestore();
    }
  });

  it('captures the post-effect state, not the pre-effect render', async () => {
    // Components that set state in `useEffect` are the common case for
    // composition-framework components. Without act() flushing, the
    // captured tree would reflect the pre-effect render — not what
    // the user actually sees.
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
      baseProps: { testID: 'root' },
      states: [{ id: 'default' }],
    };

    const result = await runComponentMatrix(Effect, effectMetadata);
    const snap = result.data.snapshots[0];
    expect(snap.error).toBeUndefined();
    expect(snap.a11yTree?.label).toBe('post');
  });
});
