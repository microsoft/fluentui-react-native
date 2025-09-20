import * as renderer from 'react-test-renderer';

import { ContextualMenu } from '..';

it('ContextualMenu default props', () => {
  const tree = renderer.create(<ContextualMenu />).toJSON();
  expect(tree).toMatchSnapshot();
});
