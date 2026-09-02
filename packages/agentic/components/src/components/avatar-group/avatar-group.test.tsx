/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { render } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { Avatar } from '../avatar/avatar';
import { AvatarGroup } from './avatar-group';
import type { AvatarGroupProps, AvatarGroupSize } from './avatar-group.types';

const tokens = defaultFlexTokens;
const sizes: readonly AvatarGroupSize[] = [16, 20, 24, 28, 32, 40, 56, 120];
const spreadGaps: Record<AvatarGroupSize, unknown> = {
  16: tokens.spacing.componentBase200,
  20: tokens.spacing.componentBase250,
  24: tokens.spacing.componentBase250,
  28: tokens.spacing.componentBase250,
  32: tokens.spacing.componentBase300,
  40: tokens.spacing.componentBase300,
  56: tokens.spacing.componentBase300,
  120: tokens.spacing.componentBase500,
};
const ringWidths: Record<AvatarGroupSize, number> = {
  16: Number(tokens.strokeWidth.thin),
  20: Number(tokens.strokeWidth.thin),
  24: Number(tokens.strokeWidth.thin),
  28: Number(tokens.strokeWidth.thin),
  32: Number(tokens.strokeWidth.thin),
  40: Number(tokens.strokeWidth.thick),
  56: Number(tokens.strokeWidth.thicker),
  120: 4,
};
const overlaps: Record<AvatarGroupSize, number> = { 16: 4, 20: 5, 24: 6, 28: 7, 32: 8, 40: 10, 56: 14, 120: 30 };
const overflowFontSizes: Record<AvatarGroupSize, unknown> = {
  16: tokens.fontSize.functionalCaption,
  20: tokens.fontSize.functionalCaption,
  24: tokens.fontSize.functionalCaption,
  28: tokens.fontSize.functionalBodySmall,
  32: tokens.fontSize.functionalBodyMedium,
  40: tokens.fontSize.functionalBodyLarge,
  56: tokens.fontSize.functionalTitleSmall,
  120: tokens.fontSize.functionalTitleLarge,
};

function renderGroup(props: AvatarGroupProps = {}): Promise<RenderResult> {
  const { children, ...rest } = props;
  return render(
    <AvatarGroup testID="group" {...rest}>
      {children ?? [
        <Avatar key="a" accessibilityLabel="Lydia Mitchelson" initials="LM" testID="item-0" />,
        <Avatar key="b" accessibilityLabel="Ray Kohler" initials="RK" testID="item-1" />,
      ]}
    </AvatarGroup>,
  );
}

function rootStyle(component: RenderResult): ViewStyle {
  return StyleSheet.flatten(component.getByTestId('group', { includeHiddenElements: true }).props.style);
}

function itemStyle(component: RenderResult, index: number): ViewStyle {
  const avatar = component.getByTestId(`item-${index}`, { includeHiddenElements: true });
  return StyleSheet.flatten(avatar.parent?.props.style);
}

function overflowStyle(component: RenderResult): ViewStyle {
  return StyleSheet.flatten(component.getByTestId('overflow', { includeHiddenElements: true }).props.style);
}

