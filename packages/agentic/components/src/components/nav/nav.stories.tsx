import { useState } from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Nav } from './nav';
import type { NavEntry } from './nav.types';

const items: readonly NavEntry[] = [
  { key: 'home', label: 'Home', testID: 'nav-home' },
  {
    type: 'category',
    key: 'projects',
    label: 'Projects',
    testID: 'nav-project-category',
    children: [{ key: 'finance', label: 'Finance project', testID: 'nav-finance' }],
  },
];
const meta: Meta<typeof Nav> = {
  title: 'Components/Nav',
  component: Nav,
  args: { items, accessibilityLabel: 'Workspace navigation' },
};
export default meta;
type Story = WdioStory<StoryObj<typeof Nav>>;
export const Default: Story = {
  tags: ['flex-fourth-wave'],
  render: function Navigation(args) {
    const [current, setCurrent] = useState('home');
    return (
      <View>
        <Nav {...args} currentValue={current} currentDescription="Current page" onNavigate={setCurrent} style={{ maxHeight: 180 }} />
        <StoryStatus testID="nav-route-result">{current}</StoryStatus>
      </View>
    );
  },
  wdio: [
    desktopIt('NVC-001 disclosure does not commit a new route', { requires: ['click'] }, async (context) => {
      const { browser, desktop, expect } = context;
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await (await desktop.session.findElement('accessibility id', 'nav-project-category')).click();
      await expect(await browser.$('~nav-route-result')).toHaveAttribute('name', 'home');
      await (await desktop.session.findElement('accessibility id', 'nav-finance')).click();
      await expect(await browser.$('~nav-route-result')).toHaveAttribute('name', 'finance');
      await recordVisualReview(context, 'nav');
    }),
  ],
};
