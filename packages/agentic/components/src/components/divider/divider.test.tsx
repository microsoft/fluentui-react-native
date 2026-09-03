/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, View } from 'react-native';

import { render } from '@testing-library/react-native';

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
  it('renders a labeled separator by default', async () => {
    const component = await renderDivider({});
    const root = getRoot(component);

    expect(root.props.role).toBe('separator');
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
