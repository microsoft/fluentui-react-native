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

it('Text all tokens', () => {
  const tree = renderer
    .create(
      <Text color="orange" fontFamily="Wingdings" fontSize={15} fontWeight="bold">
        All tokens
      </Text>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
