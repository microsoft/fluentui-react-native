import * as React from 'react';
import { ScreenRect, Text, View } from 'react-native';
import { Button, Callout, Separator } from '@fluentui/react-native';
import { fabricTesterStyles } from '../Common/styles';

export const CalloutTest: React.FunctionComponent<{}> = () => {
  const [state, setState] = React.useState({
    showStandardCallout: false,
    showCustomizedCallout: false
  });

  const stdBtnRef = React.useRef<Text>(null);

  const custBtnRef = React.useRef<Text>(null);

  const toggleShowStandardCallout = React.useCallback(() => {
    setState({ ...state, showStandardCallout: !state.showStandardCallout });
  }, [state, setState]);

  const toggleShowStandardCalloutInner = React.useCallback(() => {
    setState({ ...state, showStandardCallout: !state.showStandardCallout });
  }, [state, setState]);

  const toggleShowCustomizedCallout = React.useCallback(() => {
    setState({ ...state, showCustomizedCallout: !state.showCustomizedCallout });
  }, [state, setState]);

  const toggleShowCustomizedCalloutInner = React.useCallback(() => {
    setState({ ...state, showCustomizedCallout: !state.showCustomizedCallout });
  }, [state, setState]);
  const myRect: ScreenRect = { screenX: 10, screenY: 10, width: 100, height: 100 };
  return (
    <View>
      <Text ref={stdBtnRef} style={fabricTesterStyles.testSection}>
        Standard Usage
      </Text>
      <Separator />
      <Button content="Press for Callout" onClick={toggleShowStandardCallout} />

      {state.showStandardCallout && (
        <Callout anchorRect={myRect}>
          <View style={{ height: 200, width: 400 }}>
            <Button content="test button please ignore" onClick={toggleShowStandardCalloutInner} />
          </View>
        </Callout>
      )}

      <Text ref={custBtnRef} style={fabricTesterStyles.testSection}>
        Customized Usage
      </Text>
      <Separator />
      <Button content="Press for Callout" onClick={toggleShowCustomizedCallout} />

      {state.showCustomizedCallout && (
        <Callout anchorRect={myRect}>
          <View style={{ height: 300, width: 500 }}>
            <Button content="test button please also ignore" onClick={toggleShowCustomizedCalloutInner} />
          </View>
        </Callout>
      )}
    </View>
  );
};
