import { View } from 'react-native';
import { act, create } from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';

import { useFocusTarget } from './useFocusTarget';
import type { UseFocusTargetResult } from './useFocusTarget';

describe('useFocusTarget ref handoffs', () => {
  let tree: ReactTestRenderer | undefined;

  afterEach(async () => {
    await act(async () => tree?.unmount());
  });

  it('keeps same-instance inline callback refs stable while mounted and focused', () => {
    const instance = { focus: jest.fn() };
    const seen: UseFocusTargetResult[] = [];
    function Probe({ label }: { label: string }) {
      const target = useFocusTarget();
      seen.push(target);
      return (
        <View
          accessibilityLabel={label}
          ref={(node) => target.focusTargetRef(node)}
          onFocus={target.onFocus}
          onBlur={target.onBlur}
          testID={target.focused ? 'focused' : 'blurred'}
        />
      );
    }

    act(() => {
      tree = create(<Probe label="First" />, { createNodeMock: () => instance });
    });
    expect(seen).toHaveLength(1);
    const target = seen[0].focusTarget;
    const mountedInstance = target.current;
    expect(mountedInstance).not.toBeNull();
    const generation = target.generation;

    act(() => tree!.root.findByType(View).props.onFocus({ target: 1, currentTarget: 1 }));
    expect(seen).toHaveLength(2);
    expect(target.getSnapshot().focused).toBe(true);

    act(() => tree!.update(<Probe label="Second" />));
    expect(seen).toHaveLength(3);
    expect(target.current).toBe(mountedInstance);
    expect(target.generation).toBe(generation);
    expect(tree!.root.findByType(View).props.testID).toBe('focused');

    act(() => tree!.root.findByType(View).props.onBlur({ target: 1, currentTarget: 1 }));
    expect(seen).toHaveLength(4);
    expect(tree!.root.findByType(View).props.testID).toBe('blurred');
  });
});
