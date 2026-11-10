/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet } from 'react-native';
import type { PressableProps, ViewStyle } from 'react-native';

import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import type { RenderResult } from '@testing-library/react-native';

import { defaultFlexTokens } from '@fluentui-react-native/design/testing';
import {
  CheckboxChecked16Filled,
  CheckboxChecked20Filled,
  CheckboxChecked24Filled,
  CheckboxUnchecked20Regular,
  RadioButton20Filled,
  RadioButton20Regular,
} from '../../common/icons/fluentIcons.generated';
import { getGeneratedIconPaths, getRenderedIconPaths } from '../../common/icons/iconTestUtils';
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

const selectionIndicatorTestIDs = [
  'list-item-radio-unselected',
  'list-item-radio-selected',
  'list-item-checkbox-unchecked',
  'list-item-checkbox-checked',
] as const;

// The glyph each indicator draws in the default, medium row.
const selectionIndicatorIcons = {
  'list-item-radio-unselected': RadioButton20Regular,
  'list-item-radio-selected': RadioButton20Filled,
  'list-item-checkbox-unchecked': CheckboxUnchecked20Regular,
  'list-item-checkbox-checked': CheckboxChecked20Filled,
} as const;

function getRenderedSelectionIndicators(component: RenderResult): string[] {
  return selectionIndicatorTestIDs.filter((testID) => component.queryByTestId(testID, { includeHiddenElements: true }));
}

