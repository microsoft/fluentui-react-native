/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';

import { Button } from '../button/button';
import { Card } from './card';
import type { CardDirection, CardLayout, CardPadding, CardSize } from './card.types';

type StoryGroupProps = {
  children: ReactNode;
  label: string;
};

const StoryGroup = ({ children, label }: StoryGroupProps) => (
  <View style={styles.group}>
    <Text style={styles.groupLabel}>{label}</Text>
    <View style={styles.cardRow}>{children}</View>
  </View>
);

const sizes: readonly { label: string; value: CardSize }[] = [
  { label: 'Small', value: 'small' },
  { label: 'Large', value: 'large' },
];

const paddings: readonly { label: string; value: CardPadding }[] = [
  { label: 'Default', value: 'default' },
  { label: 'None', value: 'none' },
];

const layouts: readonly { label: string; value: CardLayout }[] = [
  { label: 'Default', value: 'default' },
  { label: 'Nested', value: 'nested' },
  { label: 'Structured', value: 'structured' },
];

const directions: readonly { label: string; value: CardDirection }[] = [
  { label: 'Vertical', value: 'vertical' },
  { label: 'Horizontal', value: 'horizontal' },
];

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#d6d6d6',
    borderRadius: 12,
    height: 24,
    width: 24,
  },
  body: {
    fontSize: 14,
  },
  cardRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  group: {
    alignItems: 'flex-start',
    gap: 8,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  headerText: {
    gap: 2,
  },
  meta: {
    fontSize: 12,
  },
  preview: {
    backgroundColor: '#e9e9e9',
    height: 96,
    width: 160,
  },
  story: {
    alignItems: 'flex-start',
    gap: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  args: {
    accessibilityLabel: 'Open report',
    direction: 'vertical',
    layout: 'structured',
    padding: 'default',
    size: 'small',
    content: {
      children: <Text style={styles.body}>Quarterly summary with highlights and supporting details.</Text>,
    },
    footer: {
      children: (
        <View style={styles.footerRow}>
          <Button content="Open" />
          <Button content="Share" />
        </View>
      ),
    },
    header: {
      children: (
        <View style={styles.headerRow}>
          <View style={styles.avatar} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Q3 report</Text>
            <Text style={styles.meta}>Updated 2 hours ago</Text>
          </View>
        </View>
      ),
    },
  },
  argTypes: {
    direction: { control: 'select', options: directions.map(({ value }) => value) },
    layout: { control: 'select', options: layouts.map(({ value }) => value) },
    padding: { control: 'select', options: paddings.map(({ value }) => value) },
    size: { control: 'select', options: sizes.map(({ value }) => value) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Card groups related content and actions into a bounded surface. Use it for repeatable content units, not as a decorative box.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Layout">
        {layouts.map(({ label, value }) => (
          <Card
            key={value}
            accessibilityLabel={`Overview, ${label}`}
            content={{ children: <Text style={styles.body}>{label} layout content</Text> }}
            header={
              value === 'default'
                ? undefined
                : {
                    children: <Text style={styles.title}>{label} header</Text>,
                  }
            }
            footer={
              value === 'structured'
                ? {
                    children: <Button accessibilityLabel={`${label} footer action`} content="Action" />,
                  }
                : undefined
            }
            layout={value}
            size="small"
          />
        ))}
      </StoryGroup>
      <StoryGroup label="Size">
        {sizes.map(({ label, value }) => (
          <Card
            key={value}
            accessibilityLabel={`Size ${label}`}
            content={{ children: <Text style={styles.body}>{label} card</Text> }}
            layout="default"
            size={value}
          />
        ))}
      </StoryGroup>
    </View>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card
      accessibilityLabel="Open report"
      content={{
        children: <Text style={styles.body}>Quarterly summary with nested actions.</Text>,
      }}
      footer={{
        children: (
          <View style={styles.footerRow}>
            <Button accessibilityLabel="Edit report" content="Edit" />
            <Button accessibilityLabel="Share report" content="Share" />
          </View>
        ),
      }}
      header={{
        children: (
          <View style={styles.headerRow}>
            <View style={styles.avatar} />
            <View style={styles.headerText}>
              <Text style={styles.title}>Q3 report</Text>
              <Text style={styles.meta}>Updated 2 hours ago</Text>
            </View>
          </View>
        ),
      }}
      layout="structured"
      onPress={() => undefined}
      selected={false}
      testID="agentic-storybook-card"
    />
  ),
  tags: ['desktop-e2e'],
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'accessibility-contract',
          title: 'Exposes interactive card semantics',
          steps: [
            { action: 'wait', target: { testId: 'agentic-storybook-card-interactive' } },
            { expect: { state: 'role', target: { testId: 'agentic-storybook-card-interactive' }, value: 'button' } },
            {
              expect: {
                state: 'accessibleName',
                target: { testId: 'agentic-storybook-card-interactive' },
                value: 'Open report',
              },
            },
            { expect: { state: 'selected', target: { testId: 'agentic-storybook-card-interactive' }, value: false } },
          ],
          platformVariants: {
            win32: {
              steps: [
                { action: 'wait', target: { testId: 'agentic-storybook-card-interactive' } },
                { expect: { state: 'role', target: { testId: 'agentic-storybook-card-interactive' }, value: 'button' } },
                {
                  expect: {
                    state: 'accessibleName',
                    target: { testId: 'agentic-storybook-card-interactive' },
                    value: 'Open report',
                  },
                },
                { expect: { state: 'enabled', target: { testId: 'agentic-storybook-card-interactive' }, value: true } },
              ],
            },
          },
        },
        {
          id: 'focus-survival',
          title: 'Survives programmatic focus without a delayed native crash',
          requires: ['focus'],
          steps: [
            { action: 'focus', target: { testId: 'agentic-storybook-card-interactive' } },
            { action: 'pause', durationMs: 3000 },
            { expect: { state: 'exists', target: { testId: 'agentic-storybook-card-interactive' }, value: true } },
            { expect: { state: 'focused', target: { testId: 'agentic-storybook-card-interactive' }, value: true } },
          ],
        },
      ],
    } satisfies DesktopStoryTests,
  },
};

