/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';
import type { TextStyle, View, ViewStyle } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { InteractionTag } from './interaction-tag';

const dismissProps = { accessibilityLabel: 'Remove tag', testID: 'dismiss-action' } as const;
const leadingIcon = { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' }, testID: 'leading' } as const;
const dismissIcon = { fontSource: { codepoint: 0x2715, fontFamily: 'Arial' }, testID: 'dismiss-icon' } as const;

function renderInteractionTag(props: React.ComponentProps<typeof InteractionTag> = {}): Promise<RenderResult> {
  return render(<InteractionTag dismiss={dismissProps} testID="root" {...props} />);
}

function getPrimary(component: RenderResult) {
  return component.getByTestId('primary-action');
}

function getDismiss(component: RenderResult) {
  return component.getByTestId('dismiss-action');
}

function flatten(node: { props: { style?: unknown } }): ViewStyle & TextStyle {
  return StyleSheet.flatten(node.props.style as ViewStyle & TextStyle);
}

const withPrimaryTestId = { primaryAction: { testID: 'primary-action' } } as const;

function getHidden(component: RenderResult, testID: string) {
  return component.getByTestId(testID, { includeHiddenElements: true });
}

describe('InteractionTag', () => {
  it('renders a container holding two sibling button regions separated by a divider', async () => {
    const component = await renderInteractionTag({ ...withPrimaryTestId, content: 'Engineering' });
    const root = component.getByTestId('root');

    expect(root.props.role).toBeUndefined();
    expect(root.children).toHaveLength(3);
    expect(getPrimary(component).props.role).toBe('button');
    expect(getDismiss(component).props.role).toBe('button');
    expect(component.getByText('Engineering')).toBeOnTheScreen();
    expect(flatten(root)).toMatchObject({ alignItems: 'stretch', flexDirection: 'row', minHeight: 24 });
    expect(flatten(root).backgroundColor).toBeUndefined();
  });

  it('renders the primary action, the divider, and the dismiss action in order', async () => {
    const component = await renderInteractionTag({ ...withPrimaryTestId, content: 'Engineering', leadingIcon });
    const [primary, divider, dismiss] = component.getByTestId('root').children as ReturnType<RenderResult['getByTestId']>[];

    expect(primary.props.testID).toBe('primary-action');
    expect(divider.props.accessible).toBe(false);
    expect(divider.props.pointerEvents).toBe('none');
    expect(dismiss.props.testID).toBe('dismiss-action');
    expect(primary.children).toHaveLength(3);
    expect(dismiss.children).toHaveLength(2);
  });

  it('fires each region handler independently without crossing over', async () => {
    const onPrimaryPress = jest.fn();
    const onDismissPress = jest.fn();
    const component = await renderInteractionTag({
      content: 'Engineering',
      dismiss: { ...dismissProps, onPress: onDismissPress },
      primaryAction: { onPress: onPrimaryPress, testID: 'primary-action' },
    });

    await fireEvent.press(getDismiss(component));
    expect(onDismissPress).toHaveBeenCalledTimes(1);
    expect(onPrimaryPress).not.toHaveBeenCalled();

    await fireEvent.press(getPrimary(component));
    expect(onPrimaryPress).toHaveBeenCalledTimes(1);
    expect(onDismissPress).toHaveBeenCalledTimes(1);
  });

  it('keeps hover and pressed backgrounds isolated to the region being interacted with', async () => {
    const component = await renderInteractionTag({ ...withPrimaryTestId, content: 'Engineering' });
    const restBackground = flatten(getPrimary(component)).backgroundColor;

    expect(flatten(getDismiss(component)).backgroundColor).toBe(restBackground);

    await fireEvent(getDismiss(component), 'hoverIn', {});
    expect(flatten(getDismiss(component)).backgroundColor).not.toBe(restBackground);
    expect(flatten(getPrimary(component)).backgroundColor).toBe(restBackground);

    await fireEvent(getPrimary(component), 'pressIn', {});
    expect(flatten(getPrimary(component)).backgroundColor).toBe(defaultFlexTokens.color.pressed.backgroundNeutralSubtle);
  });

  it('keeps the foreground stable across hover and pressed', async () => {
    const component = await renderInteractionTag({ ...withPrimaryTestId, appearance: 'primary', content: 'Engineering' });
    const text = component.getByText('Engineering');

    expect(flatten(text).color).toBe(defaultFlexTokens.color.foregroundNeutralOnloud);
    expect(flatten(getPrimary(component)).backgroundColor).toBe(defaultFlexTokens.color.backgroundBrandHeavy);

    await fireEvent(getPrimary(component), 'hoverIn', {});
    expect(flatten(getPrimary(component)).backgroundColor).toBe(defaultFlexTokens.color.hover.backgroundBrandHeavy);
    expect(flatten(text).color).toBe(defaultFlexTokens.color.foregroundNeutralOnloud);
  });

  it('disables both regions together', async () => {
    const onPrimaryPress = jest.fn();
    const onDismissPress = jest.fn();
    const component = await renderInteractionTag({
      content: 'Unavailable',
      disabled: true,
      dismiss: { ...dismissProps, onPress: onDismissPress },
      primaryAction: { onPress: onPrimaryPress, testID: 'primary-action' },
    });

    for (const region of [getPrimary(component), getDismiss(component)]) {
      expect(region).toBeDisabled();
      expect(region.props.focusable).toBe(false);
      expect(region.props.accessibilityState).toEqual({ disabled: true });
      expect(flatten(region).backgroundColor).toBe(defaultFlexTokens.color.backgroundNeutralSubtleDisabled);
    }

    await fireEvent.press(getPrimary(component));
    await fireEvent.press(getDismiss(component));
    expect(onPrimaryPress).not.toHaveBeenCalled();
    expect(onDismissPress).not.toHaveBeenCalled();
  });

  it('keeps disabled regions out of the tab order when slot props request focusability', async () => {
    const component = await renderInteractionTag({
      content: 'Unavailable',
      disabled: true,
      dismiss: { ...dismissProps, focusable: true },
      primaryAction: { focusable: true, testID: 'primary-action' },
    });

    expect(getPrimary(component).props.focusable).toBe(false);
    expect(getDismiss(component).props.focusable).toBe(false);
  });

  it('disables the native focus ring for both custom focus-visual regions', async () => {
    const component = await renderInteractionTag({ ...withPrimaryTestId, content: 'Engineering' });

    expect(getPrimary(component).props.enableFocusRing).toBe(false);
    expect(getDismiss(component).props.enableFocusRing).toBe(false);
  });

  it('merges caller accessibility state under the resolved disabled state', async () => {
    const component = await renderInteractionTag({
      content: 'Engineering',
      primaryAction: { accessibilityState: { busy: true }, testID: 'primary-action' },
    });

    expect(getPrimary(component).props.accessibilityState).toEqual({ busy: true, disabled: false });
  });

  it('prefers the avatar and warns when both leading slots are supplied', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const component = await renderInteractionTag({
      ...withPrimaryTestId,
      avatar: { initials: 'CE', testID: 'avatar' },
      content: 'Cameron Evans',
      leadingIcon,
    } as React.ComponentProps<typeof InteractionTag>);

    expect(getHidden(component, 'avatar')).toBeOnTheScreen();
    expect(component.queryByTestId('leading', { includeHiddenElements: true })).toBeNull();
    expect(warn).toHaveBeenCalledWith('InteractionTag: provide a leading icon or an avatar, not both. The avatar is used.');
    warn.mockRestore();
  });

  it('hides the avatar and both glyphs from the accessibility tree', async () => {
    const component = await renderInteractionTag({
      ...withPrimaryTestId,
      avatar: { initials: 'CE', testID: 'avatar' },
      content: 'Cameron Evans',
      dismissIcon,
    });

    expect(getHidden(component, 'avatar').props.accessible).toBe(false);
    expect(getHidden(component, 'avatar').props.importantForAccessibility).toBe('no-hide-descendants');
    expect(getHidden(component, 'dismiss-icon').props.accessible).toBe(false);
  });

  it('renders the default content and suppresses it in the icon-only layout', async () => {
    const withText = await renderInteractionTag({ ...withPrimaryTestId });
    expect(withText.getByText('Tag text')).toBeOnTheScreen();

    const iconOnly = await renderInteractionTag({
      layout: 'iconOnly',
      leadingIcon,
      primaryAction: { accessibilityLabel: 'Open Engineering', testID: 'primary-action' },
    });
    expect(iconOnly.queryByText('Tag text')).toBeNull();
    expect(getPrimary(iconOnly).props.accessibilityLabel).toBe('Open Engineering');
  });

  it('forces the circular radius for the icon-only layout regardless of shape', async () => {
    const component = await renderInteractionTag({
      layout: 'iconOnly',
      leadingIcon,
      primaryAction: { accessibilityLabel: 'Open Engineering', testID: 'primary-action' },
      shape: 'rounded',
    });

    expect(flatten(component.getByTestId('root')).borderRadius).toBe(defaultFlexTokens.borderRadius.circular);
    expect(flatten(getPrimary(component))).toMatchObject({
      borderEndEndRadius: 0,
      borderEndStartRadius: defaultFlexTokens.borderRadius.circular,
      borderStartEndRadius: 0,
      borderStartStartRadius: defaultFlexTokens.borderRadius.circular,
    });
  });

  it('rounds only the outer edge of each region', async () => {
    const component = await renderInteractionTag({ ...withPrimaryTestId, content: 'Engineering' });
    const radius = defaultFlexTokens.borderRadius.base300;

    expect(flatten(component.getByTestId('root')).borderRadius).toBe(radius);
    expect(flatten(getPrimary(component))).toMatchObject({
      borderEndEndRadius: 0,
      borderEndStartRadius: radius,
      borderStartEndRadius: 0,
      borderStartStartRadius: radius,
    });
    expect(flatten(getDismiss(component))).toMatchObject({
      borderEndEndRadius: radius,
      borderEndStartRadius: 0,
      borderStartEndRadius: radius,
      borderStartStartRadius: 0,
    });
  });

  it('draws a hairline divider whose color follows appearance and disabled', async () => {
    const secondary = await renderInteractionTag({ ...withPrimaryTestId, content: 'Engineering' });
    const dividerOf = (component: RenderResult) => flatten(component.getByTestId('root').children[1] as never);

    expect(dividerOf(secondary)).toMatchObject({
      alignSelf: 'stretch',
      backgroundColor: defaultFlexTokens.color.strokeNeutralSubtle,
      width: defaultFlexTokens.strokeWidth.thin,
    });

    const primary = await renderInteractionTag({ ...withPrimaryTestId, appearance: 'primary', content: 'Engineering' });
    expect(dividerOf(primary).backgroundColor).toBe(defaultFlexTokens.color.strokeNeutralOnloud);

    const disabled = await renderInteractionTag({ ...withPrimaryTestId, content: 'Engineering', disabled: true });
    expect(dividerOf(disabled).backgroundColor).toBe(defaultFlexTokens.color.strokeNeutralDisabled);
  });

  it('shows one focus visual per focused region', async () => {
    const component = await renderInteractionTag({ ...withPrimaryTestId, content: 'Engineering' });
    const ringStyle = (testID: string) => flatten(component.getByTestId(testID, { includeHiddenElements: true }));

    expect(ringStyle('focus-visual-primary-action').opacity).toBe(0);
    expect(ringStyle('focus-visual-dismiss').opacity).toBe(0);

    await fireEvent(getDismiss(component), 'focus', {});
    expect(ringStyle('focus-visual-dismiss')).toMatchObject({
      borderColor: defaultFlexTokens.color.strokeFocusOuter,
      borderEndEndRadius: defaultFlexTokens.borderRadius.base300,
      borderStartStartRadius: 0,
      borderWidth: defaultFlexTokens.strokeWidth.thick,
    });
    expect(ringStyle('focus-visual-dismiss')).not.toHaveProperty('opacity');
    expect(ringStyle('focus-visual-primary-action').opacity).toBe(0);
    expect(ringStyle('focus-visual-dismiss-inner')).toMatchObject({
      borderColor: defaultFlexTokens.color.strokeFocusInner,
      borderWidth: defaultFlexTokens.strokeWidth.thin,
    });
  });

  it('hides both focus visuals while disabled', async () => {
    const component = await renderInteractionTag({ ...withPrimaryTestId, content: 'Engineering', disabled: true });

    await fireEvent(getPrimary(component), 'focus', {});
    expect(flatten(component.getByTestId('focus-visual-primary-action', { includeHiddenElements: true })).opacity).toBe(0);
  });

  it('warns when the required accessible names are missing', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    await render(<InteractionTag layout="iconOnly" leadingIcon={leadingIcon} />);

    expect(warn).toHaveBeenCalledWith('InteractionTag: icon-only tags require an accessibilityLabel on the primaryAction slot.');
    expect(warn).toHaveBeenCalledWith('InteractionTag: the dismiss slot requires an accessibilityLabel that names the tag it removes.');
    warn.mockRestore();
  });

  it('warns when an icon-only tag has no leading content', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    await renderInteractionTag({ layout: 'iconOnly', primaryAction: { accessibilityLabel: 'Open Engineering' } });

    expect(warn).toHaveBeenCalledWith('InteractionTag: icon-only tags require a leading icon or an avatar.');
    warn.mockRestore();
  });

  it.each([
    ['primary', defaultFlexTokens.color.backgroundBrandHeavy],
    ['secondary', defaultFlexTokens.color.backgroundNeutralSubtle],
  ] as const)('resolves the %s appearance on both regions', async (appearance, backgroundColor) => {
    const component = await renderInteractionTag({ ...withPrimaryTestId, appearance, content: appearance });

    expect(flatten(getPrimary(component)).backgroundColor).toBe(backgroundColor);
    expect(flatten(getDismiss(component)).backgroundColor).toBe(backgroundColor);
  });

  it.each([
    ['small', 12, 16, 12, 6, 4],
    ['medium', 14, 20, 16, 8, 6],
  ] as const)('resolves the %s size', async (size, fontSize, leadingSize, dismissSize, paddingHorizontal, paddingVertical) => {
    const component = await renderInteractionTag({
      ...withPrimaryTestId,
      content: size,
      dismissIcon,
      leadingIcon,
      size,
    });

    expect(flatten(component.getByText(size)).fontSize).toBe(fontSize);
    expect(flatten(component.getByTestId('leading'))).toMatchObject({ height: leadingSize, width: leadingSize });
    expect(flatten(component.getByTestId('dismiss-icon'))).toMatchObject({ height: dismissSize, width: dismissSize });
    expect(flatten(getDismiss(component))).toMatchObject({ minHeight: 24, minWidth: 24, paddingHorizontal, paddingVertical });
  });

  it.each([
    ['small', 16],
    ['medium', 20],
  ] as const)('sizes the avatar for the %s size', async (size, avatarSize) => {
    const component = await renderInteractionTag({
      ...withPrimaryTestId,
      avatar: { initials: 'CE', testID: 'avatar' },
      content: 'Cameron Evans',
      size,
    });

    expect(flatten(getHidden(component, 'avatar'))).toMatchObject({ height: avatarSize, width: avatarSize });
  });

  it.each([
    ['rounded', defaultFlexTokens.borderRadius.base300],
    ['circular', defaultFlexTokens.borderRadius.circular],
  ] as const)('resolves the %s shape', async (shape, borderRadius) => {
    const component = await renderInteractionTag({ ...withPrimaryTestId, content: shape, shape });

    expect(flatten(component.getByTestId('root')).borderRadius).toBe(borderRadius);
  });

  it('applies the user style last on the container', async () => {
    const component = await renderInteractionTag({ ...withPrimaryTestId, content: 'Engineering', style: { minHeight: 48 } });

    expect(flatten(component.getByTestId('root')).minHeight).toBe(48);
  });

  it('forwards refs to the container and to each action region', async () => {
    const root = { current: null } as React.RefObject<View | null>;
    const primary = { current: null } as React.RefObject<View | null>;
    const dismiss = { current: null } as React.RefObject<View | null>;

    await render(
      <InteractionTag
        content="Engineering"
        dismiss={{ ...dismissProps, ref: dismiss }}
        primaryAction={{ ref: primary, testID: 'primary-action' }}
        ref={root}
      />,
    );

    expect(root.current).not.toBeNull();
    expect(primary.current).not.toBeNull();
    expect(dismiss.current).not.toBeNull();
  });
});
