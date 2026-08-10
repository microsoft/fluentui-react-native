import * as React from 'react';
import {act} from 'react';
import * as renderer from 'react-test-renderer';

import {Dialog} from './Dialog';

describe('ComponentsV2 Dialog', () => {
  it('opens and closes through its trigger and close action', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Dialog trigger={<React.Fragment>Open dialog</React.Fragment>}>Content</Dialog>);
    });

    act(() => component!.root.findByProps({accessibilityRole: 'button'}).props.onPress({}));
    expect(component!.root.findByProps({accessibilityLabel: 'Close'})).toBeTruthy();
    act(() => component!.root.findByProps({accessibilityLabel: 'Close'}).props.onClick({}));
    expect(component!.root.findAllByProps({accessibilityLabel: 'Close'})).toHaveLength(0);
  });

  it('does not close when preventClose is set', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Dialog defaultOpen preventClose>Content</Dialog>);
    });

    expect(component!.root.findAllByProps({accessibilityLabel: 'Close'})).toHaveLength(0);
  });
});
