import * as React from 'react';
import { Switch, View } from 'react-native';

import { Text } from '@fluentui/react-native';
import { NATIVE_AVATAR_TESTPAGE } from '@fluentui-react-native/e2e-testing';
import type { Size } from '@fluentui-react-native/experimental-avatar/';
import { NativeAvatar } from '@fluentui-react-native/experimental-avatar/';
import { Stack } from '@fluentui-react-native/stack';

import { testImageSource, rainbowGradientSource } from './testImageSources';
import { commonTestStyles as commonStyles } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

export const BasicAvatar: React.FunctionComponent = () => {
  const [showImage, setShowImage] = React.useState(true);
  const [showPresence, setShowPresence] = React.useState(false);
  const [showRing, setShowRing] = React.useState(false);

  return (
    <View style={commonStyles.root}>
      {/* settings */}
      <View style={commonStyles.settings}>
        <View style={commonStyles.switch}>
          <Text>Show image</Text>
          <Switch value={showImage} onValueChange={setShowImage} />
        </View>
        <View style={commonStyles.switch}>
          <Text>Show presence</Text>
          <Switch value={showPresence} onValueChange={setShowPresence} />
        </View>
        <View style={commonStyles.switch}>
          <Text>Show Ring</Text>
          <Switch value={showRing} onValueChange={setShowRing} />
        </View>
      </View>
      {/* component under test */}
      <NativeAvatar
        primaryText="Kat Larrson"
        secondaryText="Kat.Larrson@example.com"
        imageSource={showImage ? testImageSource : undefined}
        presence={showPresence ? 'available' : null}
        isRingVisible={showRing}
        size={'size72'}
      />
    </View>
  );
};

export const CustomizeColors: React.FunctionComponent = () => {
  const [showCustomRingColor, setShowCustomRingColor] = React.useState(false);
  const [showCustomForeground, setShowCustomForeground] = React.useState(false);
  const [showCustomBackground, setShowCustomBackground] = React.useState(false);
  const [showCustomBorderImage, setShowCustomBorderImage] = React.useState(false);
  const [showRingGap, setShowRingGap] = React.useState(false);

  return (
    <View style={commonStyles.root}>
      {/* settings */}
      <View style={commonStyles.settings}>
        <View style={commonStyles.switch}>
          <Text>Custom foreground</Text>
          <Switch value={showCustomForeground} onValueChange={setShowCustomForeground} />
        </View>
        <View style={commonStyles.switch}>
          <Text>Custom background</Text>
          <Switch value={showCustomBackground} onValueChange={setShowCustomBackground} />
        </View>
        <View style={commonStyles.switch}>
          <Text>Custom ring color</Text>
          <Switch value={showCustomRingColor} onValueChange={setShowCustomRingColor} />
        </View>
        <View style={commonStyles.switch}>
          <Text>Custom Border Image</Text>
          <Switch value={showCustomBorderImage} onValueChange={setShowCustomBorderImage} />
        </View>
        <View style={commonStyles.switch}>
          <Text>Show Ring Gap</Text>
          <Switch value={showRingGap} onValueChange={setShowRingGap} />
        </View>
      </View>
      {/* component under test */}
      <NativeAvatar
        primaryText="Kat Larrson"
        secondaryText="Kat.Larrson@example.com"
        ringColor={showCustomRingColor ? 'red' : null}
        foregroundColor={showCustomForeground ? 'green' : null}
        backgroundColor={showCustomBackground ? 'blue' : null}
        customBorderImageSource={showCustomBorderImage ? rainbowGradientSource : null}
        isRingVisible={true}
        hasRingInnerGap={showRingGap}
        size={'size72'}
      />
    </View>
  );
};

const AvatarSizeRamp: React.FunctionComponent = () => {
  const allSizes: Size[] = ['size16', 'size20', 'size24', 'size32', 'size40', 'size56', 'size72'];

  return (
    <Stack style={{ flexDirection: 'row' }}>
      {allSizes.map((size, index) => (
        <NativeAvatar key={index} primaryText="Kat Larrson" secondaryText="Kat.Larrson@example.com" size={size} />
      ))}
    </Stack>
  );
};

const avatarSections: TestSection[] = [
  {
    name: 'Basic Avatar',
    testID: NATIVE_AVATAR_TESTPAGE,
    component: BasicAvatar,
  },
  {
    name: 'Custom Colors',
    testID: NATIVE_AVATAR_TESTPAGE,
    component: CustomizeColors,
  },
  {
    name: 'Size Ramp',
    component: AvatarSizeRamp,
  },
];

export const NativeAvatarTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Beta',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description =
    'AvatarView is a visual representation of a user, entity, or group. If an image is supplied, it is cropped to a circle of the requested size. If an image is not supplied, initials are extracted from the given name and email address provided and displayed on a colorful background.';

  return <Test name="Avatar Test" description={description} sections={avatarSections} status={status} />;
};
