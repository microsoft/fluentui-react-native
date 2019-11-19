import React from 'react';
import { Text, Link, Pressable, Button, IPressableState, IPressableProps } from '@uifabricshared/experimental-web-controls';

const _pressableRenderStyle: IPressableProps['renderStyle'] = (state: IPressableState) => {
  return {
    backgroundColor: state.pressed ? 'blue' : state.hovered ? 'red' : 'white',
    border: '1px solid',
    borderColor: 'black',
    display: 'flex'
  };
};

const BlueButton = Button.customize({
  tokens: {
    borderRadius: 7,
    backgroundColor: 'blue',
    color: 'white'
  },
  _overrides: {
    hovered: {
      tokens: {
        backgroundColor: '#8080ff',
        color: 'black'
      }
    }
  }
});

const DynamicButton = BlueButton.customize({
  tokens: {
    borderColor: 'purple',
    fontSize: 'medium'
  },
  _overrides: {
    disabled: {
      tokens: {
        borderColor: 'pink',
        fontSize: 'xLarge'
      }
    }
  }
});

const OrangeLink = Link.customize({
  tokens: {
    color: 'orange'
  },
  _overrides: {
    hovered: {
      tokens: {
        color: 'pink'
      }
    },
    pressed: {
      tokens: {
        color: 'blue'
      }
    },
    visited: {
      tokens: {
        color: 'red'
      }
    }
  }
});

export const App: React.FunctionComponent = () => {
  return (
    <div>
      <h1>Hello, world!!</h1>
      <Link URL="https://www.bing.com/" content="Click Me" />
      <Link content="Disabled Link" URL="https://www.bing.com/" disabled />
      <OrangeLink
        content="Orange Link [button for verification of 'visited' state]"
        onClick={() => {
          alert('Orange Link clicked.');
        }}
      />
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
