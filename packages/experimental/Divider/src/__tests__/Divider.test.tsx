import * as React from 'react';

import * as renderer from 'react-test-renderer';

import { Divider } from '../Divider';

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
});
