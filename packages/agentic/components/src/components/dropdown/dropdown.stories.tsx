/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { ListboxItem } from '../listbox-item/listbox-item';
import { Dropdown } from './dropdown';
import type { DropdownOpenChangeData, DropdownSize, DropdownVariant } from './dropdown.types';

type SceneProps = {
  variant?: DropdownVariant;
  size?: DropdownSize;
  disabled?: boolean;
  error?: boolean;
  multiselect?: boolean;
  placeholder?: string;
};

const fruits = ['Apple', 'Banana', 'Cherry', 'Grape', 'Lemon', 'Mango'];
const unavailable = new Set(['Cherry']);

const cities = [
  'Amsterdam',
  'Berlin',
  'Cairo',
  'Delhi',
  'Edinburgh',
  'Florence',
  'Geneva',
  'Havana',
  'Istanbul',
  'Jakarta',
  'Kyoto',
  'Lima',
  'Madrid',
  'Nairobi',
  'Oslo',
  'Paris',
  'Quito',
  'Rome',
  'Seoul',
  'Tokyo',
];

const valueOf = (label: string) => label.toLowerCase();
const labelOf = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** A scene that reports presence, selection, and focused option through status rows. */
function FruitScene({ multiselect, ...props }: SceneProps) {
  const [reason, setReason] = React.useState('None');
  const [selection, setSelection] = React.useState('None');
  const [focus, setFocus] = React.useState('None');
  const onOpenChange = (open: boolean, { reason: cause }: DropdownOpenChangeData) => {
    setReason(`${open ? 'Opened' : 'Closed'}: ${cause}`);
    if (open) setFocus('None');
  };
  return (
    <View style={styles.story}>
      <Input accessibilityLabel="Dropdown entry" testID="dropdown-entry" />
      <Dropdown
        {...props}
        accessibilityLabel="Fruit"
        multiselect={multiselect}
        onOpenChange={onOpenChange}
        onSelectedOptionsChange={(selected: string[]) => setSelection(selected.length ? selected.map(labelOf).join(', ') : 'None')}
        trigger={{ testID: 'dropdown-trigger' }}
        listbox={{ testID: 'dropdown-list' }}
        style={styles.field}
      >
        {fruits.map((fruit) => (
          <ListboxItem
            key={fruit}
            value={valueOf(fruit)}
            content={fruit}
            disabled={unavailable.has(fruit)}
            testID={`dropdown-${valueOf(fruit)}`}
            onFocus={() => setFocus(fruit)}
          />
        ))}
      </Dropdown>
      <Button content="After" testID="dropdown-after" />
      <StoryStatus testID="dropdown-reason">{reason}</StoryStatus>
      <StoryStatus testID="dropdown-selection">{selection}</StoryStatus>
      <StoryStatus testID="dropdown-focus">{focus}</StoryStatus>
    </View>
  );
}

const meta: Meta<SceneProps> = {
  title: 'Components/Dropdown',
  render: (args) => <FruitScene {...args} />,
  args: { variant: 'outline', size: 'medium', disabled: false, error: false, multiselect: false },
  argTypes: {
    variant: { control: 'select', options: ['outline', 'underline'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    multiselect: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Dropdown chooses one or more values from a list of options presented in a nonmodal native popup anchored to an Input-styled trigger.',
      },
    },
  },
};

export default meta;

type Story = WdioStory<StoryObj<SceneProps>>;

