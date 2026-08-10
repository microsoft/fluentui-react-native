import * as React from 'react';
import {act} from 'react';
import * as renderer from 'react-test-renderer';

import {Drawer} from './Drawer';

describe('ComponentsV2 Drawer', () => {
  it('closes from its close action', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Drawer defaultOpen>Content</Drawer>);
    });
    act(() => component!.root.findByProps({accessibilityLabel: 'Close drawer'}).props.onClick({}));
    expect(component!.root.findAllByProps({accessibilityLabel: 'Close drawer'})).toHaveLength(0);
  });
});
