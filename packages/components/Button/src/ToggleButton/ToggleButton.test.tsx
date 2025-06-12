import * as React from 'react';

import * as renderer from 'react-test-renderer';

import { ToggleButton } from './ToggleButton';

it('ToggleButton default', () => {
  const tree = renderer.create(<ToggleButton>Default Button</ToggleButton>).toJSON();
  expect(tree).toMatchSnapshot();
});
