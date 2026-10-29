/** @jsxImportSource @fluentui-react-native/framework-base */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { WdioStory } from '@fluentui-react-native/storybook-desktop/testing';

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

type Story = WdioStory<StoryObj<typeof Card>>;

export const Default: Story = {};

export const NativeStructure: Story = {
  render: () => (
    <View style={styles.story}>
      <Card
        accessibilityLabel="Unavailable report"
        disabled
        selected
        layout="structured"
        testID="card-spec-root"
        header={{ accessible: true, accessibilityLabel: 'Report heading', testID: 'card-spec-header', children: <Text>Report</Text> }}
        content={{ accessible: true, accessibilityLabel: 'Report summary', testID: 'card-spec-content', children: <Text>Summary</Text> }}
        content02={{ accessible: true, accessibilityLabel: 'Report details', testID: 'card-spec-details', children: <Text>Details</Text> }}
        footer={{ children: <Button content="Help" testID="card-spec-help" /> }}
      />
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The geometry check temporarily requests the primary-screen top-left and room for the native preview and addons, allowing native screen constraints before restoring the original window bounds. Failures report window, preview, and section rectangles before restoration; Card styles and strict reading-order checks remain unchanged.',
      },
    },
  },
  wdio: {
    'CRD-002 renders structured sections in reading order': async ({ browser, expect }) => {
      expect(browser.capabilities.setWindowRect).toBe(true);
      const originalWindow = await browser.getWindowRect();
      const requestedWindow = {
        x: 0,
        y: 0,
        width: Math.max(originalWindow.width, 1024),
        height: Math.max(originalWindow.height, 768),
      };
      let returnedWindow: typeof originalWindow | undefined;
      let readBackWindow: typeof originalWindow | undefined;
      try {
        // The native setter positions before resizing; the old offset left too little room above the addons panel.
        returnedWindow = await browser.setWindowRect(requestedWindow.x, requestedWindow.y, requestedWindow.width, requestedWindow.height);
        readBackWindow = await browser.getWindowRect();
        const header = await browser.$('~card-spec-header');
        const content = await browser.$('~card-spec-content');
        const details = await browser.$('~card-spec-details');
        const help = await browser.$('~card-spec-help');
        await browser.waitUntil(async () => (await browser.getElementRect(await header.elementId)).height > 0);
        const headerRect = await browser.getElementRect(await header.elementId);
        const contentRect = await browser.getElementRect(await content.elementId);
        const detailsRect = await browser.getElementRect(await details.elementId);
        const helpRect = await browser.getElementRect(await help.elementId);
        expect(headerRect.height).toBeGreaterThan(0);
        expect(contentRect.height).toBeGreaterThan(0);
        expect(detailsRect.height).toBeGreaterThan(0);
        expect(helpRect.height).toBeGreaterThan(0);
        expect(contentRect.y).toBeGreaterThanOrEqual(headerRect.y + headerRect.height);
        expect(detailsRect.y).toBeGreaterThanOrEqual(contentRect.y + contentRect.height);
        expect(helpRect.y).toBeGreaterThanOrEqual(detailsRect.y + detailsRect.height);
      } catch (cause) {
        const observe = async (read: () => Promise<unknown>) => {
          const observedAt = new Date().toISOString();
          try {
            return { status: 'observed', observedAt, rect: await read() };
          } catch (error) {
            return {
              status: 'error',
              observedAt,
              message: (error instanceof Error ? error.message : String(error)).slice(0, 500),
            };
          }
        };
        const windowAtFailure = await observe(() => browser.getWindowRect());
        const elements: Record<string, unknown> = {};
        for (const [name, selector] of [
          ['preview', '~agentic-storybook-story-root'],
          ['header', '~card-spec-header'],
          ['content', '~card-spec-content'],
          ['details', '~card-spec-details'],
          ['help', '~card-spec-help'],
        ]) {
          elements[name] = await observe(async () => {
            const element = await browser.$(selector);
            return browser.getElementRect(await element.elementId);
          });
        }
        const diagnostics = {
          phase: 'before-window-restoration',
          originalWindow,
          requestedWindow,
          returnedWindow: returnedWindow === undefined ? { status: 'not-returned' } : returnedWindow,
          readBackWindow: readBackWindow === undefined ? { status: 'not-read' } : readBackWindow,
          windowAtFailure,
          elements,
        };
        throw new Error(`${cause instanceof Error ? cause.message : String(cause)}\nCRD-002 geometry: ${JSON.stringify(diagnostics)}`, {
          cause,
        });
      } finally {
        await browser.setWindowRect(originalWindow.x, originalWindow.y, originalWindow.width, originalWindow.height);
      }
    },
    'CRD-005 keeps a nested action enabled inside a disabled selectable surface': async ({ browser, expect }) => {
      const help = await browser.$('~card-spec-help');
      expect(await help.getTagName()).toBe('button');
      await expect(help).toBeEnabled();
    },
  },
};

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
      onPress={(): void => undefined}
      selected={false}
    />
  ),
};

export const Selected: Story = {
  render: () => (
    <Card
      accessibilityLabel="Open report"
      content={{
        children: <Text style={styles.body}>Quarterly summary with selected state.</Text>,
      }}
      layout="structured"
      onPress={(): void => undefined}
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
      onPress={(): void => undefined}
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
      onPress={(): void => undefined}
      size="large"
    />
  ),
};
