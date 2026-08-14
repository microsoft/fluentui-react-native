/** @jsxImportSource @fluentui-react-native/framework-base */
import { act } from 'react';
import { AccessibilityInfo, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';

import { useFlexTokens } from '@fluentui-react-native/design';

import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  let reduceMotionSpy: jest.SpyInstance;

  beforeEach(() => {
    reduceMotionSpy = jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockReturnValue({ remove: jest.fn() } as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function renderSkeleton(props?: React.ComponentProps<typeof Skeleton>) {
    return render(<Skeleton testID="skeleton" {...props} />);
  }

  function getRoot(component: Awaited<ReturnType<typeof renderSkeleton>>) {
    return component.getByTestId('skeleton', { includeHiddenElements: true });
  }

  function getRootStyle(component: Awaited<ReturnType<typeof renderSkeleton>>): ViewStyle {
    return StyleSheet.flatten(getRoot(component).props.style);
  }

  it('renders a decorative bar with themed fill and rounded corners', async () => {
    const component = await renderSkeleton({ style: { height: 16, width: 120 } });
    const colors = useFlexTokens().color;

    expect(getRoot(component).props.accessible).toBe(false);
    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: colors.backgroundNeutralSubtle,
      borderRadius: 4,
      height: 16,
      overflow: 'hidden',
      position: 'relative',
      width: 120,
    });
  });

  it('forwards user layout handlers while preserving the wave animation', async () => {
    const onLayout = jest.fn();
    const component = await renderSkeleton({ onLayout, style: { height: 16, width: 120 } });
    const root = getRoot(component);

    await act(async () => {
      await fireEvent(root, 'layout', { nativeEvent: { layout: { height: 16, width: 120, x: 0, y: 0 } } });
    });

    expect(onLayout).toHaveBeenCalledTimes(1);
    expect(component.getByTestId('skeleton-shimmer', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('uses the user style after the component style', async () => {
    const component = await renderSkeleton({ style: { backgroundColor: 'hotpink', height: 16, width: 120 } });

    expect(getRootStyle(component).backgroundColor).toBe('hotpink');
  });

  it('hides the shimmer when reduce motion is enabled', async () => {
    let resolveReducedMotion!: (value: boolean) => void;
    reduceMotionSpy.mockReturnValue(
      new Promise<boolean>((resolve) => {
        resolveReducedMotion = resolve;
      }),
    );
    const component = await renderSkeleton({ style: { height: 16, width: 120 } });
    const root = getRoot(component);

    await act(async () => {
      await fireEvent(root, 'layout', { nativeEvent: { layout: { height: 16, width: 120, x: 0, y: 0 } } });
    });

    expect(component.getByTestId('skeleton-shimmer', { includeHiddenElements: true })).toBeOnTheScreen();

    await act(async () => {
      resolveReducedMotion(true);
    });

    expect(component.queryByTestId('skeleton-shimmer', { includeHiddenElements: true })).toBeNull();
  });
});
