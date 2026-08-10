import * as React from 'react';
import {act} from 'react';
import * as renderer from 'react-test-renderer';

import {Divider} from './Divider';

describe('ComponentsV2 Divider', () => {
  it('renders a separator with optional content', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Divider appearance="brand">Text</Divider>);
    });
    expect(component!.root.findByProps({accessibilityLabel: 'Divider'})).toBeTruthy();
    expect(component!.root.findByProps({children: 'Text'})).toBeTruthy();
  });
});
