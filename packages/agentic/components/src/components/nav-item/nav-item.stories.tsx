import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { NavItem } from './nav-item';

const styles = StyleSheet.create({ scene: { width: 265, gap: 5 } });
const meta: Meta<typeof NavItem> = {
  title: 'Components/NavItem',
  component: NavItem,
  args: { value: 'projects', label: 'Projects' },
  argTypes: { density: { control: 'select', options: ['comfortable', 'compact'] }, type: { control: false } },
};
export default meta;
type Story = WdioStory<StoryObj<typeof NavItem>>;
export const Default: Story = {
  render: ({ label, value, density, disabled }) => (
    <NavItem label={label} value={value} density={density} disabled={disabled} onNavigate={() => undefined} />
  ),
};
export const ProjectRoutes: Story = {
  tags: ['flex-third-wave'],
  render: function ProjectRoutesScene() {
    const [expanded, setExpanded] = useState(false);
    const [route, setRoute] = useState('files');
    const [pinned, setPinned] = useState(0);
    return (
      <View style={styles.scene}>
        <NavItem
          label="Projects"
          value="projects"
          type="category"
          expanded={expanded}
          carriedCurrent={route === 'files'}
          onExpandedChange={setExpanded}
          primary={{ testID: 'nav-projects' }}
          secondaryActions={[{ key: 'pin', label: 'Pin', testID: 'nav-projects-pin', onPress: () => setPinned((n) => n + 1) }]}
        />
        {expanded && (
          <NavItem
            label="Project files and documents"
            value="files"
            current={route === 'files'}
            currentDescription="Current page"
            nesting="subitem"
            density="compact"
            onNavigate={setRoute}
            primary={{ testID: 'nav-files' }}
          />
        )}
        <NavItem
          label="Team settings"
          value="settings"
          current={route === 'settings'}
          currentDescription="Current page"
          onNavigate={setRoute}
          primary={{ testID: 'nav-settings' }}
        />
        <StoryStatus testID="nav-result">{`${route}; ${expanded ? 'expanded' : 'collapsed'}; pins: ${pinned}`}</StoryStatus>
      </View>
    );
  },
  wdio: [
    desktopIt('NVI-004 only the primary category action changes disclosure', { requires: ['click'] }, async (context) => {
      const { browser, expect } = context;
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await recordVisualReview(context, 'nav-item');
      await (await browser.$('~nav-projects-pin')).click();
      await expect(await browser.$('~nav-result')).toHaveAttribute('name', 'files; collapsed; pins: 1');
      await (await browser.$('~nav-projects')).click();
      await expect(await browser.$('~nav-result')).toHaveAttribute('name', 'files; expanded; pins: 1');
      await expect(await browser.$('~nav-files')).toHaveAttribute('name', 'Project files and documents');
      await recordVisualReview(context, 'nav-item-open');
      const route = await context.desktop.session.findElement('accessibility id', 'nav-settings');
      await route.click();
      await expect(await browser.$('~nav-result')).toHaveAttribute('name', 'settings; expanded; pins: 1');
    }),
  ],
};
