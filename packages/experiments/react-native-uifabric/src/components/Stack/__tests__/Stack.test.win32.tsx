import * as React from 'react';
import { Stack } from '../../Stack';
import { Text } from '../../Text';
import * as renderer from 'react-test-renderer';

it('Stack with tokens', () => {
  const tree = renderer
    .create(
      <Stack maxWidth={400} gap={8} padding={16}>
        <Text>Hello</Text>
        <Text>Hello</Text>
        <Text>Hello</Text>
      </Stack>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
