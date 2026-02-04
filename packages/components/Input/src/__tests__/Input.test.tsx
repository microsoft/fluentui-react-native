import { act } from 'react';

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
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Input accessoryIcon={iconProps} />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Input with placeholder', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Input placeholder="Test" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Input without accessoryIcon', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Input placeholder="Test" accessoryIcon={null} />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Input with all optional text', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Input placeholder="Test" accessoryText="Accessory" label="Label" assistiveText="Assistive" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Input with icon', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Input placeholder="Test" defaultIcon={iconProps} />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Input in error state', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Input error="Error" />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});
