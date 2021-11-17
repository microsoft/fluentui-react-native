import * as React from 'react';
import { Avatar, Size } from '@fluentui-react-native/experimental-avatar';
import { Text } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { AVATAR_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { testImageSource, rainbowGradientSource } from './testImageSources';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { Switch, View } from 'react-native';

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
      <Avatar
        primaryText="Kat Larrson"
        secondaryText="Kat.Larrson@example.com"
        imageSource={showImage ? testImageSource : undefined}
        presence={showPresence ? 'available' : null}
        isRingVisible={showRing}
        size={'xxLarge'}
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
      <Avatar
        primaryText="Kat Larrson"
        secondaryText="Kat.Larrson@example.com"
        ringColor={showCustomRingColor ? 'red' : null}
        foregroundColor={showCustomForeground ? 'green' : null}
        backgroundColor={showCustomBackground ? 'blue' : null}
        customBorderImageSource={showCustomBorderImage ? rainbowGradientSource : null}
        isRingVisible={true}
        hasRingInnerGap={showRingGap}
        size={'xxLarge'}
      />
    </View>
  );
};

const AvatarSizeRamp: React.FunctionComponent = () => {
  const allSizes: Size[] = ['xSmall', 'small', 'medium', 'large', 'xLarge', 'xxLarge'];

  return (
    <Stack style={{ flexDirection: 'row' }}>
      {allSizes.map((size, index) => (
        <Avatar key={index} primaryText="Kat Larrson" secondaryText="Kat.Larrson@example.com" size={size} />
      ))}
    </Stack>
  );
};

const avatarSections: TestSection[] = [
  {
    name: 'Basic Avatar',
    testID: AVATAR_TESTPAGE,
    component: BasicAvatar,
  },
  {
    name: 'Custom Colors',
    testID: AVATAR_TESTPAGE,
    component: CustomizeColors,
  },
  {
    name: 'Size Ramp',
    component: AvatarSizeRamp,
  },
];

export const AvatarTest: React.FunctionComponent = () => {
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
