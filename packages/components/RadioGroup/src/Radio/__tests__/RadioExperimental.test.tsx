import * as React from 'react';

import { /* checkRenderConsistency,*/ checkReRender } from '@fluentui-react-native/test-tools';
import * as renderer from 'react-test-renderer';

import { Radio } from '../Radio';

describe('Radio component tests', () => {
  it('Radio default', () => {
    const tree = renderer.create(<Radio value="key1" label="Default Radio" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Radio disabled', () => {
    const tree = renderer.create(<Radio disabled value="key1" label="Disabled Radio" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  /* Commenting this test out until memoization of keyDownEvents prop issue is fixed. */
  // it('Radio simple rendering does not invalidate styling', () => {
  //   checkRenderConsistency(() => <Radio value="key1" label="Default Radio" />, 2);
  // });

  it('Radio re-renders correctly', () => {
    checkReRender(() => <Radio value="key1" label="Render twice" />, 2);
  });
});
