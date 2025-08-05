import * as renderer from 'react-test-renderer';

import { Separator } from '..';

it('Separator default', () => {
  const tree = renderer.create(<Separator />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Separator all props & tokens', () => {
  const CustomSeparator = Separator.customize({ separatorWidth: 15, color: 'red' });
  const tree = renderer.create(<CustomSeparator vertical />).toJSON();
  expect(tree).toMatchSnapshot();
});
