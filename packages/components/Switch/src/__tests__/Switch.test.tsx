import * as React from 'react';

import * as renderer from 'react-test-renderer';

import { Switch } from '../Switch';

// mocks out setTimeout and other timer functions with mock functions , test will fail without this as we're using Animated API
jest.useFakeTimers();

it('Switch Default', () => {
  const tree = renderer.create(<Switch label="Default Switch" />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Switch Disabled', () => {
  const tree = renderer.create(<Switch label="Default Switch Disabled" disabled />).toJSON();
  expect(tree).toMatchSnapshot();
});
