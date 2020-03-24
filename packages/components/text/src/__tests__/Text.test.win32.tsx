import * as React from 'react';
import { Text } from '..';
import * as renderer from 'react-test-renderer';

it('Text default', () => {
  const tree = renderer.create(<Text>Text default</Text>).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Text all props', () => {
  const tree = renderer
    .create(
      <Text disabled fontVariant="bodyStandard">
        All props
      </Text>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Text all tokens', () => {
  const BoldText = Text.customize({
    tokens: {
      fontFamily: 'Wingdings',
      fontWeight: '900',
      fontSize: 15
    }
  });
  const tree = renderer.create(<BoldText>All tokens</BoldText>).toJSON();
  expect(tree).toMatchSnapshot();
});
