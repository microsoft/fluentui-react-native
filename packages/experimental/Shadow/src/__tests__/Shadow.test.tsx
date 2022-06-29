import * as React from 'react';
import { Text } from 'react-native';
import { Shadow } from '../Shadow';
import * as renderer from 'react-test-renderer';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';

describe('Shadow component tests', () => {
  it('Shadow default', () => {
    const tree = renderer
      .create(
        <Shadow>
          <Text>Shadow default test</Text>
        </Shadow>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow simple rendering does not invalidate styling', () => {
    checkRenderConsistency(
      () => (
        <Shadow>
          <Text>Shadow render test</Text>
        </Shadow>
      ),
      2,
    );
  });

  it('Shadow re-renders correctly', () => {
    checkReRender(
      () => (
        <Shadow>
          <Text>Shadow render twice test</Text>
        </Shadow>
      ),
      2,
    );
  });
});
