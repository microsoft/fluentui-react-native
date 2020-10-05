import * as React from 'react';
import { CompoundButton } from './CompoundButton';
import * as renderer from 'react-test-renderer';

it('CompoundButton default', () => {
  const tree = renderer.create(<CompoundButton content="Default Button" secondaryContent="sublabel" />).toJSON();
  expect(tree).toMatchSnapshot();
});
