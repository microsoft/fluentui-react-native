import { act } from 'react';

import { Text } from '@fluentui-react-native/text';
import * as renderer from 'react-test-renderer';

import { Stack } from '..';

it('Stack with tokens', () => {
  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(
      <Stack maxWidth={400} gap={8} padding={16}>
        <Text>Hello</Text>
        <Text>Hello</Text>
        <Text>Hello</Text>
      </Stack>,
    );
  });
  expect(component!.toJSON()).toMatchSnapshot();
});