describe('AvatarGroup', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it('lays the children out as a spread row by default', async () => {
    const component = await renderGroup();

    expect(rootStyle(component)).toMatchObject({
      alignItems: 'center',
      flexDirection: 'row',
      gap: tokens.spacing.componentBase300,
    });
    expect(component.getByText('LM', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(component.getByText('RK', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(component.queryByTestId('overflow')).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });

  it('applies the spread gap and item box for every size', async () => {
    for (const size of sizes) {
      const component = await renderGroup({ size });

      expect(rootStyle(component)).toMatchObject({ gap: spreadGaps[size] });
      expect(itemStyle(component, 0)).toMatchObject({
        backgroundColor: tokens.color.backgroundNeutralTransparent,
        borderRadius: tokens.borderRadius.circular,
        height: size,
        width: size,
      });
      expect(itemStyle(component, 0).marginStart).toBeUndefined();
      expect(itemStyle(component, 1)).toMatchObject({ marginStart: 0 });
    }
  });

  it('overlaps the items and paints a separation ring for every stacked size', async () => {
    for (const size of sizes) {
      const component = await renderGroup({ layout: 'stack', size });
      const ring = ringWidths[size];

      expect(rootStyle(component)).toMatchObject({ gap: 0 });
      expect(itemStyle(component, 0)).toMatchObject({
        backgroundColor: tokens.color.surfaceNeutralNearer,
        borderRadius: tokens.borderRadius.circular,
        height: size + ring * 2,
        width: size + ring * 2,
      });
      expect(itemStyle(component, 0).marginStart).toBeUndefined();
      expect(itemStyle(component, 1)).toMatchObject({ marginStart: -(overlaps[size] + ring * 2) });
    }
  });

  it('keeps the first item flush and renders the items in source order', async () => {
    const component = await renderGroup({ layout: 'stack' });
    const texts = component.getAllByText(/LM|RK/, { includeHiddenElements: true }).map((node) => node.props.children);

    expect(texts).toEqual(['LM', 'RK']);
    expect(itemStyle(component, 0).marginStart).toBeUndefined();
    expect(itemStyle(component, 1).marginStart).toBe(-(overlaps[40] + ringWidths[40] * 2));
  });

  it('renders the overflow indicator with the hidden count', async () => {
    const component = await renderGroup({ overflow: { testID: 'overflow' }, overflowCount: 5 });

    expect(component.getByText('+5', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(overflowStyle(component)).toMatchObject({
      backgroundColor: tokens.color.surfaceNeutralNearer,
      borderColor: tokens.color.strokeNeutralSubtle,
      borderRadius: tokens.borderRadius.circular,
      borderWidth: ringWidths[40],
      height: 40,
      width: 40,
    });
  });

  it('scales the overflow indicator across every size that renders it', async () => {
    for (const size of sizes.filter((value) => value !== 16)) {
      const component = await renderGroup({ overflow: { testID: 'overflow' }, overflowCount: 3, size });
      const textStyle: TextStyle = StyleSheet.flatten(component.getByText('+3', { includeHiddenElements: true }).props.style);

      expect(overflowStyle(component)).toMatchObject({ borderWidth: ringWidths[size], height: size, width: size });
      expect(textStyle).toMatchObject({
        color: tokens.color.foregroundNeutralPrimary,
        fontFamily: tokens.fontFamily.functional,
        fontSize: overflowFontSizes[size],
        fontWeight: tokens.fontWeight.functionalSemibold,
        lineHeight: overflowFontSizes[size],
      });
    }
  });

  it('saturates the overflow indicator at ninety nine', async () => {
    const component = await renderGroup({ overflowCount: 250 });

    expect(component.getByText('+99', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('normalizes a fractional or negative overflow count', async () => {
    expect((await renderGroup({ overflowCount: 4.7 })).getByText('+4', { includeHiddenElements: true })).toBeOnTheScreen();
    expect((await renderGroup({ overflowCount: -3 })).queryByText('+-3')).toBeNull();
  });

  it('omits the overflow indicator at size sixteen and warns', async () => {
    const component = await renderGroup({ overflowCount: 5, size: 16 });

    expect(component.queryByText('+5', { includeHiddenElements: true })).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('size 16 omits the overflow indicator'));
  });

  it('honors an explicitly hidden overflow slot', async () => {
    const component = await renderGroup({ overflow: null, overflowCount: 5 });

    expect(component.queryByText('+5', { includeHiddenElements: true })).toBeNull();
  });

  it('announces a labeled group once and hides its members', async () => {
    const component = await renderGroup({ accessibilityLabel: 'Document collaborators: 8 people', overflowCount: 6 });
    const root = component.getByTestId('group');

    expect(root.props.accessible).toBe(true);
    expect(root.props.accessibilityRole).toBe('image');
    expect(root.props.accessibilityLabel).toBe('Document collaborators: 8 people');
    expect(component.getAllByRole('image')).toHaveLength(1);
  });

  it('leaves an unlabeled group as a plain row whose members announce themselves', async () => {
    const component = await renderGroup();
    const root = component.getByTestId('group');

    expect(root.props.accessible).toBe(false);
    expect(root.props.accessibilityRole).toBe('none');
    expect(component.getAllByRole('image')).toHaveLength(2);
  });

  it('keeps the overflow indicator decorative until it is labeled', async () => {
    const decorative = await renderGroup({ overflow: { testID: 'overflow' }, overflowCount: 5 });
    expect(decorative.getByTestId('overflow', { includeHiddenElements: true }).props.accessible).toBe(false);

    const labeled = await renderGroup({ overflow: { accessibilityLabel: '5 more', testID: 'overflow' }, overflowCount: 5 });
    const chip = labeled.getByTestId('overflow');
    expect(chip.props.accessible).toBe(true);
    expect(chip.props.accessibilityRole).toBe('image');
    expect(chip.props.accessibilityLabel).toBe('5 more');
  });

  it('honors an explicit accessible value and role', async () => {
    const component = await renderGroup({ accessibilityRole: 'summary', accessible: true });
    const root = component.getByTestId('group');

    expect(root.props.accessible).toBe(true);
    expect(root.props.accessibilityRole).toBe('summary');
  });

  it('forwards root view props and keeps user styles last', async () => {
    const component = await renderGroup({
      accessibilityHint: 'Everyone on this thread',
      accessibilityLabel: 'Thread participants',
      nativeID: 'participants',
      style: { flexDirection: 'column' },
    });
    const root = component.getByTestId('group');

    expect(root.props.accessibilityHint).toBe('Everyone on this thread');
    expect(root.props.nativeID).toBe('participants');
    expect(rootStyle(component).flexDirection).toBe('column');
  });

  it('adds no interaction handlers of its own', async () => {
    const root = (await renderGroup()).getByTestId('group');

    expect(root.props.onStartShouldSetResponder).toBeUndefined();
    expect(root.props.focusable).toBeUndefined();
  });

  it('warns when a child avatar size disagrees with the group', async () => {
    await renderGroup({
      children: [
        <Avatar key="a" accessibilityLabel="Lydia" initials="LM" size={32} testID="item-0" />,
        <Avatar key="b" accessibilityLabel="Ray" initials="RK" size={56} testID="item-1" />,
      ],
      size: 32,
    });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('same size as the group'));
  });

  it('accepts a matching child avatar size without warning', async () => {
    await renderGroup({
      children: [
        <Avatar key="a" accessibilityLabel="Lydia" initials="LM" size={32} testID="item-0" />,
        <Avatar key="b" accessibilityLabel="Ray" initials="RK" size={32} testID="item-1" />,
      ],
      size: 32,
    });

    expect(warn).not.toHaveBeenCalled();
  });

  it('warns when more than five items render', async () => {
    await renderGroup({
      children: Array.from({ length: 5 }, (_unused, index) => (
        <Avatar key={index} accessibilityLabel={`Member ${index}`} initials="LM" testID={`item-${index}`} />
      )),
      overflowCount: 4,
    });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('render at most 5 items'));
  });

  it('renders an overflow only group without a leading offset', async () => {
    const component = await render(<AvatarGroup layout="stack" overflow={{ testID: 'overflow' }} overflowCount={2} testID="group" />);

    expect(component.getByText('+2', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(
      StyleSheet.flatten(component.getByTestId('overflow', { includeHiddenElements: true }).parent?.props.style).marginStart,
    ).toBeUndefined();
  });
});
