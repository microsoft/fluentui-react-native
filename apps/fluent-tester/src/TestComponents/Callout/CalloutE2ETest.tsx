import * as React from 'react';
import { ScreenRect, Text, View } from 'react-native';
import { Button, Callout } from '@fluentui/react-native';
import { BUTTON_TO_OPEN_CALLOUT, CALLOUT_ACCESSIBILITY_LABEL, CALLOUT_TEST_COMPONENT } from './consts';

export const E2ECalloutTest: React.FunctionComponent = () => {
  const [showCustomizedCallout, setShowCustomizedCallout] = React.useState(false);
  const [isCustomizedCalloutVisible, setIsCustomizedCalloutVisible] = React.useState(false);

  const toggleShowCustomizedCallout = React.useCallback(() => {
    setShowCustomizedCallout(!showCustomizedCallout);
    setIsCustomizedCalloutVisible(false);
  }, [showCustomizedCallout, setIsCustomizedCalloutVisible, setShowCustomizedCallout]);

  const onShowCustomizedCallout = React.useCallback(() => {
    setIsCustomizedCalloutVisible(true);
  }, [setIsCustomizedCalloutVisible]);

  const onDismissCustomizedCallout = React.useCallback(() => {
    setIsCustomizedCalloutVisible(false);
    setShowCustomizedCallout(false);
  }, [setIsCustomizedCalloutVisible, setShowCustomizedCallout]);

  const myRect: ScreenRect = { screenX: 10, screenY: 10, width: 100, height: 100 };

  return (
    <View>
      <View style={{ flexDirection: 'column', paddingVertical: 5 }}>
        <Button content="Press for Callout" onClick={toggleShowCustomizedCallout} testID={BUTTON_TO_OPEN_CALLOUT} />
        <Text selectable={true}>
          <Text>Visibility: </Text>
          {isCustomizedCalloutVisible ? <Text style={{ color: 'green' }}>Visible</Text> : <Text style={{ color: 'red' }}>Not Visible</Text>}
        </Text>
      </View>

      {showCustomizedCallout && (
        <Callout
          testID={CALLOUT_TEST_COMPONENT}
          anchorRect={myRect}
          onDismiss={onDismissCustomizedCallout}
          onShow={onShowCustomizedCallout}
          accessibilityLabel={CALLOUT_ACCESSIBILITY_LABEL}
          accessibilityRole="alert"
          accessibilityOnShowAnnouncement="Be informed that a customized callout has been opened."
        >
          <View style={{ padding: 20, borderWidth: 2, borderColor: 'black' }}>
            <Text>just some text so it does not take focus and is not empty.</Text>
          </View>
        </Callout>
      )}
    </View>
  );
};
