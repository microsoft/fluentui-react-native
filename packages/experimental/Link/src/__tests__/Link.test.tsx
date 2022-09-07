import * as React from 'react';
import { Link } from '..';
import * as renderer from 'react-test-renderer';

it('Link all props', () => {
  const tree = renderer.create(<Link url="https://www.bing.com">Link to Bing</Link>).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Link with child', () => {
  const tree = renderer
    .create(
      <Link url="https://www.bing.com">Link to bing</Link>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
