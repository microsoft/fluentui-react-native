import * as React from 'react';
import { ToggleButton } from './ToggleButton';
import * as renderer from 'react-test-renderer';

it('Button default', () => {
  const tree = renderer.create(<ToggleButton content="Default Button" />).toJSON();
  expect(tree).toMatchSnapshot();
});
