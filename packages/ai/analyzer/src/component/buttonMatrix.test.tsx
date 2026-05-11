// The umbrella `@fluentui/react-native` package re-exports `ButtonV1` as
// `Button`; that's the import path brief 01 already uses for its theme
// end-to-end test, so we follow suit to avoid an extra workspace dep.
import { Button } from '@fluentui/react-native';

import type { ComponentMetadata } from './ComponentMetadata.ts';
import { runComponentMatrix } from './runComponentMatrix.ts';

/**
 * Real-component smoke test required by brief 03 §6: renders the
 * FluentUI Button across a `default` and `disabled` state and asserts
 * the matrix completes without errors and produces two snapshots.
 *
 * No theme registry is supplied here — we want to confirm the driver
 * works with a real composition-framework component when nothing more
 * than the bare component + JSX is in scope. (Theme integration is
 * covered separately in `runComponentMatrix.test.tsx`.)
 */
describe('Button real-component smoke test', () => {
  const metadata: ComponentMetadata = {
    name: 'Button',
    importPath: '@fluentui-react-native/button',
    exportName: 'Button',
    baseProps: { children: 'Hi', testID: 'button-root' },
    states: [{ id: 'default' }, { id: 'disabled', props: { disabled: true } }],
  };

  it('produces two snapshots without error', async () => {
    const result = await runComponentMatrix(Button, metadata);

    expect(result.component).toBe('Button');
    expect(result.data.snapshots).toHaveLength(2);
    // Neither state should record a render/interaction error.
    for (const snapshot of result.data.snapshots) {
      expect(snapshot.error).toBeUndefined();
      expect(snapshot.renderTree).not.toBeNull();
    }
    // And the run as a whole should not have surfaced any top-level
    // analyzer issues either.
    expect(result.data.issues).toEqual([]);
  });

  it('captures the disabled accessibility state on the disabled snapshot', async () => {
    const result = await runComponentMatrix(Button, metadata);

    const disabled = result.data.snapshots.find((s) => s.state.id === 'disabled');
    expect(disabled).toBeDefined();
    // Find the first a11y node that records the disabled bit. Most
    // FluentUI buttons surface this on the root pressable, but we
    // search the subtree to keep the assertion robust.
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
