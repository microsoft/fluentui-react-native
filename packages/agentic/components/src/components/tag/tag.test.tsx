/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { Tag } from './tag';

function renderTag(props: React.ComponentProps<typeof Tag>): Promise<RenderResult> {
  return render(<Tag {...props} />);
}

function getRoot(component: RenderResult) {
  return component.getByRole('button');
}

function getRootStyle(component: RenderResult): ViewStyle {
  return StyleSheet.flatten(getRoot(component).props.style);
}

describe('Tag', () => {
  it('TAG-004 leaves removal to the caller after repeated whole-tag activation', async () => {
    const onPress = jest.fn();
    const component = await renderTag({ content: 'Engineering', onPress });

    await fireEvent.press(getRoot(component));
    await fireEvent.press(getRoot(component));

    expect(onPress).toHaveBeenCalledTimes(2);
    expect(component.getByText('Engineering')).toBeOnTheScreen();
    expect(component.getAllByRole('button')).toHaveLength(1);
    await component.rerender(<></>);
    expect(component.queryByRole('button')).toBeNull();
  });

  it.each(['dismiss=false', 'dismissIcon=null'] as const)(
    'TAG-002 TAG-004 %s suppresses only the glyph, not whole-tag activation',
    async (suppression) => {
      const onPress = jest.fn();
      const component = await renderTag({
        content: { children: 'Engineering', testID: 'tag-spec-content' },
        dismiss: suppression !== 'dismiss=false',
        dismissIcon:
          suppression === 'dismissIcon=null'
            ? null
            : { fontSource: { codepoint: 0x2715, fontFamily: 'Arial' }, testID: 'tag-spec-dismiss' },
        onPress,
      });

      expect(getRoot(component).children).toHaveLength(1);
      expect(getRoot(component).children[0]).toBe(component.getByTestId('tag-spec-content'));
      expect(component.queryByTestId('tag-spec-dismiss')).toBeNull();
      await fireEvent.press(getRoot(component));
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(component.getByText('Engineering')).toBeOnTheScreen();
    },
  );

  it('TAG-003 TAG-004 orders decorative leading and dismiss icons around the label in one target', async () => {
    const component = await renderTag({
      content: { children: 'Engineering', testID: 'tag-spec-content' },
      dismissIcon: { fontSource: { codepoint: 0x2715, fontFamily: 'Arial' }, testID: 'tag-spec-dismiss' },
      leadingIcon: { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' }, testID: 'tag-spec-leading' },
    });

    expect(getRoot(component).children).toEqual([
      component.getByTestId('tag-spec-leading'),
      component.getByTestId('tag-spec-content'),
      component.getByTestId('tag-spec-dismiss'),
    ]);
    expect(component.getAllByRole('button')).toHaveLength(1);
    for (const id of ['tag-spec-leading', 'tag-spec-dismiss']) {
      expect(component.getByTestId(id).props.accessible).toBe(false);
    }
  });

  it('TAG-002 explicitly null content suppresses the placeholder while retaining the default dismiss glyph', async () => {
    const component = await renderTag({ accessibilityLabel: 'Remove filter', content: null });
    expect(component.queryByText('Tag text')).toBeNull();
    expect(getRoot(component).children).toHaveLength(1);
    expect(getRoot(component).props.accessibilityLabel).toBe('Remove filter');
  });

  it.each([false, true])('TAG-008 owned disabled=%s overrides contradictory caller state while preserving busy', async (disabled) => {
    const component = await renderTag({
      accessibilityState: { busy: true, disabled: !disabled },
      content: 'Engineering',
      disabled,
    });

    expect(getRoot(component).props.accessibilityState).toMatchObject({ busy: true, disabled });
    expect(getRoot(component).props.focusable).toBe(!disabled);
  });

  it('renders default dismissible tag accessibility and styling', async () => {
    const component = await renderTag({ content: 'Engineering' });

    expect(getRoot(component).props.accessibilityRole).toBe('button');
    expect(getRoot(component).props.accessibilityState).toEqual({ disabled: false });
    expect(component.getByText('Engineering')).toBeOnTheScreen();
    expect(getRootStyle(component)).toMatchObject({
      alignItems: 'center',
      backgroundColor: '#fafafa',
      minHeight: 24,
      minWidth: 24,
    });
    expect(getRoot(component).children).toHaveLength(2);
  });

  it('forwards press and interaction handlers while updating background state', async () => {
    const onHoverIn = jest.fn();
    const onPress = jest.fn();
    const component = await renderTag({ content: 'Engineering', onHoverIn, onPress });
    const root = getRoot(component);
    const restBackground = getRootStyle(component).backgroundColor;

    await fireEvent(root, 'hoverIn', {});
    expect(onHoverIn).toHaveBeenCalledTimes(1);
    expect(getRootStyle(component).backgroundColor).not.toBe(restBackground);

    await fireEvent(root, 'pressIn', {});
    expect(onPress).not.toHaveBeenCalled();
    await fireEvent.press(root);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disables interaction and exposes disabled accessibility state', async () => {
    const onPress = jest.fn();
    const component = await renderTag({ content: 'Unavailable', disabled: true, onPress });
    const root = getRoot(component);

    expect(root).toBeDisabled();
    expect(root.props.focusable).toBe(false);
    expect(root.props.accessibilityState).toEqual({ disabled: true });
    expect(getRootStyle(component).backgroundColor).toBe('#f0f0f0');
    await fireEvent.press(root);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders icon and text layout with explicit icons and dismiss styling', async () => {
    const component = await renderTag({
      content: { children: 'Engineering', testID: 'content' },
      dismissIcon: { fontSource: { codepoint: 0x2715, fontFamily: 'Arial' }, testID: 'dismiss' },
      leadingIcon: { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' }, testID: 'leading' },
    });

    expect(StyleSheet.flatten(component.getByTestId('leading').props.style)).toMatchObject({ height: 20, width: 20 });
    expect(StyleSheet.flatten(component.getByTestId('dismiss').props.style)).toMatchObject({ height: 16, width: 16 });
    expect(getRoot(component).children).toHaveLength(3);
  });

  it('renders icon-only layout with a required accessible label', async () => {
    const component = await renderTag({
      accessibilityLabel: 'Remove engineering filter',
      dismissIcon: { fontSource: { codepoint: 0x2715, fontFamily: 'Arial' }, testID: 'dismiss' },
      layout: 'iconOnly',
      leadingIcon: { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' }, testID: 'leading' },
      size: 'small',
    });

    expect(getRoot(component).props.accessibilityLabel).toBe('Remove engineering filter');
    expect(component.queryByText('Tag text')).toBeNull();
    expect(getRootStyle(component)).toMatchObject({
      borderRadius: 9999,
      paddingHorizontal: 4,
      paddingVertical: 4,
    });
    expect(StyleSheet.flatten(component.getByTestId('leading').props.style)).toMatchObject({ height: 16, width: 16 });
    expect(StyleSheet.flatten(component.getByTestId('dismiss').props.style)).toMatchObject({ height: 12, width: 12 });
  });

  it('warns when an icon-only tag has no accessible name', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    await renderTag({
      layout: 'iconOnly',
      leadingIcon: { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' } },
    });

    expect(warn).toHaveBeenCalledWith('Tag: icon-only tags require an accessibilityLabel that describes the tag.');
    warn.mockRestore();
  });

  it('keeps foreground color stable while hover and pressed change background color', async () => {
    const tokens = defaultFlexTokens;
    const component = await renderTag({ appearance: 'primary', content: 'Engineering' });
    const root = getRoot(component);
    const text = component.getByText('Engineering');
    const restForeground = StyleSheet.flatten(text.props.style).color;

    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: tokens.color.backgroundBrandHeavy,
    });
    expect(restForeground).toBe(tokens.color.foregroundNeutralOnloud);

    await fireEvent(root, 'hoverIn', {});
    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: tokens.color.hover.backgroundBrandHeavy,
    });
    expect(StyleSheet.flatten(text.props.style).color).toBe(tokens.color.foregroundNeutralOnloud);

    await fireEvent(root, 'pressIn', {});
    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: tokens.color.pressed.backgroundBrandHeavy,
    });
    expect(StyleSheet.flatten(text.props.style).color).toBe(tokens.color.foregroundNeutralOnloud);
  });

  it('uses native focus visuals without mounting custom rings', async () => {
    const component = await renderTag({ content: 'Focused' });
    const root = getRoot(component);

    await fireEvent(root, 'focus', {});
    expect(root.props.enableFocusRing).toBe(true);

    expect(component.queryByTestId('focus-visual', { includeHiddenElements: true })).toBeNull();
  });

  it.each([
    ['primary', '#185abd'],
    ['secondary', '#fafafa'],
  ] as const)('resolves the %s appearance', async (appearance, backgroundColor) => {
    const component = await renderTag({ appearance, content: appearance });
    expect(getRootStyle(component).backgroundColor).toBe(backgroundColor);
  });

  it.each([
    ['small', 12, 16, 12],
    ['medium', 14, 20, 16],
  ] as const)('resolves the %s size', async (size, fontSize, leadingSize, dismissSize) => {
    const component = await renderTag({
      content: size,
      dismissIcon: { fontSource: { codepoint: 0x2715, fontFamily: 'Arial' }, testID: 'dismiss' },
      leadingIcon: { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' }, testID: 'leading' },
      size,
    });

    expect(StyleSheet.flatten(component.getByText(size).props.style)).toMatchObject({
      fontFamily: expect.any(String),
      fontSize,
    });
    expect(StyleSheet.flatten(component.getByTestId('leading').props.style)).toMatchObject({ height: leadingSize, width: leadingSize });
    expect(StyleSheet.flatten(component.getByTestId('dismiss').props.style)).toMatchObject({ height: dismissSize, width: dismissSize });
  });

  it.each([
    ['rounded', 4],
    ['circular', 9999],
  ] as const)('resolves the %s shape', async (shape, borderRadius) => {
    const component = await renderTag({ content: shape, shape });
    expect(getRootStyle(component).borderRadius).toBe(borderRadius);
  });

  it('keeps small icon-and-text spacing independent of circular shape', async () => {
    const tokens = defaultFlexTokens;
    const component = await renderTag({
      content: 'Small',
      leadingIcon: { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' } },
      shape: 'circular',
      size: 'small',
    });

    expect(getRootStyle(component)).toMatchObject({
      gap: tokens.spacing.componentBase50,
      paddingHorizontal: tokens.spacing.componentBase200,
      paddingVertical: tokens.spacing.componentBase100,
    });
  });

  it('renders a dismiss toggle and preserves user styles last', async () => {
    const style: ViewStyle = { backgroundColor: 'hotpink' };
    const component = await renderTag({
      content: { children: 'Tag text', testID: 'content' },
      dismiss: false,
      leadingIcon: { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' }, testID: 'leading' },
      style,
    });

    expect(component.queryByTestId('dismiss')).toBeNull();
    expect(getRootStyle(component).backgroundColor).toBe('hotpink');
    expect(getRoot(component).children).toHaveLength(2);
  });
});
