import * as React from 'react';

export interface FixtureComponentProps {
  testID?: string;
  children?: string;
  disabled?: boolean;
  label?: string;
}

export function ButtonFixture(props: FixtureComponentProps): React.ReactElement {
  return React.createElement(
    'Pressable',
    {
      testID: props.testID,
      accessibilityRole: 'button',
      accessibilityLabel: props.children ?? 'Button',
      accessibilityState: { disabled: props.disabled === true },
      style: { backgroundColor: '#4472C4', padding: 8 },
    },
    React.createElement('Text', { style: { color: '#FFFFFF' } }, props.children ?? 'Button'),
  );
}

export function ToyFixture(props: FixtureComponentProps): React.ReactElement {
  return React.createElement(
    'View',
    {
      testID: props.testID,
      accessibilityRole: 'text',
      accessibilityLabel: props.label ?? 'Toy',
      style: { margin: 6, borderRadius: 2 },
    },
    React.createElement('Text', null, props.label ?? 'Toy'),
  );
}
