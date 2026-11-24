import { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Button } from '../button/button';
import { commandPressProps } from '../button/commandPress';
import { Text } from '../text/text';
import { Dialog } from './dialog';
import type { DialogType } from './dialog.types';

const meta: Meta<typeof Dialog> = { title: 'Components/Dialog', component: Dialog, args: { title: 'Archive project?' } };
export default meta;
type Story = WdioStory<StoryObj<typeof Dialog>>;

function Scene({ title, type = 'modal' }: { title: string; type?: DialogType }) {
  const [open, setOpen] = useState(false);
  const [resolution, setResolution] = useState('Pending');
  const [background, setBackground] = useState(0);
  return (
    <View style={{ gap: 8 }}>
      <Button {...commandPressProps(() => setOpen(true), false)} content="Review archive" testID="archive-open" />
      <Button
        {...commandPressProps(() => setBackground((count) => count + 1), false)}
        content="Background action"
        testID="archive-background"
      />
      <StoryStatus testID="archive-result">{resolution}</StoryStatus>
      <StoryStatus testID="archive-background-count">{String(background)}</StoryStatus>
      <Dialog
        title={title}
        type={type}
        open={open}
        onOpenChange={setOpen}
        closeLabel="Close archive review"
        actions={[{ key: 'cancel', label: 'Keep project', testID: 'archive-keep', onPress: () => setResolution('Kept') }]}
      >
        <Text>Archiving moves the project out of the active workspace.</Text>
      </Dialog>
    </View>
  );
}

export const Default: Story = {
  tags: ['flex-fourth-wave', 'mac-appkit-foundation'],
  render: ({ title }) => <Scene title={title} />,
  wdio: [
    desktopIt('DLG-001 presents its own native sheet and resolves once', { requires: ['click'], platforms: ['macos'] }, async (context) => {
      const { browser, expect } = context;
      const { inWindowWith } = await import('../menu/menu.wdio.ts');
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await (await browser.$('~archive-open')).click();
      await inWindowWith(context, 'archive-keep', async () => {
        await recordVisualReview(context, 'dialog-sheet');
        await (await browser.$('~archive-keep')).click();
      });
      await expect(await browser.$('~archive-result')).toHaveAttribute('name', 'Kept');
    }),
    desktopIt(
      'DLG-003 a presented AppKit sheet blocks the owner pointer action',
      { requires: ['physical-click'], platforms: ['macos'] },
      async (context) => {
        const { browser, desktop, expect } = context;
        const { inWindowWith } = await import('../menu/menu.wdio.ts');
        const owner = await browser.getWindowHandle();
        await (await browser.$('~archive-background')).click();
        await expect(await browser.$('~archive-background-count')).toHaveAttribute('name', '1');
        await (await browser.$('~archive-open')).click();
        await inWindowWith(context, 'archive-keep', async () => {
          await expect(await browser.$('~archive-keep')).toBeDisplayed();
        });
        await browser.switchToWindow(owner);
        try {
          await (await desktop.session.findElement('accessibility id', 'archive-background')).click();
        } catch (error) {
          const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
          if (code !== 'element not interactable' && code !== 'no such element' && code !== 'element click intercepted') throw error;
        }
        await inWindowWith(context, 'archive-keep', async () => {
          await (await browser.$('~archive-keep')).click();
        });
        await expect(await browser.$('~archive-background-count')).toHaveAttribute('name', '1');
      },
    ),
  ],
};

export const Alert: Story = { render: ({ title }) => <Scene title={title} type="alert" /> };
export const Nonmodal: Story = { render: ({ title }) => <Scene title={title} type="nonmodal" /> };
