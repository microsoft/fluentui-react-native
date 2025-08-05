import * as renderer from 'react-test-renderer';

import { Chip } from '../';

describe('Chip component tests', () => {
  const fontBuiltInProps = {
    fontFamily: 'Arial',
    codepoint: 0x2663,
    fontSize: 16,
  };
  it('Empty Chip', () => {
    const tree = renderer.create(<Chip />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Chip all props', () => {
    const tree = renderer.create(<Chip icon={{ fontSource: { ...fontBuiltInProps }, color: '#fff' }}>Chip</Chip>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Chip tokens', () => {
    const ChipStyled = Chip.customize({
      backgroundColor: 'yellow',
      borderColor: '#f09',
      borderWidth: 4,
    });
    const tree = renderer.create(<ChipStyled>Chip Tokens</ChipStyled>).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
