import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { Switch } from '../Switch';

it('Switch Default', () => {
  const tree = renderer.create(<Switch label="Default Switch" />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Switch Disabled', () => {
  const tree = renderer.create(<Switch label="Default Switch Disabled" disabled />).toJSON();
  expect(tree).toMatchSnapshot();
});
