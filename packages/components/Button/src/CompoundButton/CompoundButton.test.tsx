import * as renderer from 'react-test-renderer';

import { CompoundButton } from './CompoundButton';

it('CompoundButton default', () => {
  const tree = renderer.create(<CompoundButton secondaryContent="sublabel">Default Button</CompoundButton>).toJSON();
  expect(tree).toMatchSnapshot();
});
