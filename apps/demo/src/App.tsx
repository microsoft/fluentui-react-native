import React from 'react';
import { Text, Link, Pressable, Button, IPressableState, IPressableProps } from 'experimental-web-controls';

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

const PinkLink = Link.customize`{
  content: {
    color: 'pink'
  },
  _overrides: {
    hovered: {
      content: {
        color: 'pink'
      }
    },
    pressed: {
      content: {
        color: 'blue'
      }
    },
    visited: {
      content: {
        color: 'red'
      }
    }
  }
}`;

export const App: React.FunctionComponent = () => {
  return (
    <div>
      <h1>Hello, world!!</h1>
      <Link URL="https://www.bing.com/" content="Click Me" />
      <PinkLink content="Pink Link [button for verification]" />
      <Link content="Button-Style Link" />
      <Pressable renderStyle={_pressableRenderStyle}>
        <Text>Hello again</Text>
      </Pressable>
      <Button
        content="Test Button"
        onClick={() => {
          alert('Test Button');
        }}
      />
      <BlueButton
        content="Blue Button"
        onClick={() => {
          alert('Blue Button');
        }}
      />
      <DynamicButton
        content="Not Disabled"
        onClick={() => {
          alert('Button that is not Disabled');
        }}
      />
      <DynamicButton
        disabled
        content="Disabled"
        onClick={() => {
          alert('Disabled Button');
        }}
      />
    </div>
  );
};
