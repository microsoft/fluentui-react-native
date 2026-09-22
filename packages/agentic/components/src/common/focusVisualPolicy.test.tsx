/** @jsxImportSource @fluentui-react-native/framework-base */
import { cloneElement } from 'react';
import type { ReactElement } from 'react';
import { Platform, StyleSheet } from 'react-native';
import type { AccessibilityRole } from 'react-native';

import { fireEvent } from '@testing-library/react-native';
import { defaultFlexTokens } from '@fluentui-react-native/design/testing';
import { render } from './renderWithTheme';

import { Accordion } from '../components/accordion/accordion';
import { Button } from '../components/button/button';
import { Card } from '../components/card/card';
import { Checkbox } from '../components/checkbox/checkbox';
import { ListItem } from '../components/list-item/list-item';
import { ListboxItem } from '../components/listbox-item/listbox-item';
import { MenuItem } from '../components/menu-item/menu-item';
import { Radio } from '../components/radio/radio';
import { Switch } from '../components/switch/switch';
import { Tab } from '../components/tab/tab';
import { Tag } from '../components/tag/tag';

const cases: { name: string; element: ReactElement<{ disabled?: boolean }>; role: AccessibilityRole }[] = [
  { name: 'Accordion', element: <Accordion />, role: 'button' },
  { name: 'Button', element: <Button content="Action" />, role: 'button' },
  { name: 'Card', element: <Card accessibilityLabel="Card" selected={false} />, role: 'button' },
  { name: 'Checkbox', element: <Checkbox label="Choice" />, role: 'checkbox' },
  { name: 'ListItem', element: <ListItem content="Item" />, role: 'button' },
  { name: 'ListboxItem', element: <ListboxItem content="Option" />, role: 'button' },
  { name: 'MenuItem', element: <MenuItem content="Command" />, role: 'menuitem' },
  { name: 'Radio', element: <Radio label="Choice" />, role: 'radio' },
  { name: 'Switch', element: <Switch label="Setting" />, role: 'switch' },
  { name: 'Tab', element: <Tab content="Page" controls="page-panel" />, role: 'tab' },
  { name: 'Tag', element: <Tag content="Tag" />, role: 'button' },
];

afterEach(() => {
  jest.restoreAllMocks();
});

describe.each(['windows', 'macos', 'win32'])('component focus visuals on %s', (platform) => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
  });

  it.each(cases)('keeps exactly one focus visual owner for $name', async ({ element, role }) => {
    const component = await render(element);
    const target = component.getByRole(role);
    const native = platform !== 'win32';

    expect(target.props.enableFocusRing).toBe(native);
    if (native) {
      expect(component.queryByTestId('focus-visual', { includeHiddenElements: true })).toBeNull();
      await fireEvent(component.getByTestId('test-scene-root'), 'keyDownCapture', { nativeEvent: { key: 'Tab' } });
      await fireEvent(target, 'focus', {});
      expect(component.queryByTestId('focus-visual', { includeHiddenElements: true })).toBeNull();
      return;
    }

    const outerRing = component.getByTestId('focus-visual', { includeHiddenElements: true });
    const innerRing = component.getByTestId('focus-visual-inner', { includeHiddenElements: true });
    expect(StyleSheet.flatten(outerRing.props.style).opacity).toBe(0);

    await fireEvent(component.getByTestId('test-scene-root'), 'keyDownCapture', { nativeEvent: { key: 'Tab' } });
    await fireEvent(target, 'focus', {});

    expect(component.getByTestId('focus-visual', { includeHiddenElements: true })).toBe(outerRing);
    expect(component.getByTestId('focus-visual-inner', { includeHiddenElements: true })).toBe(innerRing);
    expect(StyleSheet.flatten(outerRing.props.style)).toMatchObject({
      borderColor: defaultFlexTokens.color.strokeFocusOuter,
      borderWidth: defaultFlexTokens.strokeWidth.thick,
    });
    expect(StyleSheet.flatten(outerRing.props.style).opacity).toBeUndefined();
    expect(StyleSheet.flatten(innerRing.props.style)).toMatchObject({
      borderColor: defaultFlexTokens.color.strokeFocusInner,
      borderWidth: defaultFlexTokens.strokeWidth.thin,
    });
    expect(outerRing.props).toMatchObject({ accessible: false, focusable: false, pointerEvents: 'none' });

    await fireEvent(target, 'blur', {});
    expect(StyleSheet.flatten(outerRing.props.style).opacity).toBe(0);
    await fireEvent(component.getByTestId('test-scene-root'), 'pointerDownCapture', {});
    await fireEvent(target, 'focus', {});
    expect(StyleSheet.flatten(outerRing.props.style).opacity).toBe(0);
  });
});

it.each(cases)('preserves custom ring geometry for $name', async ({ element, role, name }) => {
  jest.replaceProperty(Platform, 'OS', 'win32' as typeof Platform.OS);
  const component = await render(element);
  const target = component.getByRole(role);
  const radius = name === 'Checkbox' ? defaultFlexTokens.borderRadius.base300 : StyleSheet.flatten(target.props.style).borderRadius;
  const outer = component.getByTestId('focus-visual', { includeHiddenElements: true });
  const inner = component.getByTestId('focus-visual-inner', { includeHiddenElements: true });
  expect(StyleSheet.flatten(outer.props.style).borderRadius).toBe(radius);
  expect(StyleSheet.flatten(inner.props.style).borderRadius).toBe(radius);
});

it.each(cases.filter(({ name }) => name !== 'Accordion'))('keeps disabled $name rings hidden', async ({ element, role }) => {
  jest.replaceProperty(Platform, 'OS', 'win32' as typeof Platform.OS);
  const component = await render(cloneElement(element, { disabled: true }));
  const target = component.getByRole(role);
  await fireEvent(component.getByTestId('test-scene-root'), 'keyDownCapture', { nativeEvent: { key: 'Tab' } });
  await fireEvent(target, 'focus', {});
  expect(target.props.focusable).toBe(false);
  expect(StyleSheet.flatten(component.getByTestId('focus-visual', { includeHiddenElements: true }).props.style).opacity).toBe(0);
});

describe.each(['windows', 'macos', 'win32'])('noninteractive focus targets on %s', (platform) => {
  it.each([
    { name: 'Card', element: <Card testID="noninteractive" /> },
    { name: 'MenuItem', element: <MenuItem testID="noninteractive" menuStyle="section-header" /> },
    { name: 'ListboxItem', element: <ListboxItem testID="noninteractive" variant="sectionHeader" /> },
  ])('does not request a ring for $name', async ({ element }) => {
    jest.replaceProperty(Platform, 'OS', platform as typeof Platform.OS);
    const component = await render(element);
    expect(component.getByTestId('noninteractive').props.enableFocusRing ?? false).toBe(false);
    expect(component.queryByTestId('focus-visual', { includeHiddenElements: true })).toBeNull();
  });
});
