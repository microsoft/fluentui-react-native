import * as renderer from 'react-test-renderer';

import { Callout } from '..';

it('Callout default props', () => {
  const tree = renderer.create(<Callout />).toJSON();
  expect(tree).toMatchSnapshot();
});
