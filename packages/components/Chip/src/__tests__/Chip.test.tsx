import { act } from 'react';

import * as renderer from 'react-test-renderer';

import { Chip } from '../';

describe('Chip component tests', () => {
  const fontBuiltInProps = {
    fontFamily: 'Arial',
    codepoint: 0x2663,
    fontSize: 16,
  };
  it('Empty Chip', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Chip />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Chip all props', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Chip icon={{ fontSource: { ...fontBuiltInProps }, color: '#fff' }}>Chip</Chip>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Chip tokens', () => {
    const ChipStyled = Chip.customize({
      backgroundColor: 'yellow',
      borderColor: '#f09',
      borderWidth: 4,
    });
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<ChipStyled>Chip Tokens</ChipStyled>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});
