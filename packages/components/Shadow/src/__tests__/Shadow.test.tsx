import * as React from 'react';
import { Shadow } from '../Shadow';
import * as renderer from 'react-test-renderer';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';

describe('Shadow component tests', () => {
  it('Shadow default', () => {
    const tree = renderer.create(<Shadow>Your component</Shadow>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow simple rendering does not invalidate styling', () => {
    checkRenderConsistency(() => <Shadow>Default Shadow</Shadow>, 2);
  });

  it('Shadow re-renders correctly', () => {
    checkReRender(() => <Shadow>Render twice</Shadow>, 2);
  });

  // Feel free to add more tests here
});
