import { Text } from '@fluentui-react-native/text';
import * as renderer from 'react-test-renderer';

import { Stack } from '..';

it('Stack with tokens', () => {
  const tree = renderer
    .create(
      <Stack maxWidth={400} gap={8} padding={16}>
        <Text>Hello</Text>
        <Text>Hello</Text>
        <Text>Hello</Text>
      </Stack>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
