/** @jsxImportSource @fluentui-react-native/framework-base */
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';

import { FocusVisual, createFocusVisualProps_unstable } from './focus-visual';

const meta: Meta<typeof FocusVisual> = {
  title: 'Primitives/Focus Visual',
  component: FocusVisual,
  parameters: {
    docs: {
      description: {
        component:
          'FocusVisual is an unstyled structural primitive that keeps one or two decorative rings mounted and changes only opacity when visibility changes.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof FocusVisual>;

const FocusTarget = ({ dual, testID, visible = true }: { dual?: boolean; testID?: string; visible?: boolean }) => (
  <View style={styles.target}>
    <Text>Focus target</Text>
    <FocusVisual
      {...createFocusVisualProps_unstable({
        borderRadius: 6,
        innerColor: dual ? '#ffffff' : undefined,
        innerWidth: dual ? 1 : undefined,
        outerColor: '#000000',
        outerWidth: 2,
        visible,
      })}
      testID={testID}
    />
  </View>
);

const AccordionRegressionTarget = () => {
  // Keep the unsafe RNW module out of normal Storybook startup; the authenticated test-only guard invokes this render last.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Accordion } = require('../../components/accordion/accordion') as typeof import('../../components/accordion/accordion');
  return <Accordion accessibilityLabel="Accordion title" />;
};

export const Default: Story = {
  render: () => <FocusTarget testID="agentic-storybook-focus-visual" />,
};

export const DualRing: Story = {
  render: () => <FocusTarget dual />,
  parameters: {
    docs: {
      description: {
        story: 'Supplying inner ring values creates a persistent dual-ring visual.',
      },
    },
  },
};

export const Visibility: Story = {
  render: () => (
    <View style={styles.row}>
      <FocusTarget />
      <FocusTarget visible={false} />
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Hidden rings stay mounted with zero opacity so focus changes never create native border visuals.',
      },
    },
  },
};

export const WindowsAccordionConsumerRegression: Story = {
  render: () => <AccordionRegressionTarget />,
  tags: ['desktop-e2e', 'desktop-test-only'],
  parameters: {
    desktopDriver: {
      supportedPlatforms: ['windows'],
      tests: [
        {
          id: 'focus-survival',
          title: 'Preserves Accordion semantics and survives focused teardown',
          requires: ['focus'],
          steps: [
            { action: 'wait', target: { testId: 'accordion-header' } },
            { expect: { state: 'role', target: { testId: 'accordion-header' }, value: 'button' } },
            { expect: { state: 'accessibleName', target: { testId: 'accordion-header' }, value: 'Accordion title' } },
            { expect: { state: 'expanded', target: { testId: 'accordion-header' }, value: false } },
            { action: 'focus', target: { testId: 'accordion-header' } },
            { action: 'pause', durationMs: 3000 },
            { expect: { state: 'exists', target: { testId: 'accordion-header' }, value: true } },
            { expect: { state: 'focused', target: { testId: 'accordion-header' }, value: true } },
          ],
        },
      ],
      traversePlatforms: [],
      version: 1,
    } satisfies DesktopStoryTests,
    docs: {
      description: {
        story:
          'A Windows-only, test-only consumer regression. The driver mounts Accordion last because registering its full Storybook module remains unsafe in the RNW 0.81 catalog.',
      },
    },
  },
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  target: {
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 6,
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 120,
    padding: 8,
    position: 'relative',
  },
});
