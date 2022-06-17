import * as React from 'react';
import { Notification } from '../Notification';
import * as renderer from 'react-test-renderer';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';

describe('Notification component tests', () => {
  it('Notification default', () => {
    const tree = renderer.create(<Notification>Your component</Notification>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Notification simple rendering does not invalidate styling', () => {
    checkRenderConsistency(() => <Notification>Default Notification</Notification>, 2);
  });

  it('Notification re-renders correctly', () => {
    checkReRender(() => <Notification>Render twice</Notification>, 2);
  });

  // Feel free to add more tests here
});
