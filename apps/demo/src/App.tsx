import React from 'react';
import { Text, Pressable, Button, IPressableState, IPressableProps } from 'experimental-web-controls';

const _pressableRenderStyle: IPressableProps['renderStyle'] = (state: IPressableState) => {
  return {
    backgroundColor: state.pressed ? 'blue' : state.hovered ? 'red' : 'white',
    border: '1px solid',
    borderColor: 'black',
    display: 'flex'
  };
};

const BlueButton = Button.customize({
  root: {
    borderRadius: 7,
    backgroundColor: 'blue',
    color: 'white'
  },
  _overrides: {
    hovered: {
      root: {
        backgroundColor: '#8080ff',
        color: 'black'
      }
    }
  }
});

const DynamicButton = BlueButton.customize({
  root: {
    borderColor: 'purple',
    fontSize: 'medium'
  },
  _overrides: {
    disabled: {
      root: {
        borderColor: 'pink',
        fontSize: 'xLarge'
      }
    }
  }
});

export const App: React.FunctionComponent = () => {
  return (
    <div>
      <h1>Hello, world!!</h1>
      <Pressable renderStyle={_pressableRenderStyle}>
        <Text>Hello again</Text>
      </Pressable>
      <Button content="Test Button" />
      <BlueButton content="Blue Button" />
      <DynamicButton content="Not Disabled" />
      <DynamicButton disabled content="Disabled" />
    </div>
  );
};
