import { Tooltip } from '@fluentui-react-native/tooltip';
import * as React from 'react';
import { View } from 'react-native';
import { Button } from '@fluentui-react-native/experimental-button';

export const TooltipDefault: React.FunctionComponent = () => {
  // const [check, setCheck] = React.useState(false);

  // const toggleCheck = React.useCallback(() => {
  //   setCheck(!check);
  // }, [setCheck]);

  return (
    <View>
      {/* <Button onClick={toggleCheck}>Click</Button>
      {check && (
        <View>
          <Tooltip content="Test">
            <Button>Test</Button>
          </Tooltip>
        </View>
      )} */}
      <Tooltip content="Test" positioning="topCenter">
        <Button>Test</Button>
      </Tooltip>
      <Tooltip content="Test 2">
        <Button>Test 2</Button>
      </Tooltip>
      <Tooltip content="Test 3">
        <Button>Test 3</Button>
      </Tooltip>
      <Tooltip content="Test 4">
        <Button>Test 4</Button>
      </Tooltip>
    </View>
  );
};
