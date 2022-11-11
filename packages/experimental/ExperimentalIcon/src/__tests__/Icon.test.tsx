import * as React from 'react';
import { FontIcon } from '../';
import * as renderer from 'react-test-renderer';

import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';

const fontProps = {
  fontFamily: 'Arial',
  codepoint: 0x2663,
  color: '#f07',
};
describe('Icon component tests', () => {
  it('SVG Icon', () => {
    const tree = renderer.create(<FontIcon {...fontProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Icon checkRenderConsistency', () => {
    checkRenderConsistency(() => <FontIcon {...fontProps} />, 2);
  });

  it('Icon re-renders correctly', () => {
    checkReRender(() => <FontIcon {...fontProps} />, 2);
  });
});
