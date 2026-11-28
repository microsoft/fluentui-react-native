import { useState } from 'react';
import { Text, View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';
import { Button } from '../button/button';
import { Input } from '../input/input';
import { CompoundButton } from './compound-button';

const meta: Meta<typeof CompoundButton> = {
  title: 'Components/CompoundButton',
  component: CompoundButton,
  args: { content: 'Archive files', secondaryContent: 'Keep a searchable copy' },
  argTypes: {
    appearance: { control: 'select', options: ['primary', 'secondary', 'outline', 'subtle'] },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
  parameters: { docs: { description: { component: 'One command with a visible supporting line.' } } },
};
export default meta;

type Story = WdioStory<StoryObj<typeof CompoundButton>>;

export const Default: Story = {};

function ConstrainedExample() {
  const [height, setHeight] = useState<number>();
  const [presses, setPresses] = useState(0);
  return (
    <View style={{ width: 176, gap: 4 }}>
      <Input accessibilityLabel="Before archive" testID="compound-button-before" />
      <CompoundButton
        appearance="primary"
        content="Archive selected files"
        secondaryContent="Keep a searchable copy"
        secondaryContentStyle={{ fontSize: 28, lineHeight: 36 }}
        style={{ alignSelf: 'stretch' }}
        onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
        onPress={() => setPresses((count) => count + 1)}
        testID="compound-button-archive"
      />
      <Button content="After archive" testID="compound-button-after" />
      <Text>{height === undefined ? 'Waiting for layout' : `Measured height: ${Math.round(height)}; medium minimum: 60`}</Text>
      <StoryStatus testID="compound-button-presses">{`Commands: ${presses}`}</StoryStatus>
    </View>
  );
}

export const Constrained: Story = {
  tags: ['flex-first-wave'],
  render: () => <ConstrainedExample />,
  parameters: { docs: { description: { story: 'Verify wrapping and growth beyond the minimum with enlarged supporting text.' } } },
  wdio: [
    desktopIt('CPB-002 CPB-004 grows beyond its minimum and exposes one named button', async (context) => {
      const { browser, expect } = context;
      const command = await browser.$('~compound-button-archive');
      await expect(command).toHaveAttribute('name', 'Archive selected files');
      expect(await command.getTagName()).toBe('button');
      expect((await browser.getElementRect(await command.elementId)).height).toBeGreaterThan(60);
      const { recordVisualReview } = await import('../../common/recordVisualReview.wdio.ts');
      await recordVisualReview(context, 'compound-button-wrap');
    }),
    desktopIt('CPB-003 activates the compound command once', { requires: ['click'] }, async ({ browser, expect }) => {
      await (await browser.$('~compound-button-archive')).click();
      await expect(await browser.$('~compound-button-presses')).toHaveAttribute('name', 'Commands: 1');
    }),
    desktopIt('CPB-004 exposes the supporting line as native help on macOS', { platforms: ['macos'] }, async ({ desktop, expect }) => {
      const { result: search } = await desktop.session.find({ automationId: 'compound-button-archive' });
      expect(search.outcome).toBe('unique');
      const { result: observation } = await desktop.session.observe({ within: search.matches[0].ref, format: 'nodes', facts: ['help'] });
      expect(observation.nodes?.[0]).toMatchObject({ name: 'Archive selected files', help: 'Keep a searchable copy' });
      expect(await desktop.session.findElements('link text', 'Keep a searchable copy')).toHaveLength(0);
    }),
    desktopIt(
      'CPB-003 uses one keyboard stop and dispatches one command',
      { requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, expect }) => {
        const { expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
        await focusByTab(browser, 'compound-button-before', 'compound-button-archive');
        await browser.keys('\uE00D');
        await expect(await browser.$('~compound-button-presses')).toHaveAttribute('name', 'Commands: 1');
        await expectNativeState(browser, 'compound-button-archive', 'focused', true);
        await browser.keys('\uE004');
        await expectNativeState(browser, 'compound-button-after', 'focused', true);
      },
    ),
  ],
};