export const Default: Story = {
  tags: ['desktop-focus'],
  wdio: {
    'opens from the keyboard on the first option and commits with Enter': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await (await import('./dropdown.wdio.ts')).openDropdownFromKeyboard(context, 'Apple');
      expect(await (await browser.$('~dropdown-trigger')).getProperty('expanded')).toBe(true);
      await browser.keys('\uE015');
      await expect(await browser.$('~dropdown-focus')).toHaveText('Banana');
      // The disabled Cherry option is never a focus stop.
      await browser.keys('\uE015');
      await expect(await browser.$('~dropdown-focus')).toHaveText('Grape');
      await browser.keys('\uE013');
      await expect(await browser.$('~dropdown-focus')).toHaveText('Banana');
      await browser.keys('\uE007');
      await expect(await browser.$('~dropdown-selection')).toHaveText('Banana');
      await expect(await browser.$('~dropdown-reason')).toHaveText('Closed: select');
      await expectNativeState(browser, 'dropdown-trigger', 'focused', true);
      expect(await (await browser.$('~dropdown-trigger')).getProperty('value')).toBe('Banana');
    },
    'reopens on the selected option and navigates with Home and End': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      const { openDropdownFromKeyboard } = await import('./dropdown.wdio.ts');
      await openDropdownFromKeyboard(context, 'Apple');
      await browser.keys('\uE010');
      await expect(await browser.$('~dropdown-focus')).toHaveText('Mango');
      await browser.keys('\uE00D');
      await expect(await browser.$('~dropdown-selection')).toHaveText('Mango');
      await expect(await browser.$('~dropdown-reason')).toHaveText('Closed: select');
      await browser.keys('\uE015');
      await expect(await browser.$('~dropdown-reason')).toHaveText('Opened: trigger');
      await expect(await browser.$('~dropdown-focus')).toHaveText('Mango');
      await browser.keys('\uE011');
      await expect(await browser.$('~dropdown-focus')).toHaveText('Apple');
      await browser.keys('\uE00C');
      await expect(await browser.$('~dropdown-reason')).toHaveText('Closed: dismiss');
      await expectNativeState(browser, 'dropdown-trigger', 'focused', true);
      expect(await (await browser.$('~dropdown-selection')).getText()).toBe('Mango');
    },
    'exposes a named list of selectable options': async (context) => {
      const { requireDesktopFocus } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { expectMenuClosed, inWindowWith } = await import('../menu/menu.wdio.ts');
      const { browser, expect } = context;
      await (await import('./dropdown.wdio.ts')).openDropdownFromKeyboard(context, 'Apple');
      const trigger = await browser.$('~dropdown-trigger');
      expect(await trigger.getProperty('expanded')).toBe(true);
      const triggerWidth = (await browser.getElementRect(await trigger.elementId)).width;
      await inWindowWith(context, 'dropdown-list', async () => {
        const list = await browser.$('~dropdown-list');
        // The list is at least as wide as the trigger and sized to its short options.
        const { width } = await browser.getElementRect(await list.elementId);
        expect(width).toBeGreaterThanOrEqual(triggerWidth - 1);
        expect(width).toBeLessThan(triggerWidth * 1.5);
        expect(await list.getProperty('name')).toBe('Fruit');
        expect(await (await browser.$('~dropdown-cherry')).getProperty('enabled')).toBe(false);
        expect(await (await browser.$('~dropdown-apple')).getProperty('name')).toBe('Apple');
      });
      // A macOS window switch makes the owner window key, so close with the trigger rather than a key.
      await (await browser.$('~dropdown-trigger')).click();
      await expect(await browser.$('~dropdown-reason')).toHaveText('Closed: trigger');
      await expectMenuClosed(context, 'dropdown-trigger');
    },
    'closes on Tab and moves focus past the trigger': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { expectMenuClosed } = await import('../menu/menu.wdio.ts');
      const { browser, expect } = context;
      await (await import('./dropdown.wdio.ts')).openDropdownFromKeyboard(context, 'Apple');
      await browser.keys('\uE004');
      await expect(await browser.$('~dropdown-reason')).toHaveText('Closed: dismiss');
      // The Win32 host cannot continue Tab past its owner, so focus returns to the trigger there.
      await expectNativeState(browser, context.platform === 'win32' ? 'dropdown-trigger' : 'dropdown-after', 'focused', true);
      await expectMenuClosed(context, 'dropdown-trigger');
    },
    'closes on Shift+Tab and returns focus to the trigger': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await (await import('./dropdown.wdio.ts')).openDropdownFromKeyboard(context, 'Apple');
      await browser.keys(['\uE008', '\uE004']);
      await expect(await browser.$('~dropdown-reason')).toHaveText('Closed: dismiss');
      await expectNativeState(browser, 'dropdown-trigger', 'focused', true);
    },
    'opens from the pointer on the first option and selects with a click': async (context) => {
      const { requireDesktopFocus } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { expectMenuClosed, inWindowWith } = await import('../menu/menu.wdio.ts');
      const { browser, expect } = context;
      await (await browser.$('~dropdown-trigger')).click();
      await expect(await browser.$('~dropdown-reason')).toHaveText('Opened: trigger');
      await expect(await browser.$('~dropdown-focus')).toHaveText('Apple');
      await inWindowWith(context, 'dropdown-grape', async () => {
        await (await browser.$('~dropdown-grape')).click();
      });
      await expect(await browser.$('~dropdown-selection')).toHaveText('Grape');
      await expect(await browser.$('~dropdown-reason')).toHaveText('Closed: select');
      await expectMenuClosed(context, 'dropdown-trigger');
      await (await browser.$('~dropdown-trigger')).click();
      await expect(await browser.$('~dropdown-reason')).toHaveText('Opened: trigger');
      await (await browser.$('~dropdown-trigger')).click();
      await expect(await browser.$('~dropdown-reason')).toHaveText('Closed: trigger');
      await expectMenuClosed(context, 'dropdown-trigger');
    },
  },
};

