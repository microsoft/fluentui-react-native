import * as React from 'react';

import * as renderer from 'react-test-renderer';

import { Input } from '../Input';

const fontBuiltInProps = {
  fontFamily: 'Arial',
  codepoint: 0x2663,
  fontSize: 16,
};
const iconProps = { fontSource: { ...fontBuiltInProps }, color: '#fff' };

describe('Input component tests', () => {
  it('Input default', () => {
    const tree = renderer.create(<Input accessoryIcon={iconProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Input with placeholder', () => {
    const tree = renderer.create(<Input placeholder="Test" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Input without accessoryIcon', () => {
    const tree = renderer.create(<Input placeholder="Test" accessoryIcon={null} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Input with all optional text', () => {
    const tree = renderer.create(<Input placeholder="Test" accessoryText="Accessory" label="Label" assistiveText="Assistive" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Input with icon', () => {
    const tree = renderer.create(<Input placeholder="Test" defaultIcon={iconProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Input in error state', () => {
    const tree = renderer.create(<Input error="Error" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
