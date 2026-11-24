import { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { SimpleNav } from './simple-nav';
import type { SimpleNavDestination } from './simple-nav.types';

const items: readonly SimpleNavDestination[] = [
  { key: 'home', label: 'Home', testID: 'rail-home', leading: { kind: 'icon', icon: { fontSource: { codepoint: 0x2302 } } } },
  { key: 'settings', label: 'Settings', testID: 'rail-settings', leading: { kind: 'icon', icon: { fontSource: { codepoint: 0x2699 } } } },
];
const meta: Meta<typeof SimpleNav> = {
  title: 'Components/SimpleNav',
  component: SimpleNav,
  args: { items, accessibilityLabel: 'Application' },
};
export default meta;
type Story = WdioStory<StoryObj<typeof SimpleNav>>;
export const Default: Story = {
  render: (args) => (
    <SimpleNav {...args} onNavigate={(_key): void => undefined} collapseLabel="Collapse navigation" expandLabel="Expand navigation" />
  ),
};
export const Rail: Story = {
  tags: ['flex-fourth-wave'],
  render: function ApplicationRail(args) {
    const [current, setCurrent] = useState('home');
    return (
      <View style={{ width: 140 }}>
        <SimpleNav
          {...args}
          breakpoints={{ hideBelow: 42, railBelow: 150 }}
          availableWidth={140}
          currentValue={current}
          currentDescription="Current page"
          onNavigate={setCurrent}
        />
        <StoryStatus testID="rail-route">{current}</StoryStatus>
      </View>
    );
  },
  wdio: [
    desktopIt('SNV-004 retains an independently named icon-only destination', { requires: ['click'] }, async (context) => {
      const { browser, desktop, expect } = context;
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await expect(await browser.$('~rail-settings')).toHaveAttribute('name', 'Settings');
      await (await desktop.session.findElement('accessibility id', 'rail-settings')).click();
      await expect(await browser.$('~rail-route')).toHaveAttribute('name', 'settings');
      await recordVisualReview(context, 'simple-nav-rail');
    }),
  ],
};
