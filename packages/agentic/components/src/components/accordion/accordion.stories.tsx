/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import { desktopIt } from '@fluentui-react-native/storybook-desktop/testing';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

import { Accordion } from './accordion';
import type { AccordionLayout } from './accordion.types';
import { Input } from '../input/input';
import { Button } from '../button/button';
import { StoryStatus } from '../../common/StoryStatus.story-helpers';

type StoryGroupProps = {
  children: ReactNode;
  label: string;
};

const StoryGroup = ({ children, label }: StoryGroupProps) => (
  <View style={styles.group}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.row}>{children}</View>
  </View>
);

const layouts: readonly { label: string; value: AccordionLayout }[] = [
  { label: 'Chevron start', value: 'chevronStart' },
  { label: 'Chevron end', value: 'chevronEnd' },
];

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  args: {
    defaultExpanded: false,
    layout: 'chevronStart',
  },
  argTypes: {
    defaultExpanded: { control: 'boolean' },
    focused: { control: 'boolean' },
    layout: { control: 'select', options: layouts.map(({ value }) => value) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Accordion is a collapsible header/body composition for progressively disclosed content. The header owns focus, keyboard activation, and expanded state announcement while the body accepts arbitrary free-form content.',
      },
    },
  },
};

export default meta;

type Story = WdioStory<StoryObj<typeof Accordion>>;

function KeyboardDisclosureScene() {
  const [changes, setChanges] = useState(0);
  return (
    <View>
      <Input accessibilityLabel="Disclosure entry" testID="accordion-keyboard-entry" />
      <Accordion
        accessibilityLabel="Supporting details"
        title="Supporting details"
        onExpandedChange={() => setChanges((count) => count + 1)}
        bodyContent={{ children: <Button content="Body action" testID="accordion-keyboard-body-action" /> }}
      />
      <Button content="After disclosure" testID="accordion-keyboard-after" />
      <StoryStatus testID="accordion-keyboard-count">{String(changes)}</StoryStatus>
    </View>
  );
}

export const KeyboardDisclosure: Story = {
  render: () => <KeyboardDisclosureScene />,
  tags: ['desktop-focus'],
  parameters: {
    docs: {
      description: {
        story: 'Activation retains header focus; an explicit Tab enters the expanded body and Shift+Tab returns to the header.',
      },
    },
  },
  wdio: [
    desktopIt(
      'ACC-001 ACC-004 expands and collapses once per keyboard activation without transferring header focus',
      { requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, expect }) => {
        const { expectNativeState, focusByTab } = await import('../../common/desktopFocus.wdio.ts');
        const header = await browser.$('~accordion-header');
        await focusByTab(browser, 'accordion-keyboard-entry', 'accordion-header');
        expect(await header.getTagName()).toBe('button');
        expect(await header.getProperty('name')).toBe('Supporting details');
        expect(await header.getProperty('expanded')).toBe(false);
        await browser.keys('\uE00D');
        await expect(await browser.$('~accordion-keyboard-count')).toHaveText('1');
        expect(await header.getProperty('expanded')).toBe(true);
        await expectNativeState(browser, 'accordion-header', 'focused', true);
        await browser.keys('\uE004');
        await expectNativeState(browser, 'accordion-keyboard-body-action', 'focused', true);
        await browser.keys(['\uE008', '\uE004']);
        await expectNativeState(browser, 'accordion-header', 'focused', true);
        await browser.keys('\uE00D');
        await expect(await browser.$('~accordion-keyboard-count')).toHaveText('2');
        expect(await header.getProperty('expanded')).toBe(false);
        await expectNativeState(browser, 'accordion-header', 'focused', true);
      },
    ),
    desktopIt(
      'ACC-001 suppresses repeated Space keydown and preserves native activation phase',
      { requires: ['physical-click', 'keyboard', 'focus'] },
      async ({ browser, expect, platform }) => {
        const { focusByTab } = await import('../../common/desktopFocus.wdio.ts');
        await focusByTab(browser, 'accordion-keyboard-entry', 'accordion-header');
        try {
          await browser.performActions([
            {
              type: 'key',
              id: 'accordion-keyboard',
              actions: [
                { type: 'keyDown', value: '\uE00D' },
                { type: 'keyDown', value: '\uE00D' },
              ],
            },
          ]);
          await expect(await browser.$('~accordion-keyboard-count')).toHaveText(platform === 'macos' ? '1' : '0');
          await browser.performActions([{ type: 'key', id: 'accordion-keyboard', actions: [{ type: 'keyUp', value: '\uE00D' }] }]);
          await expect(await browser.$('~accordion-keyboard-count')).toHaveText('1');
          expect(await (await browser.$('~accordion-header')).getProperty('expanded')).toBe(true);
        } finally {
          await browser.releaseActions();
        }
      },
    ),
  ],
};

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The default Accordion renders a visible title, a default leading icon, and a collapsed body panel.',
      },
    },
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Layout">
        <Accordion layout="chevronStart" />
        <Accordion layout="chevronEnd" />
      </StoryGroup>
      <StoryGroup label="State">
        <Accordion defaultExpanded={false} />
        <Accordion defaultExpanded />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A grouped scan of the main layout and expanded-state variants.',
      },
    },
  },
};

