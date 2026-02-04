import { act } from 'react';

import * as renderer from 'react-test-renderer';

import { Divider } from '../Divider';
import type { DividerProps } from '../Divider.types';

describe('Divider component tests', () => {
  it('Divider default', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Divider />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Vertical Divider', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Divider vertical />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Subtle Divider', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Divider appearance="subtle" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Branded Divider', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Divider appearance="brand" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Strong Divider', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Divider appearance="strong" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Horizontal Divider with Inset', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Divider insetSize={16} />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Vertical Divider with Inset', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Divider vertical insetSize={16} />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Custom Divider', () => {
    const CustomDivider = Divider.customize({ thickness: 3, lineColor: 'red', contentColor: 'blue' });
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<CustomDivider />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Divider with text', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Divider>Lorem Ipsum</Divider>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Divider with icon', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Divider icon={{ fontSource: { fontFamily: 'Arial', codepoint: 0x2663, fontSize: 32 } }} />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Divider with all props + tokens set', () => {
    const CustomDivider = Divider.customize({
      contentColor: 'red',
      contentPadding: 10,
      flexAfter: 2,
      flexBefore: 1,
      lineColor: 'blue',
      minLineSize: 10,
      thickness: 2,
      minHeight: 40,
      minWidth: 10,
      maxHeight: 200,
      maxWidth: 200,
      padding: 10,
      paddingVertical: 10,
      paddingHorizontal: 10,
      paddingStart: 10,
      paddingEnd: 10,
      fontFamily: 'serif',
      fontSize: 10,
      fontWeight: '600',
      fontLineHeight: 2,
      fontLetterSpacing: 0.1,
      fontStyle: 'italic',
      textDecorationLine: 'line-through',
      variant: 'body1',
    });
    const props: DividerProps = {
      alignContent: 'start',
      appearance: 'strong',
      icon: { fontSource: { fontFamily: 'Arial', codepoint: 0x2663, fontSize: 32 } },
      insetSize: 16,
      vertical: true,
    };
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<CustomDivider {...props}>Hello</CustomDivider>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});
