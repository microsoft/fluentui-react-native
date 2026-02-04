import { act } from 'react';

import * as renderer from 'react-test-renderer';

import { Text } from '../Text';

describe('Text component tests', () => {
  it('Text default', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Text>Text default</Text>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Text all props', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Text variant="bodyStandard">All props</Text>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Text all tokens', () => {
    const BoldText = Text.customize({
      fontFamily: 'Wingdings',
      fontWeight: '900',
      fontSize: 20,
    });
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<BoldText>All tokens</BoldText>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Text variants render correctly with style', () => {
    const style = {
      marginBottom: 8,
      marginTop: 4,
    };
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Text variant="heroLargeSemibold" color="blue" style={style}>
          Header Text
        </Text>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});
