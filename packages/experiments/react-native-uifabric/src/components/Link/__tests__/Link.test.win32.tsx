import * as React from 'react';
import * as ReactNative from 'react-native';
import { Link } from '../../Link';
import * as renderer from 'react-test-renderer';

it('Link all props', () => {
  const tree = renderer.create(<Link content="Link all props" url="https://www.bing.com" />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Link with child', () => {
  const tree = renderer
    .create(
      <Link content="Link with child" url="https://www.bing.com">
        <ReactNative.View />
      </Link>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
