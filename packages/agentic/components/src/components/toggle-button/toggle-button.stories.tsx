/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { Input } from '../input/input';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { ToggleButton } from './toggle-button';

const regular = { fontSource: { codepoint: 0x2606, fontFamily: 'Arial' } };
const filled = { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' } };

const meta: Meta<typeof ToggleButton> = { title: 'Components/ToggleButton', component: ToggleButton };
export default meta;

type Story = WdioStory<StoryObj<typeof ToggleButton>>;

function SelectionScene() {
  const [selected, setSelected] = useState(false);
  const [changes, setChanges] = useState(0);
  const [presses, setPresses] = useState(0);
  return (
    <View style={{ alignItems: 'flex-start', gap: 8 }}>
      <Input accessibilityLabel="Keyboard entry" testID="toggle-entry" />
      <ToggleButton
        content="Favorite"
        leadingIcon={regular}
        selectedLeadingIcon={filled}
        selected={selected}
        onSelectedChange={(next) => {
          setSelected(next);
          setChanges((count) => count + 1);
        }}
        onPress={() => setPresses((count) => count + 1)}
        accessibilityActions={[{ name: 'Toggle', label: 'Toggle favorite' }]}
        testID="toggle-favorite"
      />
      <ToggleButton content="Unavailable" disabled defaultSelected testID="toggle-unavailable" />
      <StoryStatus testID="toggle-status">{`${selected}:${changes}:${presses}`}</StoryStatus>
    </View>
  );
}

export const Selection: Story = {
  render: () => <SelectionScene />,
  wdio: [
    desktopIt('TGB-005 exposes one stable named button and an unavailable peer', async ({ browser, expect }) => {
      const toggle = await browser.$('~toggle-favorite');
      expect(await toggle.getTagName()).toBe('button');
      await expect(toggle).toHaveAttribute('name', 'Favorite');
      await expect(toggle).toBeEnabled();
      await expect(await browser.$('~toggle-unavailable')).toBeDisabled();
    }),
    desktopIt(
      'TGB-002 TGB-003 changes once on pointer input without reflow',
      { requires: ['physical-click'] },
      async ({ browser, expect }) => {
        const { clickPhysical } = await import('../../common/desktopFocus.wdio.ts');
        const toggle = await browser.$('~toggle-favorite');
        const status = await browser.$('~toggle-status');
        const before = await browser.getElementRect(await toggle.elementId);
        await clickPhysical(browser, 'toggle-favorite');
        await expect(status).toHaveAttribute('name', 'true:1:1');
        const after = await browser.getElementRect(await toggle.elementId);
        expect(after.width).toBe(before.width);
        expect(after.height).toBe(before.height);
        await clickPhysical(browser, 'toggle-favorite');
        await expect(status).toHaveAttribute('name', 'false:2:2');
      },
    ),
    desktopIt(
      'TGB-005 delivers one transition per physical key gesture',
      { requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, expect }) => {
        const { clickPhysical, expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
        await clickPhysical(browser, 'toggle-entry');
        await expectNativeState(browser, 'toggle-entry', 'focused', true);
        await browser.keys('\uE004');
        await expectNativeState(browser, 'toggle-favorite', 'focused', true);
        await browser.keys('\uE00D');
        await expect(await browser.$('~toggle-status')).toHaveAttribute('name', 'true:1:1');
        await expectNativeState(browser, 'toggle-favorite', 'focused', true);
        await browser.keys('\uE007');
        await expect(await browser.$('~toggle-status')).toHaveAttribute('name', 'false:2:2');
      },
    ),
    desktopIt(
      'TGB-005 invokes the actual macOS custom Toggle without a pointer press',
      { requires: ['accessibility-actions', 'perform-accessibility-action'], platforms: ['macos'] },
      async ({ browser, expect }) => {
        const toggle = await browser.$('~toggle-favorite');
        const names = (await toggle.getProperty('accessibilityActions')) as string[];
        const nativeToggle = names.find((name) => name === 'Toggle' || name === 'Toggle favorite');
        expect(nativeToggle).toBeDefined();
        await toggle.desktopPerformAccessibilityAction(nativeToggle!);
        await expect(await browser.$('~toggle-status')).toHaveAttribute('name', 'true:1:0');
      },
    ),
    desktopIt(
      'TGB-005 Win32 Toggle changes checked state without synthesizing onPress',
      { requires: ['accessibility-click'], platforms: ['win32'] },
      async ({ browser, expect }) => {
        const { expectNativeState } = await import('../../common/desktopFocus.wdio.ts');
        await expectNativeState(browser, 'toggle-favorite', 'checked', false);
        await (await browser.$('~toggle-favorite')).click();
        await expectNativeState(browser, 'toggle-favorite', 'checked', true);
        await expect(await browser.$('~toggle-status')).toHaveAttribute('name', 'true:1:0');
      },
    ),
  ],
};
