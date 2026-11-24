import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Breadcrumb } from './breadcrumb';

const styles = StyleSheet.create({ wide: { width: 415 }, narrow: { width: 175, gap: 8 } });
const ignore = (): void => undefined;
const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  args: { accessibilityLabel: 'Current location', overflowLabel: 'Earlier locations' },
  argTypes: { items: { control: false }, size: { control: 'select', options: ['small', 'medium', 'large'] } },
};
export default meta;
type Story = WdioStory<StoryObj<typeof Breadcrumb>>;
export const Default: Story = {
  render: (args) => (
    <View style={styles.wide}>
      <Breadcrumb
        {...args}
        items={[
          { key: 'home', label: 'Workspace', onNavigate: ignore },
          { key: 'files', label: 'Documents' },
        ]}
      />
    </View>
  ),
};
export const NarrowTrail: Story = {
  tags: ['flex-third-wave'],
  render: function NarrowTrailScene(args) {
    const [route, setRoute] = useState('None');
    return (
      <View style={styles.narrow}>
        <Breadcrumb
          {...args}
          testID="current-trail"
          items={[
            { key: 'home', label: 'Workspace', onNavigate: () => setRoute('Workspace') },
            {
              key: 'projects',
              label: 'Archived projects',
              testID: 'archived-projects-crumb',
              onNavigate: () => setRoute('Archived projects'),
            },
            { key: 'migration', label: 'Migration and onboarding', onNavigate: () => setRoute('Migration and onboarding') },
            { key: 'documents', label: 'Documents' },
          ]}
        />
        <StoryStatus testID="breadcrumb-route">{route}</StoryStatus>
      </View>
    );
  },
  wdio: [
    desktopIt('BRC-004 collapsed destinations remain named native links', { requires: ['click'] }, async (context) => {
      const { browser, expect } = context;
      const { inWindowWith } = await import('../menu/menu.wdio.ts');
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await expect(await browser.$('~current-trail')).toHaveAttribute('name', 'Current location');
      await (await browser.$('=Earlier locations')).waitForDisplayed();
      await recordVisualReview(context, 'breadcrumb');
      await (await browser.$('=Earlier locations')).click();
      await inWindowWith(context, 'archived-projects-crumb', async () => {
        const hidden = await browser.$('~archived-projects-crumb');
        await expect(hidden).toHaveAttribute('name', 'Archived projects');
        await recordVisualReview(context, 'breadcrumb-overflow');
        const nativeLink = await context.desktop.session.findElement('accessibility id', 'archived-projects-crumb');
        await nativeLink.click();
      });
      await expect(await browser.$('~breadcrumb-route')).toHaveAttribute('name', 'Archived projects');
    }),
  ],
};
