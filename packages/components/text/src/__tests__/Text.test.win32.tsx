import * as React from 'react';
import { Text } from '..';
import * as renderer from 'react-test-renderer';
import { checkReRender, checkRenderConsistency } from '@fluentui-react-native/test-tools';

it('Text default', () => {
  const tree = renderer.create(<Text>Text default</Text>).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Text all props', () => {
  const tree = renderer
    .create(
      <Text disabled variant="bodyStandard">
        All props
      </Text>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Text all tokens', () => {
  const BoldText = Text.customize({
    tokens: {
      fontFamily: 'Wingdings',
      fontWeight: '900',
      fontSize: 20,
    },
  });
  const tree = renderer.create(<BoldText>All tokens</BoldText>).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Text simple rendering does not invalidate styling', () => {
  checkRenderConsistency(() => <Text>Default</Text>);
  checkRenderConsistency(() => <Text disabled>Default</Text>);
  checkRenderConsistency(() => <Text variant="headerStandard">Default</Text>);
});

it('Text re-renders correctly', () => {
  checkReRender(() => <Text>Default</Text>);
  checkReRender(() => <Text disabled>Default</Text>);
  checkReRender(() => <Text variant="headerStandard">Default</Text>);
});

it('Text shares produced styles across multiple renders', () => {
  const style = { color: 'black' };
  checkRenderConsistency(() => <Text style={style}>Default</Text>);
  checkRenderConsistency(() => (
    <Text style={style} disabled>
      Default
    </Text>
  ));
  checkRenderConsistency(() => (
    <Text style={style} variant="headerStandard">
      Default
    </Text>
  ));
});

it('Text re-renders correctly with style', () => {
  const style = { color: 'blue' };
  checkReRender(() => <Text style={style}>Default</Text>);
  checkReRender(() => (
    <Text style={style} disabled>
      Default
    </Text>
  ));
  checkReRender(() => (
    <Text style={style} variant="headerStandard">
      Default
    </Text>
  ));
});
