import * as React from 'react';
import { Separator } from '..';
import * as renderer from 'react-test-renderer';

it('Separator default', () => {
  const tree = renderer.create(<Separator />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Separator all props & tokens', () => {
  const CustomSeparator = Separator.customize({ tokens: { separatorWidth: 15, color: 'red' } });
  const tree = renderer.create(<CustomSeparator vertical />).toJSON();
  expect(tree).toMatchSnapshot();
});