describe('ListItem', () => {
  it.each([
    ['none', false, undefined],
    ['none', true, undefined],
    ['single', false, 'list-item-radio-unselected'],
    ['single', true, 'list-item-radio-selected'],
    ['multiple', false, 'list-item-checkbox-unchecked'],
    ['multiple', true, 'list-item-checkbox-checked'],
  ] as const)(
    'LIT-003 keeps %s selection=%s caller-owned and presents only its indicator',
    async (selectionMode, selected, indicatorTestID) => {
      const onPress = jest.fn();
      const component = await renderListItem({ content: 'Choice', selectionMode, selected, onPress });
      await fireEvent.press(getRoot(component));
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(getRoot(component).props.accessibilityState.selected).toBe(selected);
      expect(getRenderedSelectionIndicators(component)).toEqual(indicatorTestID ? [indicatorTestID] : []);
      if (indicatorTestID) {
        const indicator = component.getByTestId(indicatorTestID, { includeHiddenElements: true });
        expect(indicator.props).toMatchObject({
          accessible: false,
          accessibilityElementsHidden: true,
          importantForAccessibility: 'no-hide-descendants',
        });
        expect(getRenderedIconPaths(indicator)).toEqual(getGeneratedIconPaths(selectionIndicatorIcons[indicatorTestID]));
      }
      expect(getRootStyle(component).backgroundColor).toBe(
        selected && selectionMode !== 'multiple'
          ? defaultFlexTokens.color.backgroundNeutralSoft.rest
          : defaultFlexTokens.color.backgroundNeutralTransparent.rest,
      );
    },
  );

  it.each([
    ['small', CheckboxChecked16Filled],
    ['medium', CheckboxChecked20Filled],
    ['large', CheckboxChecked24Filled],
  ] as const)('draws the %s row selection indicator at its nearest optical size', async (size, expected) => {
    const component = await renderListItem({ content: 'Choice', selectionMode: 'multiple', selected: true, size });
    const indicator = component.getByTestId('list-item-checkbox-checked', { includeHiddenElements: true });

    expect(getRenderedIconPaths(indicator)).toEqual(getGeneratedIconPaths(expected));
  });

  it.each([false, true])('LIT-002 gives avatar precedence over both icons when selected=%s', async (selected) => {
    const component = await renderListItem({
      content: 'Contact',
      selected,
      avatar: { testID: 'contact-avatar' },
      icon: { imageSource: { uri: 'regular.png' }, testID: 'regular-icon' },
      selectedIcon: { imageSource: { uri: 'selected.png' }, testID: 'selected-icon' },
    });
    expect(component.getByTestId('contact-avatar').props.accessible).toBe(false);
    expect(component.queryByTestId('regular-icon')).toBeNull();
    expect(component.queryByTestId('selected-icon')).toBeNull();
  });

  it.each(['none', 'single', 'multiple'] as const)('LIT-004 suppresses selected fill while disabled in %s mode', async (selectionMode) => {
    const component = await renderListItem({ content: 'Unavailable', selected: true, disabled: true, selectionMode });
    expect(getRootStyle(component).backgroundColor).toBe(defaultFlexTokens.color.backgroundNeutralTransparent.rest);
    expect(getRoot(component).props.accessibilityState).toEqual({ disabled: true, selected: true });
  });

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
    expect(getRenderedSelectionIndicators(component)).toEqual([]);
  });

  it('forwards press and interaction handlers while updating visual state', async () => {
    const colors = defaultFlexTokens.color;
    const onHoverIn = jest.fn();
    const onPress = jest.fn();
    const component = await renderListItem({ content: 'Save', onHoverIn, onPress });
    const root = getRoot(component);

    await fireEvent(root, 'hoverIn', {});
    expect(onHoverIn).toHaveBeenCalledTimes(1);
    expect(getRootStyle(component).backgroundColor).toBe(colors.backgroundNeutralTransparent.hover);

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

  it.each([
    ['small', 16],
    ['medium', 20],
    ['large', 24],
  ] as const)('draws the %s selection indicator with the %d optical size icon in the foreground color', async (size, glyphSize) => {
    const component = await renderListItem({ content: 'Single', selectionMode: 'single', selected: true, size });

    expect(component.getByTestId('list-item-radio-selected', { includeHiddenElements: true }).props).toMatchObject({
      color: defaultFlexTokens.color.foregroundNeutralPrimary.rest,
      height: glyphSize,
      vbHeight: glyphSize,
      vbWidth: glyphSize,
      width: glyphSize,
    });
  });

  it('keeps a gap between the selection indicator and the content only when an indicator is drawn', async () => {
    const getLayoutStyle = (component: RenderResult): ViewStyle => {
      const children = getRoot(component).children;
      const layout = children[children.length - 1];
      if (typeof layout === 'string') {
        throw new Error('Expected the compound layout as the last child of the row.');
      }
      return StyleSheet.flatten(layout.props.style);
    };

    const withIndicator = await renderListItem({ content: 'Single', selectionMode: 'single' });
    const withoutIndicator = await renderListItem({ content: 'Plain' });

    expect(getLayoutStyle(withIndicator).marginStart).toBe(defaultFlexTokens.spacing.componentBase200);
    expect(getLayoutStyle(withoutIndicator).marginStart).toBeUndefined();
  });

  it('suppresses the selected fill in multiple selection mode', async () => {
    const colors = defaultFlexTokens.color;
    const component = await renderListItem({ content: 'Selected', selectionMode: 'multiple', selected: true });

    expect(getRootStyle(component)).toMatchObject({
      backgroundColor: colors.backgroundNeutralTransparent.rest,
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
    expect(StyleSheet.flatten(labels[1].props.style)).toMatchObject({ fontWeight: '600' });
    expect(StyleSheet.flatten(labels[1].parent?.props.style)).toMatchObject({ position: 'absolute', justifyContent: 'center' });
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

  it('uses native focus visuals without mounting custom rings', async () => {
    const component = await renderListItem({ content: 'Focused' });
    const root = getRoot(component);

    await fireEvent(root, 'focus', {});
    expect(root.props.enableFocusRing).toBe(true);

    expect(component.queryByTestId('focus-visual', { includeHiddenElements: true })).toBeNull();
  });

  it('preserves user accessibility state values', async () => {
    const props: Pick<PressableProps, 'accessibilityState'> = {
      accessibilityState: { busy: true },
    };
    const component = await renderListItem({ content: 'Working', ...props });

    expect(getRoot(component).props.accessibilityState).toEqual({ busy: true, disabled: false, selected: false });
  });
});
