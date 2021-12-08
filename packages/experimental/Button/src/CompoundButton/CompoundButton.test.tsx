import * as React from 'react';
import { CompoundButton } from './CompoundButton';
import * as renderer from 'react-test-renderer';

it('CompoundButton default', () => {
  const tree = renderer.create(<CompoundButton secondaryText="sublabel">Default Button</CompoundButton>).toJSON();
  expect(tree).toMatchSnapshot();
});
