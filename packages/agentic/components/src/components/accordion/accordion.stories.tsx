/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';

import { Accordion } from './accordion';
import type { AccordionLayout } from './accordion.types';

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
    accessibilityLabel: 'Accordion title',
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

type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  tags: ['desktop-e2e'],
  parameters: {
    desktopDriver: {
      supportedPlatforms: ['macos'],
      version: 1,
      tests: [
        {
          id: 'accessibility-contract',
          title: 'Exposes disclosure semantics',
          steps: [
            { action: 'wait', target: { testId: 'accordion-header' } },
            { expect: { state: 'role', target: { testId: 'accordion-header' }, value: 'button' } },
            { expect: { state: 'accessibleName', target: { testId: 'accordion-header' }, value: 'Accordion title' } },
            { expect: { state: 'expanded', target: { testId: 'accordion-header' }, value: false } },
          ],
        },
        {
          id: 'activation-survival',
          title: 'Expands without a delayed native crash',
          requires: ['physical-click'],
          steps: [
            { action: 'click', target: { testId: 'accordion-header' } },
            { action: 'pause', durationMs: 3000 },
            { expect: { state: 'exists', target: { testId: 'accordion-header' }, value: true } },
            { expect: { state: 'expanded', target: { testId: 'accordion-header' }, value: true } },
          ],
        },
      ],
    } satisfies DesktopStoryTests,
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
    desktopDriver: {
      supportedPlatforms: ['macos'],
      tests: [],
      version: 1,
    } satisfies DesktopStoryTests,
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
    desktopDriver: {
      supportedPlatforms: ['macos'],
      tests: [],
      version: 1,
    } satisfies DesktopStoryTests,
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
    desktopDriver: {
      supportedPlatforms: ['macos'],
      tests: [],
      version: 1,
    } satisfies DesktopStoryTests,
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
              onExpandedChange={(expanded) => setOpen(expanded ? name : null)}
              title={{ children: name }}
            />
          ))}
        </View>
      );
    };
    return <Group />;
  },
  parameters: {
    desktopDriver: {
      supportedPlatforms: ['macos'],
      tests: [],
      version: 1,
    } satisfies DesktopStoryTests,
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
    desktopDriver: {
      supportedPlatforms: ['macos'],
      tests: [],
      version: 1,
    } satisfies DesktopStoryTests,
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
    desktopDriver: {
      supportedPlatforms: ['macos'],
      tests: [],
      version: 1,
    } satisfies DesktopStoryTests,
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
