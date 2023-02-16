import { checkReRender } from '@fluentui-react-native/test-tools';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { Divider } from '../Divider';

describe('Divider component tests', () => {
  it('Divider default', () => {
    const tree = renderer.create(<Divider>Your component</Divider>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Divider re-renders correctly', () => {
    checkReRender(() => <Divider>Render twice</Divider>, 2);
  });

  // Feel free to add more tests here
});
