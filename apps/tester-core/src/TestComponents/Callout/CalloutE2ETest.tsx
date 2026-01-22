import * as React from 'react';
import type { KeyboardMetrics } from 'react-native';
import { View } from 'react-native';

import type { DismissBehaviors } from '@fluentui/react-native';
import { ButtonV1 as Button, Callout, Text } from '@fluentui/react-native';
import { BUTTON_TO_OPEN_CALLOUT, CALLOUT_ACCESSIBILITY_LABEL, CALLOUT_TEST_COMPONENT } from '@fluentui-react-native/e2e-testing';
import { Switch } from '@fluentui-react-native/switch';

import { testProps } from '../Common/TestProps';

export const E2ECalloutTest: React.FunctionComponent = () => {
  const [showCallout, setShowCallout] = React.useState(false);
  const [isCalloutVisible, setIsCalloutVisible] = React.useState(false);
  const [dismissBehaviors, setDismissBehaviors] = React.useState({
    preventDismissOnKeyDown: false,
    preventDismissOnClickOutside: false,
  });

  const toggleShowCallout = React.useCallback(() => {
    setShowCallout(!showCallout);
    setIsCalloutVisible(false);
  }, [showCallout, setIsCalloutVisible, setShowCallout]);

  const onShowCallout = React.useCallback(() => {
    setIsCalloutVisible(true);
  }, [setIsCalloutVisible]);

  const onDismissCallout = React.useCallback(() => {
    setIsCalloutVisible(false);
    setShowCallout(false);
  }, [setIsCalloutVisible, setShowCallout]);

  const myRect: KeyboardMetrics = { screenX: 10, screenY: 10, width: 100, height: 100 };

  return (
    <View>
      <View style={{ flexDirection: 'column', paddingVertical: 5 }}>
        <Text variant="subheaderSemibold">Dismiss Behaviors</Text>
        <View style={{ flexDirection: 'row', paddingVertical: 5 }}>
          {Object.entries(dismissBehaviors).map(([behavior, checked], i) => (
            <Switch
              label={behavior}
              checked={checked}
              onChange={(_, isChecked) => setDismissBehaviors({ ...dismissBehaviors, [behavior]: isChecked })}
              key={i}
            />
          ))}
        </View>
        <Button
          onClick={toggleShowCallout}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(BUTTON_TO_OPEN_CALLOUT)}
        >
          Press for Callout
        </Button>
        <Text selectable={true}>
          <Text>Visibility: </Text>
          {isCalloutVisible ? <Text style={{ color: 'green' }}>Visible</Text> : <Text style={{ color: 'red' }}>Not Visible</Text>}
        </Text>
      </View>

      {showCallout && (
        <Callout
          anchorRect={myRect}
          onDismiss={onDismissCallout}
          onShow={onShowCallout}
          accessibilityLabel={CALLOUT_ACCESSIBILITY_LABEL}
          accessibilityRole="alert"
          accessibilityOnShowAnnouncement="Be informed that a customized callout has been opened."
          dismissBehaviors={Object.keys(dismissBehaviors).filter((behavior) => dismissBehaviors[behavior]) as DismissBehaviors[]}
          /* For Android E2E testing purposes, testProps must be passed in after accessibilityLabel. */
          {...testProps(CALLOUT_TEST_COMPONENT)}
        >
          <View style={{ padding: 20, borderWidth: 2, borderColor: 'black' }}>
            <Text>just some text so it does not take focus and is not empty.</Text>
          </View>
        </Callout>
      )}
    </View>
  );
};
