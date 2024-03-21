import * as React from 'react';

import * as renderer from 'react-test-renderer';

import { Divider } from '../Divider';
import type { DividerProps } from '../Divider.types';

describe('Divider component tests', () => {
  it('Divider default', () => {
    const tree = renderer.create(<Divider />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Vertical Divider', () => {
    const tree = renderer.create(<Divider vertical />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Subtle Divider', () => {
    const tree = renderer.create(<Divider appearance="subtle" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Branded Divider', () => {
    const tree = renderer.create(<Divider appearance="brand" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Strong Divider', () => {
    const tree = renderer.create(<Divider appearance="strong" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Horizontal Divider with Inset', () => {
    const tree = renderer.create(<Divider insetSize={16} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Vertical Divider with Inset', () => {
    const tree = renderer.create(<Divider vertical insetSize={16} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Custom Divider', () => {
    const CustomDivider = Divider.customize({ thickness: 3, lineColor: 'red', contentColor: 'blue' });
    const tree = renderer.create(<CustomDivider />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Divider with text', () => {
    const tree = renderer.create(<Divider>Lorem Ipsum</Divider>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Divider with icon', () => {
    const tree = renderer.create(<Divider icon={{ fontSource: { fontFamily: 'Arial', codepoint: 0x2663, fontSize: 32 } }} />).toJSON();
    expect(tree).toMatchSnapshot();
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
    const tree = renderer.create(<CustomDivider {...props}>Hello</CustomDivider>).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
