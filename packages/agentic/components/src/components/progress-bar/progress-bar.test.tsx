/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { ProgressBar } from './progress-bar';

async function renderProgressBar(props: React.ComponentProps<typeof ProgressBar>) {
  return render(<ProgressBar {...props} />);
}

type RenderResult = Awaited<ReturnType<typeof renderProgressBar>>;

function getRoot(component: RenderResult) {
  return component.getByRole('progressbar');
}

function getTrack(component: RenderResult) {
  return component.getByTestId('progress-bar-track');
}

function getIndicatorStyle(component: RenderResult) {
  return StyleSheet.flatten(component.getByTestId('progress-bar-indicator').props.style);
}

describe('ProgressBar', () => {
  it('renders the default label, value text, and determinate accessibility state', async () => {
    const component = await renderProgressBar({});
    const root = getRoot(component);

    expect(root.props.accessibilityRole).toBe('progressbar');
    expect(root.props.accessibilityState).toEqual({});
    expect(component.getByText('Label')).toBeOnTheScreen();
    expect(component.getByText('0%')).toBeOnTheScreen();
    expect(root.props.accessibilityValue).toMatchObject({ max: 100, min: 0, now: 0 });
  });

  it('resolves the determinate indicator width from progress and preserves user styles last', async () => {
    const component = await renderProgressBar({
      progress: 50,
      style: { backgroundColor: 'hotpink' },
      valueText: 'Halfway there',
    });

    await fireEvent(getTrack(component), 'layout', {
      nativeEvent: { layout: { height: 4, width: 200, x: 0, y: 0 } },
    });

    expect(getIndicatorStyle(component)).toMatchObject({
      backgroundColor: defaultFlexTokens.color.foregroundBrandPrimary,
      width: 100,
    });
    expect(StyleSheet.flatten(getRoot(component).props.style)).toMatchObject({ backgroundColor: 'hotpink' });
    expect(component.getByText('Halfway there')).toBeOnTheScreen();
  });

  it('allows determinate progress to decrease', async () => {
    const component = await renderProgressBar({ progress: 80 });

    await fireEvent(getTrack(component), 'layout', {
      nativeEvent: { layout: { height: 4, width: 200, x: 0, y: 0 } },
    });
    expect(getIndicatorStyle(component).width).toBe(160);

    await component.rerender(<ProgressBar progress={25} />);
    expect(getIndicatorStyle(component).width).toBe(50);
    expect(getRoot(component).props.accessibilityValue.now).toBe(25);
  });

  it('separates header content and omits an empty trailing group', async () => {
    const component = await renderProgressBar({
      showValidationIcon: true,
      showValueText: false,
      status: 'neutral',
    });

    expect(StyleSheet.flatten(component.getByTestId('progress-bar-header').props.style)).toMatchObject({
      justifyContent: 'space-between',
    });
    expect(StyleSheet.flatten(component.getByText('Label').props.style)).toMatchObject({ flexGrow: 1 });
    expect(component.queryByTestId('progress-bar-trailing')).toBeNull();
  });

  it('shows a custom validation icon and error text when status is error', async () => {
    const component = await renderProgressBar({
      label: 'Uploading',
      progress: 80,
      showValidationIcon: true,
      status: 'error',
      validationIcon: {
        fontSource: { codepoint: 0x2716, fontFamily: 'Arial' },
        testID: 'progress-bar-error-icon',
      },
      valueText: 'Upload failed',
    });

    expect(component.getByTestId('progress-bar-error-icon')).toBeOnTheScreen();
    expect(component.getByText('Upload failed')).toBeOnTheScreen();
    expect(getRoot(component).props.accessibilityValue).toMatchObject({ now: 80, text: 'Upload failed' });
    expect(getRoot(component).props.accessibilityState).toEqual({});
  });

  it('renders indeterminate semantics without an aria-valuenow and marks the bar busy', async () => {
    const component = await renderProgressBar({
      label: 'Uploading',
      status: 'neutral',
      type: 'indeterminate',
    });

    expect(getRoot(component).props.accessibilityState).toMatchObject({ busy: true });
    expect(getRoot(component).props.accessibilityValue).toBeUndefined();
    expect(component.getByText('Working…')).toBeOnTheScreen();
  });

  it('renders a static bar without animation-specific motion state', async () => {
    const component = await renderProgressBar({
      label: 'Storage',
      progress: 72,
      type: 'static',
      valueText: '240 GB of 500 GB used',
    });

    await fireEvent(getTrack(component), 'layout', {
      nativeEvent: { layout: { height: 4, width: 250, x: 0, y: 0 } },
    });

    expect(getIndicatorStyle(component)).toMatchObject({ width: 180 });
    expect(component.getByText('240 GB of 500 GB used')).toBeOnTheScreen();
  });

  it('keeps label text accessible through labelledBy and wraps constrained content', async () => {
    const component = await renderProgressBar({
      label: 'Uploading photos from yesterday and today',
      progress: 12,
      style: { width: 160 },
    });

    expect(getRoot(component).props.accessibilityLabelledBy).toBeDefined();
    expect(StyleSheet.flatten(component.getByText('Uploading photos from yesterday and today').props.style)).toMatchObject({
      flexShrink: 1,
      minWidth: 0,
    });
  });
});
