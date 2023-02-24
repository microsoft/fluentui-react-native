import * as React from 'react';

import type { IFocusable } from '@fluentui-react-native/interactive-hooks';
import * as renderer from 'react-test-renderer';

import { FocusTrapZone } from '..';

it('FocusTrapZone default props', () => {
  const tree = renderer.create(<FocusTrapZone />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('FocusTrapZone all props props', () => {
  const ref: React.RefObject<IFocusable> = { current: null };
  const tree = renderer
    .create(<FocusTrapZone componentRef={ref} disableFirstFocus disabled ignoreExternalFocusing focusPreviouslyFocusedInnerElement />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
