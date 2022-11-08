import * as React from 'react';
import { SvgIcon } from '../';
import * as renderer from 'react-test-renderer';

import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';

describe('Icon component tests', () => {
  it('SVG Icon', () => {
    const tree = renderer.create(<SvgIcon viewBox="0 0 1000 1000" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Icon checkRenderConsistency', () => {
    checkRenderConsistency(() => <SvgIcon />, 2);
  });

  it('Icon re-renders correctly', () => {
    checkReRender(() => <SvgIcon />, 2);
  });
});
