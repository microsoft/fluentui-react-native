import * as React from 'react';
import { Pressable, Text } from 'react-native';
import type { ComponentMetadata } from '@fluentui-react-native/concepts';

import { analyzeComponent } from './analyzeComponent.ts';

interface ToyProps {
  disabled?: boolean;
}

function Toy(props: ToyProps): React.ReactElement {
  return (
    <Pressable
      testID="root"
      accessibilityRole="button"
      accessibilityLabel="Hi"
      accessibilityState={{ disabled: props.disabled === true }}
      disabled={props.disabled}
    >
      <Text>Hi</Text>
    </Pressable>
  );
}

describe('analyzeComponent', () => {
  it('returns the matrix and an empty issues array for a clean toy component', async () => {
    const metadata: ComponentMetadata = {
      name: 'Toy',
      importPath: 'inline://toy',
      exportName: 'Toy',
      framework: 'none',
      platforms: ['ios'],
      states: ['disabled'],
      baseProps: { testID: 'root' },
    };

    const result = await analyzeComponent({ Component: Toy, metadata });

    expect(result.matrix.data.snapshots.map((s) => s.stateId)).toEqual(['default', 'default-disabled']);
    expect(result.issues).toEqual([]);
  });

  it('surfaces metadata validation issues without running the matrix', async () => {
    // Intentionally missing `states`, `framework`, `platforms`.
    const bad = {
      name: 'Toy',
      importPath: 'inline://toy',
      exportName: 'Toy',
    } as unknown as ComponentMetadata;

    const result = await analyzeComponent({ Component: Toy, metadata: bad });

    expect(result.matrix.data.snapshots).toEqual([]);
    expect(result.issues.some((i) => i.rule === 'component/missing-field')).toBe(true);
  });

  it('reports a11y issues tagged by derived state id', async () => {
    function Unlabelled(): React.ReactElement {
      return (
        <Pressable testID="root" accessibilityRole="button">
          <Text>{''}</Text>
        </Pressable>
      );
    }

    const metadata: ComponentMetadata = {
      name: 'Unlabelled',
      importPath: 'inline://unlabelled',
      exportName: 'Unlabelled',
      framework: 'none',
      platforms: ['ios'],
      states: [],
      baseProps: { testID: 'root' },
    };

    const result = await analyzeComponent({ Component: Unlabelled, metadata });

    expect(result.matrix.data.snapshots).toHaveLength(1);
    const labelIssue = result.issues.find((i) => i.rule === 'a11y/missing-label');
    expect(labelIssue).toBeDefined();
    expect(labelIssue?.message).toContain('[state: default]');
  });
});
