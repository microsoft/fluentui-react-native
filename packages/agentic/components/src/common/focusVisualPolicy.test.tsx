/** @jsxImportSource @fluentui-react-native/framework-base */
import type { ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import type { AccessibilityRole } from 'react-native';

import { fireEvent, render } from '@testing-library/react-native';

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
import { createFocusVisualProps, focusVisualPolicy, getNativeFocusVisualProps } from './focusVisualPolicy';

const cases: { name: string; element: ReactElement; role: AccessibilityRole }[] = [
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

it('defaults to native focus visuals without changing custom ring geometry', () => {
  expect(getNativeFocusVisualProps()).toEqual({ enableFocusRing: true });
  expect(
    createFocusVisualProps({
      borderRadius: 4,
      innerColor: 'white',
      innerWidth: 1,
      outerColor: 'black',
      outerWidth: 2,
      visible: true,
    }),
  ).toEqual({
    inner: { style: { borderColor: 'white', borderRadius: 4, borderStyle: 'solid', borderWidth: 1 } },
    style: { borderColor: 'black', borderRadius: 4, borderStyle: 'solid', borderWidth: 2 },
    visible: false,
  });
});

describe.each([true, false])('useSystemFocusVisuals=%s', (useSystemFocusVisuals) => {
  beforeEach(() => {
    jest.replaceProperty(focusVisualPolicy, 'useSystemFocusVisuals', useSystemFocusVisuals);
  });

  it.each(cases)('keeps exactly one focus visual owner for $name', async ({ element, role }) => {
    const component = await render(element);
    const target = component.getByRole(role);
    const outerRing = component.getByTestId('focus-visual', { includeHiddenElements: true });
    const innerRing = component.getByTestId('focus-visual-inner', { includeHiddenElements: true });

    expect(target.props.enableFocusRing).toBe(useSystemFocusVisuals);
    expect(StyleSheet.flatten(outerRing.props.style).opacity).toBe(0);

    await fireEvent(target, 'focus', {});

    expect(component.getByTestId('focus-visual', { includeHiddenElements: true })).toBe(outerRing);
    expect(component.getByTestId('focus-visual-inner', { includeHiddenElements: true })).toBe(innerRing);
    expect(StyleSheet.flatten(outerRing.props.style).opacity).toBe(useSystemFocusVisuals ? 0 : undefined);
    expect(outerRing.props).toMatchObject({ accessible: false, focusable: false, pointerEvents: 'none' });

    await fireEvent(target, 'blur', {});

    expect(StyleSheet.flatten(outerRing.props.style).opacity).toBe(0);
  });
});
