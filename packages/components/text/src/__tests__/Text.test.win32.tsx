import * as React from 'react';
import { Text } from '..';
import * as renderer from 'react-test-renderer';

it('Text default', () => {
  const tree = renderer.create(<Text>Text default</Text>).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Text all props', () => {
  const tree = renderer.create(<Text disabled>All props</Text>).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Text variant tokens', () => {
  const tree = renderer
    .create(
      <Text color="orange" fontVariant="largeStandard">
        Variant tokens
      </Text>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
