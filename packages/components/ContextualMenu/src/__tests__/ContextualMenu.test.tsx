import { act } from 'react';

import * as renderer from 'react-test-renderer';

import { ContextualMenu } from '..';

it('ContextualMenu default props', () => {
  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(<ContextualMenu />);
  });
  expect(component!.toJSON()).toMatchSnapshot();
});
