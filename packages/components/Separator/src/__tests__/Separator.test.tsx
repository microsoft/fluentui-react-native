import { act } from 'react';

import * as renderer from 'react-test-renderer';

import { Separator } from '..';

it('Separator default', () => {
  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(<Separator />);
  });
  expect(component!.toJSON()).toMatchSnapshot();
});

it('Separator all props & tokens', () => {
  const CustomSeparator = Separator.customize({ separatorWidth: 15, color: 'red' });
  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(<CustomSeparator vertical />);
  });
  expect(component!.toJSON()).toMatchSnapshot();
});
