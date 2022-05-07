import * as React from 'react';
import { ScreenRect, Text, View, Switch, Picker, ScrollView } from 'react-native';
import { Button, Callout, Separator, IFocusable, RestoreFocusEvent, DismissBehaviors, StealthButton } from '@fluentui/react-native';
import { CALLOUT_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { E2ECalloutTest } from './CalloutE2ETest';
import { fluentTesterStyles } from '../Common/styles';
import { ViewWin32 } from '@office-iss/react-native-win32';

const StandardCallout: React.FunctionComponent = () => {
  const [showStandardCallout, setShowStandardCallout] = React.useState(false);
  const [isStandardCalloutVisible, setIsStandardCalloutVisible] = React.useState(false);
  const [openCalloutOnHoverAnchor, setOpenCalloutOnHoverAnchor] = React.useState(false);

  const [shouldSetInitialFocus, setShouldSetInitialFocus] = React.useState(true);
  const onInitialFocusChange = React.useCallback((value) => setShouldSetInitialFocus(value), []);

  const [customRestoreFocus, setCustomRestoreFocus] = React.useState(false);
  const onRestoreFocusChange = React.useCallback((value) => setCustomRestoreFocus(value), []);

  const [isBeakVisible, setIsBeakVisible] = React.useState(false);
  const onIsBeakVisibleChange = React.useCallback((value) => setIsBeakVisible(value), []);

  const [preventDismissOnKeyDown, setPreventDismissOnKeyDown] = React.useState(false);
  const [preventDismissOnClickOutside, setPreventDismissOnClickOutside] = React.useState(false);
  const [calloutDismissBehaviors, setDismissBehaviors] = React.useState<DismissBehaviors[]>([]);

  const onPreventDismissOnKeyDownChange = React.useCallback(
    (value) => {
      setPreventDismissOnKeyDown(value);
      if (value) {
        setDismissBehaviors(calloutDismissBehaviors.concat('preventDismissOnKeyDown'));
      } else {
        const newDismissBehaviors = calloutDismissBehaviors.filter((value) => {
          value != 'preventDismissOnKeyDown';
        });
        setDismissBehaviors(newDismissBehaviors);
      }
    },
    [calloutDismissBehaviors],
  );

  const onPreventDismissOnClickOutsideChange = React.useCallback(
    (value) => {
      setPreventDismissOnClickOutside(value);
      if (value) {
        setDismissBehaviors(calloutDismissBehaviors.concat('preventDismissOnClickOutside'));
      } else {
        const newDismissBehaviors = calloutDismissBehaviors.filter((value) => {
          value != 'preventDismissOnClickOutside';
        });
        setDismissBehaviors(newDismissBehaviors);
      }
    },
    [calloutDismissBehaviors],
  );

  const redTargetRef = React.useRef<View>(null);
  const blueTargetRef = React.useRef<View>(null);
  const greenTargetRef = React.useRef<View>(null);
  const decoyBtn1Ref = React.useRef<IFocusable>(null);
  const decoyBtn2Ref = React.useRef<IFocusable>(null);
  const [anchorRef, setAnchorRef] = React.useState(redTargetRef);

  const toggleShowStandardCallout = React.useCallback(() => {
    if (openCalloutOnHoverAnchor) return;

    setShowStandardCallout(!showStandardCallout);

    // Unmounting a callout does not invoke onDismiss; onDismiss is only invoked
    // for dismissals generated by the native app.  When toggling to 'show',
    // the isVisible state will be corrected to 'true' by the onShow callback.
    setIsStandardCalloutVisible(false);
  }, [openCalloutOnHoverAnchor, showStandardCallout, setIsStandardCalloutVisible, setShowStandardCallout]);

  const setShowStandardCalloutOnHoverAnchor = React.useCallback(
    (show: boolean, hoverAnchorRef: React.MutableRefObject<View>) => {
      if (!openCalloutOnHoverAnchor || hoverAnchorRef != anchorRef) return;

      setShowStandardCallout(show);
    },
    [anchorRef, openCalloutOnHoverAnchor],
  );

  const toggleCalloutRef = React.useCallback(() => {
    // Cycle the target ref between the RGB target views
    setAnchorRef(anchorRef === redTargetRef ? greenTargetRef : anchorRef === greenTargetRef ? blueTargetRef : redTargetRef);
  }, [anchorRef, setAnchorRef]);

  const onShowStandardCallout = React.useCallback(() => {
    setIsStandardCalloutVisible(true);
  }, [setIsStandardCalloutVisible]);

  const onDismissStandardCallout = React.useCallback(() => {
    setIsStandardCalloutVisible(false);

    // setting the internal state to false will instigate unmounting the
    // zombie Callout control.
    setShowStandardCallout(false);
  }, [setIsStandardCalloutVisible, setShowStandardCallout]);

  const onRestoreFocusStandardCallout = React.useCallback(
    (restoreFocusEvent: RestoreFocusEvent) => {
      if (restoreFocusEvent?.nativeEvent?.containsFocus) {
        decoyBtn1Ref?.current?.focus?.();
      } else {
        decoyBtn2Ref?.current?.focus?.();
      }
    },
    [decoyBtn1Ref, decoyBtn2Ref],
  );

  const colorDefault: string = 'default';
  const colorSelections: string[] = [colorDefault, 'red', 'green', 'blue'];

  const [selectedBackgroundColor, setSelectedBackgroundColor] = React.useState<string | undefined>(undefined);
  const [selectedBorderColor, setSelectedBorderColor] = React.useState<string | undefined>(undefined);

  const borderWidthDefault: string = '1';
  const borderWidthSelections: string[] = ['1', '2', '4', '10'];

  const [selectedBorderWidth, setSelectedBorderWidth] = React.useState<string | undefined>(undefined);

  const [showScrollViewCallout, setShowScrollViewCalout] = React.useState(false);
  const [scrollviewContents, setScrollviewContents] = React.useState([1, 2, 3]);

  const removeButton = React.useCallback(() => {
    const tempArray = scrollviewContents;
    tempArray.pop();
    setScrollviewContents([...tempArray]);
  }, [setScrollviewContents, scrollviewContents]);

  const addButton = React.useCallback(() => {
    setScrollviewContents((arr) => [...arr, 1]);
  }, [setScrollviewContents]);

  return (
    <View>
      <View style={{ flexDirection: 'row', paddingVertical: 5 }}>
        <View style={{ flexDirection: 'column', paddingHorizontal: 5 }}>
          <View style={{ flexDirection: 'row' }}>
            <Switch value={openCalloutOnHoverAnchor} onValueChange={setOpenCalloutOnHoverAnchor} />
            <Text>Show Callout On Hover Anchor</Text>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <Switch value={shouldSetInitialFocus} onValueChange={onInitialFocusChange} />
            <Text>Set Initial Focus</Text>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <Switch value={customRestoreFocus} onValueChange={onRestoreFocusChange} />
            <Text>Customize Restore Focus</Text>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <Switch value={isBeakVisible} onValueChange={onIsBeakVisibleChange} />
            <Text>Beak Visible</Text>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <Switch value={preventDismissOnKeyDown} onValueChange={onPreventDismissOnKeyDownChange} />
            <Text>Prevent Dismiss On Key Down</Text>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <Switch value={preventDismissOnClickOutside} onValueChange={onPreventDismissOnClickOutsideChange} />
            <Text>Prevent Dismiss On Click Outside</Text>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <Switch value={showScrollViewCallout} onValueChange={setShowScrollViewCalout} />
            <Text>Enable ScrollView Callout</Text>
          </View>

          <Picker
            prompt="Background Color"
            selectedValue={selectedBackgroundColor || colorDefault}
            onValueChange={(color) => setSelectedBackgroundColor(color === colorDefault ? undefined : color)}
          >
            {colorSelections.map((color, index) => (
              <Picker.Item label={color} key={index} value={color} />
            ))}
          </Picker>

          <Picker
            prompt="Border Color"
            selectedValue={selectedBorderColor || colorDefault}
            onValueChange={(color) => setSelectedBorderColor(color === colorDefault ? undefined : color)}
          >
            {colorSelections.map((color, index) => (
              <Picker.Item label={color} key={index} value={color} />
            ))}
          </Picker>

          <Picker
            prompt="Border Width"
            selectedValue={selectedBorderWidth || borderWidthDefault}
            onValueChange={(width) => setSelectedBorderWidth(width === borderWidthDefault ? undefined : width)}
          >
            {borderWidthSelections.map((width, index) => (
              <Picker.Item label={width} key={index} value={width} />
            ))}
          </Picker>
        </View>

        <Separator vertical />

        <View style={{ flexDirection: 'column', paddingHorizontal: 5 }}>
          <Button
            content={(openCalloutOnHoverAnchor ? 'Hover Color Anchor ' : 'Press Here ') + 'for Callout'}
            onClick={toggleShowStandardCallout}
          />
          <Text>
            <Text>Visibility: </Text>
            {isStandardCalloutVisible ? <Text style={{ color: 'green' }}>Visible</Text> : <Text style={{ color: 'red' }}>Not Visible</Text>}
          </Text>
        </View>

        <Separator vertical />

        <View style={{ flexDirection: 'column', paddingHorizontal: 5 }}>
          <ViewWin32
            ref={redTargetRef}
            onMouseEnter={() => setShowStandardCalloutOnHoverAnchor(true, redTargetRef)}
            onMouseLeave={() => setShowStandardCalloutOnHoverAnchor(false, redTargetRef)}
            style={{ height: 20, width: 20, backgroundColor: 'red', padding: 5 }}
          />
          <ViewWin32
            ref={greenTargetRef}
            onMouseEnter={() => setShowStandardCalloutOnHoverAnchor(true, greenTargetRef)}
            onMouseLeave={() => setShowStandardCalloutOnHoverAnchor(false, greenTargetRef)}
            style={{ height: 20, width: 20, backgroundColor: 'green', padding: 5 }}
          />
          <ViewWin32
            ref={blueTargetRef}
            onMouseEnter={() => setShowStandardCalloutOnHoverAnchor(true, blueTargetRef)}
            onMouseLeave={() => setShowStandardCalloutOnHoverAnchor(false, blueTargetRef)}
            style={{ height: 20, width: 20, backgroundColor: 'blue', padding: 5 }}
          />
        </View>
      </View>

      <Separator />

      <View style={{ paddingVertical: 5 }}>
        <Button componentRef={decoyBtn1Ref} content="Custom reFocus w/ focus in Callout" />
        <Button componentRef={decoyBtn2Ref} content="Custom reFocus w/o focus in Callout" />
      </View>

      {showStandardCallout && (
        <Callout
          {...{
            doNotTakePointerCapture: openCalloutOnHoverAnchor ?? undefined,
            target: anchorRef,
            onDismiss: onDismissStandardCallout,
            onShow: onShowStandardCallout,
            ...(customRestoreFocus && { onRestoreFocus: onRestoreFocusStandardCallout }),
            accessibilityLabel: 'Standard Callout',
            setInitialFocus: shouldSetInitialFocus,
            isBeakVisible: isBeakVisible,
            ...(selectedBorderColor && { borderColor: selectedBorderColor }),
            ...(selectedBackgroundColor && { backgroundColor: selectedBackgroundColor }),
            ...(selectedBorderWidth && { borderWidth: parseInt(selectedBorderWidth) }),
            ...(calloutDismissBehaviors && { dismissBehaviors: calloutDismissBehaviors }),
          }}
        >
          {showScrollViewCallout ? (
            <View style={fluentTesterStyles.scrollViewContainer}>
              <ScrollView contentContainerStyle={fluentTesterStyles.scrollViewStyle} showsVerticalScrollIndicator={true}>
                <StealthButton content="click to change anchor" onClick={toggleCalloutRef} />
                <StealthButton content="Click to add a button" style={fluentTesterStyles.testListItem} onClick={addButton} />
                <StealthButton content="Click to remove a button" style={fluentTesterStyles.testListItem} onClick={removeButton} />
                {scrollviewContents.map((value) => {
                  return <StealthButton key={value} content="Button" style={fluentTesterStyles.testListItem} />;
                })}
              </ScrollView>
            </View>
          ) : (
            //else
            <View style={{ padding: 20 }}>
              <Button content="click to change anchor" onClick={toggleCalloutRef} />
            </View>
          )}
        </Callout>
      )}
    </View>
  );
};

const CustomCallout: React.FunctionComponent = () => {
  const [showCustomizedCallout, setShowCustomizedCallout] = React.useState(false);
  const [isCustomizedCalloutVisible, setIsCustomizedCalloutVisible] = React.useState(false);

  const toggleShowCustomizedCallout = React.useCallback(() => {
    setShowCustomizedCallout(!showCustomizedCallout);

    // Unmounting a callout does not invoke onDismiss; onDismiss is only invoked
    // for dismissals generated by the native app.  When toggling to 'show',
    // the isVisible state will be corrected to 'true' by the onShow callback.
    setIsCustomizedCalloutVisible(false);
  }, [showCustomizedCallout, setIsCustomizedCalloutVisible, setShowCustomizedCallout]);

  const onShowCustomizedCallout = React.useCallback(() => {
    setIsCustomizedCalloutVisible(true);
  }, [setIsCustomizedCalloutVisible]);

  const onDismissCustomizedCallout = React.useCallback(() => {
    setIsCustomizedCalloutVisible(false);

    // setting the internal state to false will instigate unmounting the
    // zombie Callout control.
    setShowCustomizedCallout(false);
  }, [setIsCustomizedCalloutVisible, setShowCustomizedCallout]);

  const myRect: ScreenRect = { screenX: 10, screenY: 10, width: 100, height: 100 };

  return (
    <View>
      <View style={{ flexDirection: 'column', paddingVertical: 5 }}>
        <Button content="Press for Callout" onClick={toggleShowCustomizedCallout} />
        <Text selectable={true}>
          <Text>Visibility: </Text>
          {isCustomizedCalloutVisible ? <Text style={{ color: 'green' }}>Visible</Text> : <Text style={{ color: 'red' }}>Not Visible</Text>}
        </Text>
      </View>

      {showCustomizedCallout && (
        <Callout
          anchorRect={myRect}
          onDismiss={onDismissCustomizedCallout}
          onShow={onShowCustomizedCallout}
          accessibilityLabel="Customized Callout"
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

const calloutSections: TestSection[] = [
  {
    name: 'Standard Usage',
    testID: CALLOUT_TESTPAGE,
    component: StandardCallout,
  },
  {
    name: 'Customized Usage',
    component: CustomCallout,
  },
  {
    name: 'E2E Testing Callout',
    component: E2ECalloutTest,
  },
];

export const CalloutTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description = 'A callout is an anchored tip that can be used to teach people or guide them through the app without blocking them.';

  return <Test name="Callout Test" description={description} sections={calloutSections} status={status}></Test>;
};