export const Multiple: Story = {
  args: { multiselect: true },
  tags: ['desktop-focus'],
  parameters: {
    docs: { description: { story: 'Activation toggles options and keeps the list open; the trigger summarizes long selections.' } },
  },
  wdio: {
    'toggles options and stays open until dismissed': async (context) => {
      const { requireDesktopFocus, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { browser, expect } = context;
      await (await import('./dropdown.wdio.ts')).openDropdownFromKeyboard(context, 'Apple');
      await browser.keys('\uE007');
      await expect(await browser.$('~dropdown-selection')).toHaveText('Apple');
      await browser.keys('\uE015');
      await expect(await browser.$('~dropdown-focus')).toHaveText('Banana');
      await browser.keys('\uE00D');
      await expect(await browser.$('~dropdown-selection')).toHaveText('Apple, Banana');
      await browser.keys('\uE011');
      await browser.keys('\uE007');
      await expect(await browser.$('~dropdown-selection')).toHaveText('Banana');
      expect(await (await browser.$('~dropdown-reason')).getText()).toBe('Opened: trigger');
      await browser.keys('\uE00C');
      await expect(await browser.$('~dropdown-reason')).toHaveText('Closed: dismiss');
      await expectNativeState(browser, 'dropdown-trigger', 'focused', true);
    },
  },
};

/** A long list that scrolls inside the popup. */
function CityScene(props: SceneProps) {
  const [reason, setReason] = React.useState('None');
  const [selection, setSelection] = React.useState<string[]>(['kyoto']);
  const [focus, setFocus] = React.useState('None');
  return (
    <View style={styles.story}>
      <Input accessibilityLabel="Dropdown entry" testID="dropdown-entry" />
      <Dropdown
        {...props}
        accessibilityLabel="City"
        selectedOptions={selection}
        onSelectedOptionsChange={setSelection}
        onOpenChange={(open: boolean, { reason: cause }: DropdownOpenChangeData) => {
          setReason(`${open ? 'Opened' : 'Closed'}: ${cause}`);
          if (open) setFocus('None');
        }}
        trigger={{ testID: 'dropdown-trigger' }}
        listbox={{ testID: 'dropdown-list' }}
        style={styles.field}
      >
        {cities.map((city) => (
          <ListboxItem
            key={city}
            value={valueOf(city)}
            content={city}
            testID={`dropdown-${valueOf(city)}`}
            onFocus={() => setFocus(city)}
          />
        ))}
      </Dropdown>
      <StoryStatus testID="dropdown-reason">{reason}</StoryStatus>
      <StoryStatus testID="dropdown-selection">{selection.map(labelOf).join(', ') || 'None'}</StoryStatus>
      <StoryStatus testID="dropdown-focus">{focus}</StoryStatus>
    </View>
  );
}

export const LongList: Story = {
  render: (args) => <CityScene {...args} />,
  tags: ['desktop-focus'],
  parameters: {
    docs: { description: { story: 'A controlled selection in a list taller than the popup, which scrolls the focused option into view.' } },
  },
  wdio: {
    'enters on the controlled selection and reaches the end of a scrolling list': async (context) => {
      const { requireDesktopFocus } = await import('../../common/desktopFocus.wdio.ts');
      if (!requireDesktopFocus(context)) return;
      const { inWindowWith } = await import('../menu/menu.wdio.ts');
      const { browser, expect } = context;
      await (await import('./dropdown.wdio.ts')).openDropdownFromKeyboard(context, 'Kyoto');
      await browser.keys('\uE010');
      await expect(await browser.$('~dropdown-focus')).toHaveText('Tokyo');
      await inWindowWith(context, 'dropdown-tokyo', async () => {
        const rect = async (id: string) => browser.getElementRect(await (await browser.$(`~${id}`)).elementId);
        const list = await rect('dropdown-list');
        const option = await rect('dropdown-tokyo');
        // The focused last option is scrolled within the list's visible bounds.
        expect(option.y).toBeGreaterThanOrEqual(list.y - 1);
        expect(option.y + option.height).toBeLessThanOrEqual(list.y + list.height + 1);
        // A macOS window switch makes the owner window key, so commit with the pointer rather than a key.
        await (await browser.$('~dropdown-tokyo')).click();
      });
      await expect(await browser.$('~dropdown-selection')).toHaveText('Tokyo');
      await expect(await browser.$('~dropdown-reason')).toHaveText('Closed: select');
    },
  },
};

/** Variants, sizes, and states side by side. */
function GalleryScene() {
  const options = fruits.slice(0, 3).map((fruit) => <ListboxItem key={fruit} value={valueOf(fruit)} content={fruit} />);
  return (
    <View style={styles.story}>
      {(['outline', 'underline'] as const).map((variant) =>
        (['small', 'medium', 'large'] as const).map((size) => (
          <Dropdown key={`${variant}-${size}`} accessibilityLabel={`${variant} ${size}`} variant={variant} size={size} style={styles.field}>
            {options}
          </Dropdown>
        )),
      )}
      <Dropdown accessibilityLabel="Selected" defaultSelectedOptions={['banana']} style={styles.field}>
        {options}
      </Dropdown>
      <Dropdown accessibilityLabel="Error" error style={styles.field}>
        {options}
      </Dropdown>
      <Dropdown accessibilityLabel="Disabled" disabled defaultSelectedOptions={['apple']} style={styles.field}>
        {options}
      </Dropdown>
    </View>
  );
}

export const Appearance: Story = {
  render: () => <GalleryScene />,
  parameters: {
    controls: { disable: true },
    docs: { description: { story: "Input's outline and underline chrome at each size, with selected, error, and disabled states." } },
  },
};

const styles = StyleSheet.create({
  story: {
    alignItems: 'flex-start',
    gap: 16,
    padding: 24,
  },
  field: {
    width: 240,
  },
});
