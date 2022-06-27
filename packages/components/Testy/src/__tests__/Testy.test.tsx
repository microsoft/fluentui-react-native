import * as React from 'react';
import { Testy } from '../Testy';
import * as renderer from 'react-test-renderer';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';

describe('Testy component tests', () => {
  it('Testy default', () => {
    const tree = renderer.create(<Testy>Your component</Testy>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Testy simple rendering does not invalidate styling', () => {
    checkRenderConsistency(() => <Testy>Default Testy</Testy>, 2);
  });

  it('Testy re-renders correctly', () => {
    checkReRender(() => <Testy>Render twice</Testy>, 2);
  });

  // Feel free to add more tests here
});
