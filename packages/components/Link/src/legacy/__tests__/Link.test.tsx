import { act } from 'react';
import { View } from 'react-native';

import * as renderer from 'react-test-renderer';

import { Link } from '../Link';

it('Link all props', () => {
  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(<Link content="Link all props" url="https://www.bing.com" />);
  });
  expect(component!.toJSON()).toMatchSnapshot();
});

it('Link with child', () => {
  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(
      <Link content="Link with child" url="https://www.bing.com">
        <View />
      </Link>,
    );
  });
  expect(component!.toJSON()).toMatchSnapshot();
});
