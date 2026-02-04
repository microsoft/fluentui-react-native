import { act } from 'react';

import * as renderer from 'react-test-renderer';

import { Switch } from '../Switch';

// mocks out setTimeout and other timer functions with mock functions , test will fail without this as we're using Animated API
jest.useFakeTimers();

it('Switch Default', () => {
  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(<Switch label="Default Switch" />);
  });
  expect(component!.toJSON()).toMatchSnapshot();
});

it('Switch Disabled', () => {
  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(<Switch label="Default Switch Disabled" disabled />);
  });
  expect(component!.toJSON()).toMatchSnapshot();
});
