import * as React from 'react';
import { act } from 'react';

import type { IFocusable } from '@fluentui-react-native/interactive-hooks';
import * as renderer from 'react-test-renderer';

import { FocusTrapZone } from '..';

it('FocusTrapZone default props', () => {
  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(<FocusTrapZone />);
  });
  expect(component!.toJSON()).toMatchSnapshot();
});

it('FocusTrapZone all props props', () => {
  const ref: React.RefObject<IFocusable> = { current: null };
  let component: renderer.ReactTestRenderer;
  act(() => {
    component = renderer.create(
      <FocusTrapZone componentRef={ref} disableFirstFocus disabled ignoreExternalFocusing focusPreviouslyFocusedInnerElement />,
    );
  });
  expect(component!.toJSON()).toMatchSnapshot();
});
