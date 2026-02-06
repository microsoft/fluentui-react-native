import { act } from 'react';

import * as renderer from 'react-test-renderer';

import { Button } from './Button';

it('Button default', () => {
  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(<Button content="Default Button" />);
  });
  expect(component!.toJSON()).toMatchSnapshot();
});
