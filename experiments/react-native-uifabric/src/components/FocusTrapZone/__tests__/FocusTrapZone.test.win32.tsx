import * as React from 'react';
import { FocusTrapZone } from '..';
import * as renderer from 'react-test-renderer';
import { IFocusable } from '@fluentui-native/interactive-hooks';

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