export const Layout: Story = {
  render: () => (
    <StoryGroup label="Chevron layout">
      {layouts.map(({ value }) => (
        <Accordion key={value} layout={value} />
      ))}
    </StoryGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'ChevronStart places the expand affordance before the title; ChevronEnd pushes it to the trailing edge.',
      },
    },
  },
};

export const Expanded: Story = {
  render: () => (
    <View style={styles.story}>
      <Accordion defaultExpanded={false} />
      <Accordion
        defaultExpanded
        bodyContent={{
          children: (
            <View style={styles.bodyCard}>
              <Text style={styles.bodyCopy}>The body panel can hold any free-form React Native content.</Text>
            </View>
          ),
        }}
      />
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Expanded reveals the body content area and rotates the chevron down.',
      },
    },
  },
};

export const ExternallyDrivenExpansion: Story = {
  render: () => {
    const sections = ['General', 'Advanced'];
    const Group = () => {
      const [open, setOpen] = useState<string | null>('General');
      return (
        <View style={styles.story}>
          {sections.map((name) => (
            <Accordion
              key={name}
              expanded={open === name}
              onExpandedChange={(expanded: boolean) => setOpen(expanded ? name : null)}
              title={{ children: name }}
            />
          ))}
        </View>
      );
    };
    return <Group />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Supplying expanded makes the caller the owner of the state. Here one owner keeps at most a single section open by reacting to each header press through onExpandedChange.',
      },
    },
  },
};

export const BodyContent: Story = {
  render: () => (
    <Accordion
      defaultExpanded
      bodyContent={{
        children: (
          <View style={styles.bodyCard}>
            <Text style={styles.bodyCopy}>Supporting details</Text>
            <Text style={styles.bodyCopySecondary}>Body content can compose any other components, text, or layout.</Text>
          </View>
        ),
        testID: 'custom-body-content',
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'The bodyContent slot accepts any free-form View-compatible content.',
      },
    },
  },
};

export const Accessibility: Story = {
  args: {
    accessibilityLabel: 'Accordion section',
    focused: true,
    defaultExpanded: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use an explicit accessibilityLabel when the visible title is not sufficient, and the focused prop to preview the focus ring.',
      },
    },
  },
};

const styles = StyleSheet.create({
  bodyCard: {
    gap: 4,
    padding: 12,
  },
  bodyCopy: {
    fontSize: 13,
    fontWeight: '600',
  },
  bodyCopySecondary: {
    fontSize: 12,
  },
  group: {
    alignItems: 'flex-start',
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
});
