import { act } from 'react';

import * as renderer from 'react-test-renderer';

import { ToggleButton } from './ToggleButton';

it('ToggleButton default', () => {
  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(<ToggleButton>Default Button</ToggleButton>);
  });
  expect(component!.toJSON()).toMatchSnapshot();
});
