/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, Text as NativeText, View } from 'react-native';
import type { TextProps } from 'react-native';

import { render } from '../../common/renderWithTheme';

import { directComponent } from '@fluentui-react-native/framework-base';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';

import { Divider } from './divider';
import type { DividerProps } from './divider.types';
import type { IconElementProps } from '../../primitives/icon/icon.types';

function renderDivider(props: DividerProps) {
  return render(<Divider {...props} />);
}

function getRoot(component: Awaited<ReturnType<typeof renderDivider>>) {
  return component.getByRole('separator');
}

describe('Divider', () => {
  it.each([
    ['Section', 'Section'],
    [42, '42'],
    [{ children: 'Overview' }, 'Overview'],
    [{ children: 7 }, '7'],
    [null, undefined],
  ] as const)('DIV-005 derives the accessible name from label %j', async (label, name) => {
    const component = await renderDivider({ label });

    expect(getRoot(component).props.accessibilityLabel).toBe(name);
    await component.rerender(<Divider accessibilityLabel="Caller name" label={label} />);
    expect(getRoot(component).props.accessibilityLabel).toBe('Caller name');
  });

  it('DIV-002 preserves an icon-only content container when the label is removed', async () => {
    const component = await renderDivider({
      icon: { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' }, testID: 'divider-icon' },
      label: null,
    });
    const root = getRoot(component);

    expect(root.children).toHaveLength(3);
    expect(component.getByTestId('divider-icon')).toBeOnTheScreen();
    expect(component.queryByText('Text')).toBeNull();
    expect(root.props.accessibilityLabel).toBeUndefined();
  });

  it('DIV-002/DIV-006 honors a label replacement and applies caller root styles last', async () => {
    const ReplacementLabel = directComponent<TextProps>((props) => <NativeText {...props} accessibilityHint="replacement" />);
    const component = await renderDivider({
      label: { as: ReplacementLabel, children: 'Section', testID: 'replacement-label' },
      style: { alignItems: 'flex-end', flexDirection: 'column' },
    });

    expect(component.getByTestId('replacement-label').props).toMatchObject({
      accessibilityHint: 'replacement',
      accessible: false,
    });
    expect(StyleSheet.flatten(getRoot(component).props.style)).toMatchObject({
      alignItems: 'flex-end',
      flexDirection: 'column',
    });
  });

  it.each(['start', 'end'] as const)('DIV-003/DIV-004 resolves vertical %s stubs without horizontal line dimensions', async (layout) => {
    const component = await renderDivider({ layout, vertical: true });
    const root = getRoot(component);
    const lines = [root.children[0], root.children[2]];

    for (const [index, line] of lines.entries()) {
      if (typeof line === 'string') throw new TypeError('Divider lines must be native views.');
      const style = StyleSheet.flatten(line.props.style);
      const stub = layout === 'start' ? index === 0 : index === 1;
      expect(style).toMatchObject({
        width: defaultFlexTokens.strokeWidth.thin,
        flexBasis: stub ? defaultFlexTokens.spacing.componentBase100 : 0,
        flexGrow: stub ? 0 : 1,
      });
      expect(style.height).toBeUndefined();
    }
    const content = root.children[1];
    if (typeof content === 'string') throw new TypeError('Divider content must be a native view.');
    expect(StyleSheet.flatten(content.props.style)).toMatchObject({
      flexDirection: 'row',
      paddingVertical: defaultFlexTokens.spacing.componentBase300,
    });
    expect(StyleSheet.flatten(content.props.style).paddingHorizontal).toBeUndefined();
  });

  it('renders a labeled separator by default', async () => {
    const component = await renderDivider({});
    const root = getRoot(component);

    expect(root.props.accessibilityRole).toBe('separator');
    expect(root.props.accessibilityLabel).toBe('Text');
    expect(root.props.focusable).toBe(false);
    expect(component.getByText('Text')).toBeOnTheScreen();
    expect(StyleSheet.flatten(root.props.style)).toMatchObject({
      alignItems: 'center',
      alignSelf: 'stretch',
      flexDirection: 'row',
      justifyContent: 'center',
    });
  });

  it.each(['center', 'start', 'end'] as const)('resolves the %s layout', async (layout) => {
    const component = await renderDivider({ layout });
    const tokens = defaultFlexTokens;
    const root = getRoot(component);
    const beforeLine = root.children[0] as { props: { style?: unknown } };
    const content = root.children[1] as { props: { style?: unknown } };
    const afterLine = root.children[2] as { props: { style?: unknown } };
    const stub = tokens.spacing.componentBase100;
    const beforeExpected = layout === 'start' ? { flexBasis: stub, flexGrow: 0 } : { flexBasis: 0, flexGrow: 1 };
    const afterExpected = layout === 'end' ? { flexBasis: stub, flexGrow: 0 } : { flexBasis: 0, flexGrow: 1 };

    expect(StyleSheet.flatten(beforeLine.props.style)).toMatchObject({
      backgroundColor: tokens.color.strokeNeutralSubtle,
      height: tokens.strokeWidth.thin,
      ...beforeExpected,
    });
    expect(StyleSheet.flatten(afterLine.props.style)).toMatchObject({
      backgroundColor: tokens.color.strokeNeutralSubtle,
      height: tokens.strokeWidth.thin,
      ...afterExpected,
    });
    expect(StyleSheet.flatten(content.props.style)).toMatchObject({
      gap: tokens.spacing.componentBase150,
      paddingHorizontal: tokens.spacing.componentBase300,
    });
  });

  it('switches to vertical layout and uses vertical padding', async () => {
    const component = await renderDivider({ vertical: true, label: 'Section' });
    const tokens = defaultFlexTokens;
    const root = getRoot(component);
    const beforeLine = root.children[0] as { props: { style?: unknown } };
    const content = root.children[1] as { props: { style?: unknown } };

    expect(StyleSheet.flatten(root.props.style)).toMatchObject({ flexDirection: 'column' });
    expect(StyleSheet.flatten(beforeLine.props.style)).toMatchObject({
      backgroundColor: tokens.color.strokeNeutralSubtle,
      width: tokens.strokeWidth.thin,
      flexGrow: 1,
    });
    expect(StyleSheet.flatten(content.props.style)).toMatchObject({
      gap: tokens.spacing.componentBase150,
      paddingVertical: tokens.spacing.componentBase300,
    });
    expect(StyleSheet.flatten(component.getByText('Section').props.style)).toMatchObject({
      color: tokens.color.foregroundNeutralSecondary,
      fontFamily: tokens.fontFamily.functional,
      fontSize: tokens.fontSize.functionalBodySmall,
      lineHeight: tokens.lineHeight.functionalBodySmall,
    });
  });

  it('forwards icon slot props and hides content when label and icon are omitted', async () => {
    const ReplacementIcon = directComponent<IconElementProps>((props) => <View {...props} accessibilityHint="replacement" />);
    const visible = await renderDivider({
      icon: { as: ReplacementIcon, testID: 'divider-icon' },
      label: 'Section',
    });
    const icon = visible.getByTestId('divider-icon');

    expect(icon.props.accessibilityHint).toBe('replacement');
    expect(icon.props.accessible).toBe(false);
    expect(icon.props.height).toBe(20);
    expect(icon.props.width).toBe(20);
    expect(getRoot(visible).props.accessibilityLabel).toBe('Section');

    const plain = await renderDivider({ icon: null, label: null });
    expect(plain.queryByText('Text')).toBeNull();
    expect(getRoot(plain).children).toHaveLength(2);
  });
});
