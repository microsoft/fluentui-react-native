// The umbrella `@fluentui/react-native` package re-exports `ButtonV1` as
// `Button`; we use it here to keep the workspace dep set narrow.
import { Button } from '@fluentui/react-native';
import type { ComponentMetadata } from '@fluentui-react-native/concepts';

import { runComponentMatrix } from './runComponentMatrix.ts';

/**
 * Real-component smoke test: renders the FluentUI Button across the
 * derived states implied by a minimal declarative metadata document
 * and asserts the matrix completes without errors.
 */
describe('Button real-component smoke test', () => {
  const metadata: ComponentMetadata = {
    name: 'Button',
    importPath: '@fluentui-react-native/button',
    exportName: 'Button',
    framework: 'v1',
    platforms: ['ios'],
    states: ['disabled'],
    baseProps: { children: 'Hi', testID: 'button-root' },
  };

  it('produces snapshots for default + default-disabled without error', async () => {
    const result = await runComponentMatrix(Button, metadata);

    expect(result.component).toBe('Button');
    expect(result.data.snapshots.map((s) => s.stateId)).toEqual(['default', 'default-disabled']);
    for (const snapshot of result.data.snapshots) {
      expect(snapshot.error).toBeUndefined();
      expect(snapshot.renderTree).not.toBeNull();
    }
    expect(result.data.issues).toEqual([]);
  });

  it('captures the disabled accessibility state on the disabled snapshot', async () => {
    const result = await runComponentMatrix(Button, metadata);

    const disabled = result.data.snapshots.find((s) => s.stateId === 'default-disabled');
    expect(disabled).toBeDefined();
    expect(disabled?.a11yTree).not.toBeNull();
    expect(findDisabledTrue(disabled?.a11yTree)).toBe(true);
  });
});

interface MinimalA11yNode {
  state?: Record<string, boolean>;
  children: MinimalA11yNode[];
}

function findDisabledTrue(node: MinimalA11yNode | null | undefined): boolean {
  if (!node) {
    return false;
  }
  if (node.state?.disabled === true) {
    return true;
  }
  for (const child of node.children) {
    if (findDisabledTrue(child)) {
      return true;
    }
  }
  return false;
}
