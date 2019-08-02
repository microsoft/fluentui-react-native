import * as React from 'react';
import { Text, Pressable, Button, IPressableState, IPressableProps } from 'experimental-web-controls';

const _pressableRenderStyle: IPressableProps['renderStyle'] = (state: IPressableState) => {
  return {
    backgroundColor: state.pressed ? 'blue' : state.hovered ? 'red' : 'white',
    border: '1px solid',
    borderColor: 'black',
    display: 'flex'
  };
};

export const App: React.FunctionComponent = () => {
  return (
    <div>
      <h1>Hello, world!!</h1>
      <Pressable renderStyle={_pressableRenderStyle}>
        <Text>Hello again</Text>
      </Pressable>
      <Button content="Test Button" />
    </div>
  );
};

export default App;
