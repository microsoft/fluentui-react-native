import { Text, View } from 'react-native';
import { act, create } from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';

import { RootInputBoundary } from './RootInputBoundary';
import { createRootInputController } from './rootInputController';
import { ThemedRoot } from './ThemedRoot';
import { useRootSettings } from './rootContext';
import { useRootInputModality } from './useRootInputModality';
import type { RootSettings } from './rootContext';

describe('root input controller', () => {
  it('deduplicates modality changes, preserves the settings object, and cleans up', () => {
    const controller = createRootInputController();
    const settings = controller.settings;
    const notify = jest.fn();
    const unsubscribe = controller.subscribe(notify);
    controller.setInputModality('pointer');
    expect(notify).not.toHaveBeenCalled();
    controller.setInputModality('keyboard');
    controller.setInputModality('keyboard');
    expect(notify).toHaveBeenCalledTimes(1);
    expect(controller.settings).toBe(settings);
    expect(settings.inputModality).toBe('keyboard');
    unsubscribe();
    unsubscribe();
    controller.setInputModality('pointer');
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('shares popup input without rerendering unsubscribed consumers or the root', () => {
    const settings: RootSettings[] = [];
    const active: string[] = [];
    const inactive: string[] = [];
    const rootRenders = jest.fn();
    function Probe({ subscribed }: { subscribed: boolean }) {
      settings.push(useRootSettings());
      const value = useRootInputModality(subscribed);
      (subscribed ? active : inactive).push(value);
      return <Text>{value}</Text>;
    }
    function Scene() {
      rootRenders();
      return (
        <ThemedRoot>
          <Probe subscribed={false} />
          <RootInputBoundary testID="popup">
            <Probe subscribed />
          </RootInputBoundary>
        </ThemedRoot>
      );
    }
    let tree: ReactTestRenderer;
    act(() => {
      tree = create(<Scene />);
    });
    const popup = () => tree!.root.findAllByType(View).find((node) => node.props.testID === 'popup')!;
    const inactiveCount = inactive.length;
    act(() => popup().props.onKeyDownCapture({ nativeEvent: { key: 'Tab' } }));
    expect(active[active.length - 1]).toBe('keyboard');
    expect(inactive).toHaveLength(inactiveCount);
    expect(rootRenders).toHaveBeenCalledTimes(1);
    expect(settings.every((value) => value === settings[0])).toBe(true);
    act(() => popup().props.onPointerDownCapture({}));
    expect(active[active.length - 1]).toBe('pointer');
    act(() => popup().props.onKeyDownCapture({ nativeEvent: { key: 'Shift' } }));
    expect(settings[0].inputModality).toBe('pointer');
    act(() => tree!.unmount());
  });
});
