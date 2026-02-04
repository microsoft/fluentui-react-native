import { act } from 'react';

import * as renderer from 'react-test-renderer';

import { CompoundButton } from './CompoundButton';

it('CompoundButton default', () => {
  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(<CompoundButton secondaryContent="sublabel">Default Button</CompoundButton>);
  });
  expect(component!.toJSON()).toMatchSnapshot();
});
