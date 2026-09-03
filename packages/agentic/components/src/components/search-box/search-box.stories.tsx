/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react-native';
import type { DesktopStoryTests } from '@fluentui-react-native/desktop-driver/authoring';

import { SearchBox } from './search-box';
import type { SearchBoxSize, SearchBoxVariant } from './search-box.types';

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

const variants: readonly { label: string; value: SearchBoxVariant }[] = [
  { label: 'Outline', value: 'outline' },
  { label: 'Underline', value: 'underline' },
];

const sizes: readonly { label: string; value: SearchBoxSize }[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

const testID = 'agentic-storybook-search-box';

const meta: Meta<typeof SearchBox> = {
  title: 'Components/SearchBox',
  component: SearchBox,
  args: {
    accessibilityLabel: 'Search files',
    placeholder: 'Search files',
    size: 'medium',
    testID,
    variant: 'outline',
  },
  argTypes: {
    size: { control: 'select', options: sizes.map(({ value }) => value) },
    variant: { control: 'select', options: variants.map(({ value }) => value) },
  },
  parameters: {
    docs: {
      description: {
        component:
          'SearchBox is a query field. It delegates the field chrome to Input and adds a leading search icon, a clear button that appears only while a query is present, and search semantics for submitting and abandoning a query.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof SearchBox>;

export const Default: Story = {
  tags: ['desktop-e2e'],
  parameters: {
    desktopDriver: {
      version: 1,
      tests: [
        {
          id: 'type-and-clear',
          title: 'Reveals the clear button while a query is present and clears it on demand',
          requires: ['keyboard'],
          steps: [
            { action: 'wait', target: { testId: 'agentic-storybook-search-box' } },
            { expect: { state: 'role', target: { testId: 'agentic-storybook-search-box' }, value: 'textbox' } },
            { expect: { state: 'accessibleName', target: { testId: 'agentic-storybook-search-box' }, value: 'Search files' } },
            { expect: { state: 'exists', target: { testId: 'search-box-clear-button' }, value: false } },
            { action: 'type', target: { testId: 'agentic-storybook-search-box' }, text: 'quarterly' },
            { expect: { state: 'value', target: { testId: 'agentic-storybook-search-box' }, value: 'quarterly' } },
            { action: 'wait', target: { testId: 'search-box-clear-button' } },
            { expect: { state: 'accessibleName', target: { testId: 'search-box-clear-button' }, value: 'Clear search' } },
            { action: 'click', target: { testId: 'search-box-clear-button' } },
            { expect: { state: 'value', target: { testId: 'agentic-storybook-search-box' }, value: '' } },
            { expect: { state: 'exists', target: { testId: 'search-box-clear-button' }, value: false } },
            { expect: { state: 'focused', target: { testId: 'agentic-storybook-search-box' }, value: true } },
          ],
        },
        {
          id: 'escape-clears',
          title: 'Escape clears a non-empty query from the keyboard',
          requires: ['keyboard'],
          steps: [
            { action: 'wait', target: { testId: 'agentic-storybook-search-box' } },
            { action: 'type', target: { testId: 'agentic-storybook-search-box' }, text: 'reports' },
            { expect: { state: 'value', target: { testId: 'agentic-storybook-search-box' }, value: 'reports' } },
            { action: 'keys', value: ['Escape'] },
            { expect: { state: 'value', target: { testId: 'agentic-storybook-search-box' }, value: '' } },
          ],
        },
        {
          id: 'disabled-blocks-editing',
          title: 'A disabled search box reports disabled and refuses input',
          requires: ['keyboard'],
          steps: [
            { action: 'setArgs', args: { disabled: true, value: 'locked' } },
            { action: 'wait', target: { testId: 'agentic-storybook-search-box' } },
            { expect: { state: 'enabled', target: { testId: 'agentic-storybook-search-box' }, value: false } },
            { action: 'type', target: { testId: 'agentic-storybook-search-box' }, text: 'ignored' },
            { expect: { state: 'value', target: { testId: 'agentic-storybook-search-box' }, value: 'locked' } },
          ],
        },
      ],
    } satisfies DesktopStoryTests,
  },
};

export const Overview: Story = {
  render: () => (
    <View style={styles.story}>
      <StoryGroup label="Variant">
        {variants.map(({ label, value }) => (
          <SearchBox key={value} accessibilityLabel={`${label} search`} placeholder={label} variant={value} />
        ))}
      </StoryGroup>
      <StoryGroup label="Size">
        {sizes.map(({ label, value }) => (
          <SearchBox key={value} accessibilityLabel={`${label} search`} defaultValue="quarterly" placeholder={label} size={value} />
        ))}
      </StoryGroup>
      <StoryGroup label="State">
        <SearchBox accessibilityLabel="Disabled search" disabled placeholder="Disabled" value="quarterly" />
        <SearchBox accessibilityLabel="Read only search" placeholder="Read only" readOnly value="quarterly" />
      </StoryGroup>
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A quick scan of the variant, size, and state combinations. The clear button appears only where a query is present.',
      },
    },
  },
};

const ControlledSearchBox = () => {
  const [query, setQuery] = React.useState('');
  const [submitted, setSubmitted] = React.useState('');

  return (
    <View style={styles.story}>
      <SearchBox
        accessibilityLabel="Search files"
        onChangeText={setQuery}
        onClear={() => setSubmitted('')}
        onSearch={setSubmitted}
        placeholder="Search files"
        value={query}
      />
      <Text>{`Query: ${query || '(empty)'}`}</Text>
      <Text>{`Submitted: ${submitted || '(none)'}`}</Text>
    </View>
  );
};

export const Controlled: Story = {
  render: () => <ControlledSearchBox />,
  parameters: {
    docs: {
      description: {
        story: 'The caller owns the query. Return reports the submitted value; the clear button and Escape both empty it.',
      },
    },
  },
};

export const Underline: Story = {
  args: {
    defaultValue: 'quarterly',
    placeholder: 'Underline',
    variant: 'underline',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Unavailable',
    value: 'quarterly',
  },
};

export const ReadOnly: Story = {
  args: {
    placeholder: 'Read only',
    readOnly: true,
    value: 'quarterly',
  },
};

export const WithoutClearButton: Story = {
  args: {
    clearButton: null,
    defaultValue: 'quarterly',
    placeholder: 'No clear button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Removing the clear button leaves Escape as the keyboard path to an empty query.',
      },
    },
  },
};

const styles = StyleSheet.create({
  group: {
    alignItems: 'flex-start',
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    alignItems: 'stretch',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  story: {
    alignItems: 'stretch',
    gap: 16,
    width: '100%',
  },
});
