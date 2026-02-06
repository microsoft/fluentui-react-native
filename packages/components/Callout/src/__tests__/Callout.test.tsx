import { act } from 'react';

import * as renderer from 'react-test-renderer';

import { Callout } from '..';

it('Callout default props', () => {
  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(<Callout />);
  });
  expect(component!.toJSON()).toMatchSnapshot();
});
