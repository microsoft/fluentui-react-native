import * as React from 'react';
import { ScreenRect, Text, View } from 'react-native';
import { Button, Callout, Separator } from '@fluentui/react-native';
import { fabricTesterStyles } from '../Common/styles';

export const CalloutTest: React.FunctionComponent<{}> = () => {
  const [showStandardCallout, setShowStandardCallout] = React.useState(false);
  const [showCustomizedCallout, setShowCustomizedCallout] = React.useState(false);

  const stdBtnRef = React.useRef<Text>(null);

  const custBtnRef = React.useRef<Text>(null);

  const toggleShowStandardCallout = React.useCallback(() => {
    setShowStandardCallout(!showStandardCallout);
  }, [showStandardCallout, setShowStandardCallout]);

  const toggleShowStandardCalloutInner = React.useCallback(() => {
    setShowStandardCallout(!showStandardCallout);
  }, [showStandardCallout, setShowStandardCallout]);

  const toggleShowCustomizedCallout = React.useCallback(() => {
    setShowCustomizedCallout(!showCustomizedCallout);
  }, [showCustomizedCallout, setShowCustomizedCallout]);

  const toggleShowCustomizedCalloutInner = React.useCallback(() => {
    setShowCustomizedCallout(!showCustomizedCallout);
  }, [showCustomizedCallout, setShowCustomizedCallout]);

  const myRect: ScreenRect = { screenX: 10, screenY: 10, width: 100, height: 100 };
  return (
    <View>
      <Text ref={stdBtnRef} style={fabricTesterStyles.testSection}>
        Standard Usage
      </Text>
      <Separator />
      <Button content="Press for Callout" onClick={toggleShowStandardCallout} />

      {showStandardCallout && (
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

      {showCustomizedCallout && (
        <Callout anchorRect={myRect}>
          <View style={{ height: 300, width: 500 }}>
            <Button content="test button please also ignore" onClick={toggleShowCustomizedCalloutInner} />
          </View>
        </Callout>
      )}
    </View>
  );
};
