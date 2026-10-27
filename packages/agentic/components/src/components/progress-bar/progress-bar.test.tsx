/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';

import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';

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
  it.each(['determinate', 'static'] as const)(
    'PGB-001/PGB-004/PGB-006 clamps %s values and recomputes width after track resize',
    async (type) => {
      for (const [progress, resolved] of [
        [-20, 0],
        [140, 100],
        [NaN, 0],
        [25.5, 25.5],
      ]) {
        const component = await renderProgressBar({ progress, type });
        expect(getIndicatorStyle(component).width).toBe(0);
        expect(getRoot(component).props.accessibilityValue).toMatchObject({ min: 0, max: 100, now: resolved });
        expect(component.getByText(`${resolved}%`)).toBeOnTheScreen();

        for (const width of [100, 240]) {
          await fireEvent(getTrack(component), 'layout', {
            nativeEvent: { layout: { height: 4, width, x: 0, y: 0 } },
          });
          expect(getIndicatorStyle(component).width).toBeCloseTo((width * resolved) / 100);
        }
        await component.unmount();
      }
    },
  );

  it.each(['determinate', 'indeterminate', 'static'] as const)(
    'PGB-003 gives status and explicit text precedence over %s type text',
    async (type) => {
      for (const [status, text] of [
        ['error', 'Progress failed'],
        ['success', 'Complete'],
      ] as const) {
        const component = await renderProgressBar({ progress: 42, status, type });
        expect(component.getByText(text)).toBeOnTheScreen();

        await component.rerender(<ProgressBar progress={42} status={status} type={type} valueText="Caller text" />);
        expect(component.getByText('Caller text')).toBeOnTheScreen();
        expect(component.queryByText(text)).toBeNull();
        if (type !== 'indeterminate') {
          expect(getRoot(component).props.accessibilityValue.text).toBe('Caller text');
        }
        await component.unmount();
      }
    },
  );

  it.each([{ accessibilityLabelledBy: 'external-label' }, { accessibilityLabelledBy: ['external-label', 'description'] }])(
    'PGB-006 appends a stable visible-label identifier to caller references %j',
    async ({ accessibilityLabelledBy }) => {
      const original = Array.isArray(accessibilityLabelledBy) ? [...accessibilityLabelledBy] : accessibilityLabelledBy;
      const component = await renderProgressBar({ accessibilityLabelledBy, label: 'Upload', progress: 10 });
      const labelId = component.getByText('Upload').props.nativeID;
      const expected = [...(Array.isArray(original) ? original : [original]), labelId];

      expect(typeof labelId).toBe('string');
      expect(labelId.length).toBeGreaterThan(0);
      expect(getRoot(component).props.accessibilityLabelledBy).toEqual(expected);
      expect(accessibilityLabelledBy).toEqual(original);
      await component.rerender(<ProgressBar accessibilityLabelledBy={accessibilityLabelledBy} label="Upload" progress={80} />);
      expect(component.getByText('Upload').props.nativeID).toBe(labelId);
      expect(getRoot(component).props.accessibilityLabelledBy).toEqual(expected);
    },
  );

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

    expect(getIndicatorStyle(component)).toMatchObject({ backgroundColor: '#185abd', width: 100 });
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
