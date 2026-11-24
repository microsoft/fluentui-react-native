import { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { DestructiveButton } from '../destructive-button/destructive-button';
import { PresenceBadge } from './presence-badge';
import type { PresenceBadgeSize, PresenceBadgeStatus } from './presence-badge.types';

const statuses: PresenceBadgeStatus[] = ['available', 'busy', 'doNotDisturb', 'away', 'offline', 'outOfOffice'];
const sizes: PresenceBadgeSize[] = ['extraSmall', 'small', 'medium', 'large'];
const meta: Meta<typeof PresenceBadge> = {
  title: 'Components/PresenceBadge',
  component: PresenceBadge,
  args: { size: 'medium', status: 'available' },
  argTypes: { size: { control: 'select', options: sizes }, status: { control: 'select', options: statuses } },
};
export default meta;
type Story = WdioStory<StoryObj<typeof PresenceBadge>>;
export const Default: Story = {};

function StatusUpdate() {
  const [away, setAway] = useState(true);
  return (
    <View style={{ alignItems: 'flex-start', gap: 8 }}>
      <StoryStatus testID="presence-owner">{away ? 'Ana, away' : 'Ana, busy'}</StoryStatus>
      <PresenceBadge status={away ? 'away' : 'busy'} testID="passive-presence-mark" />
      <DestructiveButton content="Change availability" onPress={() => setAway((current) => !current)} testID="change-presence" />
    </View>
  );
}

export const IdentityUpdate: Story = {
  tags: ['flex-second-wave'],
  render: () => <StatusUpdate />,
  wdio: [
    desktopIt(
      'PRS-002 PRS-004 updates a named identity without an independent badge target',
      { requires: ['click'] },
      async ({ browser, desktop, expect }) => {
        await expect(await browser.$('~presence-owner')).toHaveAttribute('name', 'Ana, away');
        expect(await desktop.session.findElements('accessibility id', 'passive-presence-mark')).toHaveLength(0);
        await (await browser.$('~change-presence')).click();
        await expect(await browser.$('~presence-owner')).toHaveAttribute('name', 'Ana, busy');
        expect(await desktop.session.findElements('accessibility id', 'passive-presence-mark')).toHaveLength(0);
      },
    ),
  ],
};

export const Statuses: Story = {
  tags: ['flex-second-wave'],
  render: () => (
    <View accessible accessibilityLabel="Availability artwork examples" testID="presence-statuses" style={{ gap: 8 }}>
      {sizes.map((size) => (
        <View key={size} style={{ flexDirection: 'row', gap: 8 }}>
          {statuses.map((status) => (
            <PresenceBadge key={status} status={status} size={size} />
          ))}
        </View>
      ))}
    </View>
  ),
  wdio: [
    desktopIt('PRS-003 PRS-004 renders passive status artwork at four sizes', async (context) => {
      await context.expect(await context.browser.$('~presence-statuses')).toHaveAttribute('name', 'Availability artwork examples');
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await recordVisualReview(context, 'presence-badge');
    }),
  ],
};
