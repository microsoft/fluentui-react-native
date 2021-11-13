import * as React from 'react';
import { FabButton } from './FabButton';
import * as renderer from 'react-test-renderer';

it('ToggleButton default', () => {
  const tree = renderer.create(<FabButton content="Default Button" />).toJSON();
  expect(tree).toMatchSnapshot();
});
