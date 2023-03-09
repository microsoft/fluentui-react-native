import * as React from 'react';

import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';
import * as renderer from 'react-test-renderer';

import { Input } from '../Input';

describe('Input component tests', () => {
  it('Input default', () => {
    const tree = renderer.create(<Input>Your component</Input>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Input simple rendering does not invalidate styling', () => {
    checkRenderConsistency(() => <Input>Default Input</Input>, 2);
  });

  it('Input re-renders correctly', () => {
    checkReRender(() => <Input>Render twice</Input>, 2);
  });

  // Feel free to add more tests here
});