export const Selected: Story = {
  render: () => (
    <Card
      accessibilityLabel="Open report"
      content={{
        children: <Text style={styles.body}>Quarterly summary with selected state.</Text>,
      }}
      layout="structured"
      onPress={() => undefined}
      selected
      header={{
        children: (
          <View style={styles.headerRow}>
            <View style={styles.avatar} />
            <View style={styles.headerText}>
              <Text style={styles.title}>Q3 report</Text>
              <Text style={styles.meta}>Selected item</Text>
            </View>
          </View>
        ),
      }}
    />
  ),
};

export const ExternallyDrivenSelection: Story = {
  render: () => {
    const reports = ['Q3 report', 'Q4 forecast'];
    const Picker = () => {
      const [selected, setSelected] = useState<readonly string[]>([]);
      return (
        <View style={styles.story}>
          {reports.map((name) => (
            <Card
              key={name}
              accessibilityLabel={name}
              content={{ children: <Text style={styles.body}>{name}</Text> }}
              layout="structured"
              onPress={() => setSelected(selected.includes(name) ? selected.filter((current) => current !== name) : [...selected, name])}
              selected={selected.includes(name)}
            />
          ))}
          <Text style={styles.meta}>{selected.length} selected</Text>
        </View>
      );
    };
    return <Picker />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'A multi-select grid owns which cards are chosen. Each card renders the selected value it is given and reports presses through onPress.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <Card
      accessibilityLabel="Unavailable report"
      content={{
        children: <Text style={styles.body}>This card is unavailable.</Text>,
      }}
      layout="structured"
      onPress={() => undefined}
      disabled
      header={{
        children: (
          <View style={styles.headerRow}>
            <View style={styles.avatar} />
            <View style={styles.headerText}>
              <Text style={styles.title}>Archived report</Text>
              <Text style={styles.meta}>Disabled</Text>
            </View>
          </View>
        ),
      }}
    />
  ),
};

export const Nested: Story = {
  render: () => (
    <Card
      content={{ children: <Text style={styles.body}>Primary content</Text> }}
      content02={{
        children: <View style={styles.preview} />,
      }}
      layout="nested"
      padding="default"
    />
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Card
      accessibilityLabel="Open report"
      content={{ children: <Text style={styles.body}>Summary</Text> }}
      direction="horizontal"
      footer={{ children: <Button content="Open" /> }}
      header={{ children: <Text style={styles.title}>Q3 report</Text> }}
      layout="structured"
      onPress={() => undefined}
      size="large"
    />
  ),
};
