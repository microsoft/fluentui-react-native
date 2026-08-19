/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';
import type { PressableProps, ViewStyle } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';
import type { RenderResult } from '@testing-library/react-native';

import { useFlexTokens } from '@fluentui-react-native/design';
import { Button } from '../button/button';
import { ListItem } from './list-item';

function renderListItem(props: React.ComponentProps<typeof ListItem>): Promise<RenderResult> {
  return render(<ListItem {...props} />);
}

function getRoot(component: RenderResult) {
  return component.getAllByRole('button')[0];
}

function getRootStyle(component: RenderResult): ViewStyle {
  return StyleSheet.flatten(getRoot(component).props.style);
}

describe('ListItem', () => {
  it('renders selection without changing it on press', async () => {
    const onPress = jest.fn();
    const component = await renderListItem({ content: 'Inbox', onPress, selected: false, selectionMode: 'multiple' });

    await fireEvent.press(getRoot(component));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(getRoot(component).props.accessibilityState.selected).toBe(false);
  });

  it('renders the default row with selection hidden and stable content styling', async () => {
    const component = await renderListItem({ content: 'Inbox' });
    const root = getRoot(component);

    expect(root.props.accessibilityRole).toBe('button');
    expect(root.props.accessibilityState).toEqual({ disabled: false, selected: false });
    expect(root.props.focusable).toBe(true);
    expect(component.getAllByText('Inbox', { includeHiddenElements: true })).toHaveLength(2);
    expect(getRootStyle(component)).toMatchSnapshot();
    expect(component.queryByText('☐')).toBeNull();
  });

  it('forwards press and interaction handlers while updating visual state', async () => {
    const colors = useFlexTokens().color;
    const onHoverIn = jest.fn();
    const onPress = jest.fn();
    const component = await renderListItem({ content: 'Save', onHoverIn, onPress });
    const root = getRoot(component);

    await fireEvent(root, 'hoverIn', {});
    expect(onHoverIn).toHaveBeenCalledTimes(1);
    expect(getRootStyle(component).backgroundColor).toBe(colors.hover.backgroundNeutralTransparent);

    await fireEvent(root, 'pressIn', {});
    expect(onPress).toHaveBeenCalledTimes(0);
    await fireEvent.press(root);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disables interaction and exposes disabled accessibility state', async () => {
    const onPress = jest.fn();
    const component = await renderListItem({ content: 'Unavailable', disabled: true, onPress });
    const root = getRoot(component);

    expect(root).toBeDisabled();
    expect(root.props.focusable).toBe(false);
    expect(root.props.accessibilityState).toEqual({ disabled: true, selected: false });
    await fireEvent.press(root);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders selection indicators for single and multiple selection modes', async () => {
    const single = await renderListItem({ content: 'Single', selectionMode: 'single', selected: true });
    expect(single.getByText('◉', { includeHiddenElements: true })).toBeOnTheScreen();

    const multiple = await renderListItem({ content: 'Multiple', selectionMode: 'multiple', selected: true });
    expect(multiple.getByText('☑', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('suppresses the selected fill in multiple selection mode', async () => {
    const colors = useFlexTokens().color;
    const component = await renderListItem({ content: 'Selected', selectionMode: 'multiple', selected: true });

    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: colors.backgroundNeutralTransparent,
    });
  });

  it('uses the regular leading icon while not selected and the selected icon when selected', async () => {
    const component = await renderListItem({
      content: 'Favorite',
      icon: { imageSource: { uri: 'regular.png' }, testID: 'regular-icon' },
      selected: false,
      selectedIcon: { imageSource: { uri: 'filled.png' }, testID: 'filled-icon' },
    });

    expect(component.getByTestId('regular-icon').props.source).toEqual({ uri: 'regular.png' });
    expect(component.queryByTestId('filled-icon')).toBeNull();
  });

  it('uses selected semantics, selected icon, and a ghost label to prevent reflow', async () => {
    const component = await renderListItem({
      content: 'Favorite',
      icon: { imageSource: { uri: 'regular.png' }, testID: 'regular-icon' },
      selected: true,
      selectedIcon: { imageSource: { uri: 'filled.png' }, testID: 'filled-icon' },
    });
    const root = getRoot(component);
    const labels = component.getAllByText('Favorite', { includeHiddenElements: true });

    expect(root.props.accessibilityState).toEqual({ disabled: false, selected: true });
    expect(component.getByTestId('filled-icon').props.source).toEqual({ uri: 'filled.png' });
    expect(component.queryByTestId('regular-icon')).toBeNull();
    expect(labels).toHaveLength(2);
    expect(StyleSheet.flatten(labels[0].props.style)).toMatchObject({ fontWeight: '600', opacity: 0 });
    expect(StyleSheet.flatten(labels[1].props.style)).toMatchObject({ fontWeight: '600', position: 'absolute' });
  });

  it('places secondary content under the primary label when requested', async () => {
    const component = await renderListItem({
      content: { children: 'Row', testID: 'primary' },
      secondaryContent: { children: 'Details', testID: 'secondary' },
      secondaryContentPosition: 'under',
    });

    expect(StyleSheet.flatten(component.getByTestId('secondary').props.style)).toMatchObject({
      marginTop: 4,
    });
  });

  it('places trailing action items after the content and keeps the row style override last', async () => {
    const style: ViewStyle = { backgroundColor: 'hotpink' };
    const component = await renderListItem({
      content: { children: 'Next', testID: 'content' },
      style,
      trailing: {
        children: <Button content="Action" />,
        testID: 'trailing',
      },
    });

    expect(getRootStyle(component).backgroundColor).toBe('hotpink');
    expect(component.getByTestId('trailing')).toBeOnTheScreen();
  });

  it.each([['small', 8, 6, 4, 16] as const, ['medium', 12, 10, 8, 20] as const, ['large', 16, 12, 8, 24] as const])(
    'resolves the %s size',
    async (size, paddingHorizontal, paddingVertical, leadingMargin, iconSize) => {
      const component = await renderListItem({ content: size, size });
      const rootStyle = getRootStyle(component);

      expect(rootStyle.paddingHorizontal).toBe(paddingHorizontal);
      expect(rootStyle.paddingVertical).toBe(paddingVertical);

      const icon = await renderListItem({
        content: `${size} icon`,
        icon: { imageSource: { uri: `${size}.png` }, testID: `${size}-icon` },
        size,
      });
      expect(StyleSheet.flatten(icon.getByTestId(`${size}-icon`).props.style)).toMatchObject({ height: iconSize, width: iconSize });
      expect(getRootStyle(icon).paddingHorizontal).toBe(paddingHorizontal);
      expect(getRootStyle(icon).paddingVertical).toBe(paddingVertical);
      expect(getRootStyle(icon)).toMatchObject({ paddingHorizontal, paddingVertical });
      expect(StyleSheet.flatten(icon.getAllByText(`${size} icon`, { includeHiddenElements: true })[1].props.style)).toMatchObject({
        fontFamily: expect.any(String),
      });
      expect(leadingMargin).toBeGreaterThan(0);
    },
  );

  it('renders a dual-token focus outline', async () => {
    const colors = useFlexTokens().color;
    const component = await renderListItem({ content: 'Focused' });
    const root = getRoot(component);

    await fireEvent(root, 'focus', {});

    expect(getRootStyle(component)).toMatchObject({
      borderColor: colors.strokeFocusInner,
      outlineColor: colors.strokeFocusOuter,
      outlineOffset: 1,
      outlineStyle: 'solid',
      outlineWidth: 2,
    });
  });

  it('preserves user accessibility state values', async () => {
    const props: Pick<PressableProps, 'accessibilityState'> = {
      accessibilityState: { busy: true },
    };
    const component = await renderListItem({ content: 'Working', ...props });

    expect(getRoot(component).props.accessibilityState).toEqual({ busy: true, disabled: false, selected: false });
  });
});
