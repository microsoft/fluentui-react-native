import { View } from 'react-native';

import * as renderer from 'react-test-renderer';

import { Link } from '../Link';

it('Link all props', () => {
  const tree = renderer.create(<Link content="Link all props" url="https://www.bing.com" />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Link with child', () => {
  const tree = renderer
    .create(
      <Link content="Link with child" url="https://www.bing.com">
        <View />
      </Link>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
