import * as React from 'react';
import type { KeyboardMetrics } from 'react-native';
import { Text, View, Switch, ScrollView, Platform } from 'react-native';

import { ButtonV1 as Button, Callout, Separator, Pressable } from '@fluentui/react-native';
import type { CalloutNativeMethods, IFocusable, RestoreFocusEvent, DismissBehaviors, ICalloutProps } from '@fluentui/react-native';

import { E2ECalloutTest } from './CalloutE2ETest';
import { CALLOUT_TESTPAGE } from '../../../../E2E/src/Callout/consts';
import { MenuPicker } from '../Common/MenuPicker';
import { fluentTesterStyles } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const StandardCallout: React.FunctionComponent = () => {
  const [showStandardCallout, setShowStandardCallout] = React.useState(false);
  const [isStandardCalloutVisible, setIsStandardCalloutVisible] = React.useState(false);
  const [openCalloutOnHoverAnchor, setOpenCalloutOnHoverAnchor] = React.useState(true);
  const [calloutHovered, setCalloutHovered] = React.useState(false);

  const [shouldSetInitialFocus, setShouldSetInitialFocus] = React.useState(true);
  const onInitialFocusChange = React.useCallback((value: boolean) => setShouldSetInitialFocus(value), []);

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

  const calloutRef = React.useRef<CalloutNativeMethods>(null);
  const calloutButtonRef = React.useRef<IFocusable>(null);
  const redTargetRef = React.useRef<View>(null);
  const blueTargetRef = React.useRef<View>(null);
  const greenTargetRef = React.useRef<View>(null);
  const decoyBtn1Ref = React.useRef<IFocusable>(null);
  const decoyBtn2Ref = React.useRef<IFocusable>(null);
  const [anchorRef, setAnchorRef] = React.useState<React.RefObject<View> | undefined>(redTargetRef);
  const [hoveredTargetsCount, setHoveredTargetsCount] = React.useState(0);
  const [displayCountHoveredTargets, setDisplayCountHoveredTargets] = React.useState(0);

  const anchorRefsInfo: { hoverCount: number; isCurrentAnchor: boolean[] } = React.useMemo(() => {
    return {
      hoverCount: displayCountHoveredTargets,
      isCurrentAnchor: [
        openCalloutOnHoverAnchor && isStandardCalloutVisible && anchorRef == redTargetRef,
        openCalloutOnHoverAnchor && isStandardCalloutVisible && anchorRef == greenTargetRef,
        openCalloutOnHoverAnchor && isStandardCalloutVisible && anchorRef == blueTargetRef,
      ],
    };
  }, [anchorRef, displayCountHoveredTargets, isStandardCalloutVisible, openCalloutOnHoverAnchor]);

  // Use a timer to update the targets count and avoid jittery updates of counts on-screen
  React.useLayoutEffect(() => {
    const timer = setTimeout(() => {
      setDisplayCountHoveredTargets(hoveredTargetsCount);
    }, 50);

    return () => clearTimeout(timer);
  }, [hoveredTargetsCount]);

  React.useLayoutEffect(() => {
    // The callout may be dismissed by multiple mechanisms, depending on its active invocation
    // mechanisms.  In each of those dismissal routes, we use this function to reset the callout's
    // state universally.
    if (!showStandardCallout) {
      setIsStandardCalloutVisible(false);
      setCalloutHovered(false);
    }
  }, [showStandardCallout]);

  const toggleShowStandardCallout = React.useCallback(() => {
    setShowStandardCallout(!showStandardCallout);
  }, [showStandardCallout]);

  // Set up a LayoutEffect for hover callout mechanics including:
  //   the toggle switch for hover callout behavior
  //   multiple hover targets (i.e. the callout and its anchor)
  //   a dismissal timer for closing the callout with no targets hovered
  React.useLayoutEffect(() => {
    if (!openCalloutOnHoverAnchor) {
      setShowStandardCallout(false);
    } else if (openCalloutOnHoverAnchor && hoveredTargetsCount > 0) {
      setShowStandardCallout(true);
    } else {
      const timer = setTimeout(() => {
        setShowStandardCallout(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [openCalloutOnHoverAnchor, hoveredTargetsCount]);

  const updateCalloutTargetsHoverState = React.useCallback(
    (show: boolean, hoverAnchorRef: React.MutableRefObject<View>) => {
      if (hoverAnchorRef !== undefined && hoverAnchorRef !== anchorRef) {
        return;
      }

      setHoveredTargetsCount(hoveredTargetsCount + (show ? 1 : -1));
    },
    [anchorRef, hoveredTargetsCount, setHoveredTargetsCount],
  );

  const calloutHoveredCallback = React.useCallback(
    (isHovered: boolean) => {
      updateCalloutTargetsHoverState(isHovered, undefined);
      setCalloutHovered(isHovered);
    },
    [updateCalloutTargetsHoverState],
  );

  const toggleCalloutRef = React.useCallback(() => {
    // Cycle the target ref between the RGB target views
    setAnchorRef(anchorRef === redTargetRef ? greenTargetRef : anchorRef === greenTargetRef ? blueTargetRef : redTargetRef);
  }, [anchorRef]);

  const switchTargetRefOrRect = React.useCallback(() => {
    // Switch between RGB views or a fixed anchor
    setAnchorRef(anchorRef === redTargetRef || anchorRef === greenTargetRef || anchorRef == blueTargetRef ? undefined : redTargetRef);
  }, [anchorRef]);

  React.useEffect(() => {
    if (!showStandardCallout && anchorRef === undefined) {
      setAnchorRef(redTargetRef);
    }
  }, [anchorRef, setAnchorRef, showStandardCallout]);

  const onShowStandardCallout = React.useCallback(() => {
    setIsStandardCalloutVisible(true);
  }, []);

  const onDismissStandardCallout = React.useCallback(() => {
    // setting the internal state to false will instigate unmounting the
    // zombie Callout control.
    setShowStandardCallout(false);
  }, []);

  const onShiftFocusToCallout = React.useCallback(() => {
    console.warn('trying to focus the Callout: ' + calloutRef.current);
    calloutRef?.current?.focusWindow?.();
  }, [calloutRef]);
  const onShiftFocusToCalloutButton = React.useCallback(() => {
    console.warn('trying to focus the Callout BUTTON: ' + calloutButtonRef.current);
    calloutButtonRef?.current?.focus?.();
  }, [calloutButtonRef]);
  const onShiftFocusToPage = React.useCallback(() => {
    console.warn('trying to blur the Callout: ' + calloutRef.current);
    calloutRef?.current?.blurWindow?.();
  }, [calloutRef]);
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
  const menuPickerColorCollection = colorSelections.map((color) => {
    return {
      label: color,
      value: color,
    };
  });

  const [selectedBackgroundColor, setSelectedBackgroundColor] = React.useState<string | undefined>(undefined);
  const [selectedBorderColor, setSelectedBorderColor] = React.useState<string | undefined>(undefined);

  const borderWidthDefault: string = Platform.OS === 'macos' ? '0' : '1';
  const borderWidthSelections: string[] = ['0', '1', '2', '4', '10'];
  const menuPickerBorderWidthCollection = borderWidthSelections.map((width) => {
    return {
      label: width,
      value: width,
    };
  });

  const borderRadiusDefault: string = '5';
  const borderRadiusSelections: string[] = ['0', '5', '7', '15'];
  const menuPickerBorderRadiusCollection = borderRadiusSelections.map((width) => {
    return {
      label: width,
      value: width,
    };
  });

  const [selectedBorderWidth, setSelectedBorderWidth] = React.useState<string | undefined>(undefined);
  const [selectedBorderRadius, setSelectedBorderRadius] = React.useState<string | undefined>(undefined);

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

  const calloutTargetOrAnchor: Partial<ICalloutProps> = {};
  if (anchorRef) {
    calloutTargetOrAnchor.target = anchorRef;
  } else {
    calloutTargetOrAnchor.anchorRect = { screenX: 50, screenY: 50, width: 1, height: 1 };
  }

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

          <MenuPicker
            prompt="Background Color"
            selected={selectedBackgroundColor || colorDefault}
            onChange={(color) => setSelectedBackgroundColor(color === colorDefault ? undefined : color)}
            collection={menuPickerColorCollection}
          />
          <MenuPicker
            prompt="Border Color"
            selected={selectedBorderColor || colorDefault}
            onChange={(color) => setSelectedBorderColor(color === colorDefault ? undefined : color)}
            collection={menuPickerColorCollection}
          />
          <MenuPicker
            prompt="Border Width"
            selected={selectedBorderWidth || borderWidthDefault}
            onChange={(color) => setSelectedBorderWidth(color === colorDefault ? undefined : color)}
            collection={menuPickerBorderWidthCollection}
          />
          <MenuPicker
            prompt="Border Radius"
            selected={selectedBorderRadius || borderRadiusDefault}
            onChange={(radius) => setSelectedBorderRadius(radius === borderRadiusDefault ? undefined : radius)}
            collection={menuPickerBorderRadiusCollection}
          />
        </View>

        <Separator vertical />

        <View style={{ flexDirection: 'column', paddingHorizontal: 5 }}>
          <Button onClick={toggleShowStandardCallout} disabled={openCalloutOnHoverAnchor}>
            {(openCalloutOnHoverAnchor ? 'Hover Color Anchor ' : 'Press Here ') + 'for Callout'}
          </Button>
          <Text>
            <Text>Visibility: </Text>
            {isStandardCalloutVisible ? <Text style={{ color: 'green' }}>Visible</Text> : <Text style={{ color: 'red' }}>Not Visible</Text>}
          </Text>
        </View>

        <Separator vertical />

        <View style={{ flexDirection: 'column', paddingHorizontal: 5 }}>
          <Pressable
            onHoverIn={() => updateCalloutTargetsHoverState(true, redTargetRef)}
            onHoverOut={() => updateCalloutTargetsHoverState(false, redTargetRef)}
          >
            <View ref={redTargetRef} style={{ height: 40, width: 40, backgroundColor: 'red', padding: 5 }}>
              {anchorRefsInfo.isCurrentAnchor[0] && <Text>{anchorRefsInfo.hoverCount}</Text>}
            </View>
          </Pressable>
          <Pressable
            onHoverIn={() => updateCalloutTargetsHoverState(true, greenTargetRef)}
            onHoverOut={() => updateCalloutTargetsHoverState(false, greenTargetRef)}
          >
            <View ref={greenTargetRef} style={{ height: 40, width: 40, backgroundColor: 'green', padding: 5 }}>
              {anchorRefsInfo.isCurrentAnchor[1] && <Text>{anchorRefsInfo.hoverCount}</Text>}
            </View>
          </Pressable>
          <Pressable
            onHoverIn={() => updateCalloutTargetsHoverState(true, blueTargetRef)}
            onHoverOut={() => updateCalloutTargetsHoverState(false, blueTargetRef)}
          >
            <View ref={blueTargetRef} style={{ height: 40, width: 40, backgroundColor: 'blue', padding: 5 }}>
              {anchorRefsInfo.isCurrentAnchor[2] && <Text style={{ color: 'white' }}>{anchorRefsInfo.hoverCount}</Text>}
            </View>
          </Pressable>
        </View>
      </View>

      <Separator />

      <View style={{ paddingVertical: 5 }}>
        <Button componentRef={decoyBtn1Ref} onClick={onShiftFocusToCallout}>
          {'Custom reFocus w/ focus in Callout'}
        </Button>
        <Button componentRef={decoyBtn2Ref} onClick={onShiftFocusToCalloutButton}>
          {'Custom reFocus w/o focus in Callout'}
        </Button>
      </View>

      {showStandardCallout && (
        <Callout
          componentRef={calloutRef}
          {...{
            doNotTakePointerCapture: openCalloutOnHoverAnchor ?? undefined,
            ...calloutTargetOrAnchor,
            onDismiss: onDismissStandardCallout,
            onShow: onShowStandardCallout,
            ...(customRestoreFocus && { onRestoreFocus: onRestoreFocusStandardCallout }),
            accessibilityLabel: 'Standard Callout',
            setInitialFocus: shouldSetInitialFocus,
            isBeakVisible: isBeakVisible,
            ...(selectedBorderColor && { borderColor: selectedBorderColor }),
            ...(selectedBackgroundColor && { backgroundColor: selectedBackgroundColor }),
            ...(selectedBorderWidth && { borderWidth: parseInt(selectedBorderWidth) }),
            ...(selectedBorderRadius && { borderRadius: parseInt(selectedBorderRadius) }),
            ...(calloutDismissBehaviors && { dismissBehaviors: calloutDismissBehaviors }),
          }}
        >
          <Pressable onHoverIn={() => calloutHoveredCallback(true)} onHoverOut={() => calloutHoveredCallback(false)}>
            {showScrollViewCallout ? (
              <View style={fluentTesterStyles.scrollViewContainer}>
                <ScrollView contentContainerStyle={fluentTesterStyles.scrollViewStyle} showsVerticalScrollIndicator={true}>
                  <Button onClick={toggleCalloutRef}>{'click to change anchor'}</Button>
                  <Button onClick={switchTargetRefOrRect}>{'click to switch between anchor and rect'}</Button>
                  <Button style={fluentTesterStyles.testListItem} onClick={addButton}>
                    {'Click to add a button'}
                  </Button>
                  <Button style={fluentTesterStyles.testListItem} onClick={removeButton}>
                    {'Click to remove a button'}
                  </Button>
                  {scrollviewContents.map((value) => {
                    return (
                      <Button key={value} style={fluentTesterStyles.testListItem}>
                        {'Button'}
                      </Button>
                    );
                  })}
                </ScrollView>
              </View>
            ) : (
              //else
              <View style={{ padding: 20, backgroundColor: calloutHovered ? 'lightgreen' : 'pink' }}>
                <Button onClick={toggleCalloutRef}>{'click to change anchor'}</Button>
                <Button onClick={onShiftFocusToCalloutButton}>{'focus last button'}</Button>
                <Button onClick={switchTargetRefOrRect}>{'click to switch between anchor and rect'}</Button>
                <Button componentRef={calloutButtonRef} onClick={onShiftFocusToPage}>
                  {'Click to invoke blur()'}
                </Button>
              </View>
            )}
          </Pressable>
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

  const myRect: KeyboardMetrics = { screenX: 10, screenY: 10, width: 100, height: 100 };

  return (
    <View>
      <View style={{ flexDirection: 'column', paddingVertical: 5 }}>
        <Button onClick={toggleShowCustomizedCallout}>{'Press for Callout'}</Button>
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
];

const e2eSections: TestSection[] = [
  {
    name: 'E2E Testing Callout',
    component: E2ECalloutTest,
  },
];

export const CalloutTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'Backlog',
    iosStatus: 'N/A',
    macosStatus: 'Production',
    androidStatus: 'N/A',
  };

  const description = 'A callout is an anchored tip that can be used to teach people or guide them through the app without blocking them.';

  return <Test name="Callout Test" description={description} sections={calloutSections} status={status} e2eSections={e2eSections}></Test>;
};
