import React, { useState, useCallback, FunctionComponent } from 'react';
import {
  AvatarSize,
  AvatarSizes,
  AvatarColor,
  AvatarColors,
  JSAvatar,
  AvatarActive,
  AvatarActiveAppearance,
} from '@fluentui-react-native/experimental-avatar';
import { PresenceBadgeStatuses, PresenceBadgeStatus } from '@fluentui-react-native/badge';
import { Switch, View, Text, Picker, ColorValue, Platform } from 'react-native';
import { satyaPhotoUrl, undefinedText } from './../PersonaCoin/styles';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { useTheme } from '@fluentui-react-native/theme-types';
import TestSvg from '../../test-data/test.svg';
import { SvgIconProps } from '@fluentui-react-native/icon';

type WithUndefined<T> = T | typeof undefinedText;

const avatarActive: AvatarActive[] = ['unset', 'active', 'inactive'];
const avatarColors: AvatarColor[] = ['neutral', 'brand', 'colorful', ...AvatarColors];
const avatarActiveAppearance: AvatarActiveAppearance[] = ['ring'];

const allSizes: WithUndefined<AvatarSize>[] = [undefinedText, ...AvatarSizes];
const allPresences: WithUndefined<PresenceBadgeStatus>[] = [undefinedText, ...PresenceBadgeStatuses];

const StyledPicker = (props) => {
  const { prompt, selected, onChange, collection } = props;
  const theme = useTheme();
  const pickerStyles = { color: theme.colors.inputText as ColorValue, ...commonStyles.header };
  return (
    <Picker prompt={prompt} style={pickerStyles} selectedValue={selected} onValueChange={onChange}>
      {collection.map((value, index) => (
        <Picker.Item label={value} key={index} value={value} />
      ))}
    </Picker>
  );
};

export const StandardUsage: FunctionComponent = () => {
  const [isSquare, setSquare] = useState(false);
  const [showImage, setShowImage] = useState(true);
  const [active, setActive] = useState<AvatarActive>('unset');
  const [activeAppearance, setActiveAppearance] = useState<AvatarActiveAppearance>('ring');
  const [imageSize, setImageSize] = useState<WithUndefined<AvatarSize>>(72);
  const [presence, setPresence] = useState<WithUndefined<PresenceBadgeStatus>>('available');
  const [avatarColor, setAvatarColor] = useState<AvatarColor>('brass');

  const onActiveChange = useCallback((value) => setActive(value), []);
  const onActiveAppearanceChange = useCallback((value) => setActiveAppearance(value), []);
  const onAvatarColorChange = useCallback((value) => setAvatarColor(value), []);
  const onSizeChange = useCallback((value) => setImageSize(value), []);

  const onPresenceChange = useCallback((value) => setPresence(value), []);

  const theme = useTheme();
  const textStyles = { color: theme.colors.inputText as ColorValue };
  const avatarSizesForPicker = allSizes.map((size) => size.toString());

  const fontBuiltInProps = {
    fontFamily: 'Arial',
    codepoint: 0x2663,
  };

  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };
  const iconProps = { svgSource: svgProps, width: 20, height: 20, color: 'red' };

  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);

  return (
    <View style={commonStyles.root}>
      <View style={commonStyles.settings}>
        <View style={commonStyles.switch}>
          <Text style={textStyles}>Show image</Text>
          <Switch value={showImage} onValueChange={setShowImage} />
        </View>
        <View style={commonStyles.switch}>
          <Text style={textStyles}>Set square Avatar</Text>
          <Switch value={isSquare} onValueChange={() => setSquare(!isSquare)} />
        </View>

        <StyledPicker prompt="Size" selected={imageSize.toString()} onChange={onSizeChange} collection={avatarSizesForPicker} />
        <StyledPicker prompt="Active" selected={active} onChange={onActiveChange} collection={avatarActive} />
        {active === 'active' ? (
          <StyledPicker
            prompt="Active appearance"
            selected={activeAppearance}
            onChange={onActiveAppearanceChange}
            collection={avatarActiveAppearance}
          />
        ) : null}
        <StyledPicker prompt="Avatar Color" selected={avatarColor} onChange={onAvatarColorChange} collection={avatarColors} />
        <StyledPicker prompt="Presence status" selected={presence} onChange={onPresenceChange} collection={allPresences} />
      </View>
      <JSAvatar />
      <JSAvatar icon={{ fontSource: { ...fontBuiltInProps, fontSize: 32 }, color: 'red' }} size={56} />
      <JSAvatar icon={{ fontSource: { ...fontBuiltInProps }, color: 'white' }} size={120} />
      <JSAvatar
        active={active}
        activeAppearance={activeAppearance}
        size={imageSize === undefinedText ? undefined : imageSize}
        name="Satya Nadella"
        shape={isSquare ? 'square' : 'circular'}
        accessibilityLabel="Photo of Satya Nadella"
        badge={{ status: presence === undefinedText ? undefined : presence }}
        src={showImage ? satyaPhotoUrl : undefined}
        avatarColor={avatarColor}
      />
      <JSAvatar
        active={active}
        activeAppearance={activeAppearance}
        size={imageSize === undefinedText ? undefined : imageSize}
        shape={isSquare ? 'square' : 'circular'}
        accessibilityLabel="Icon"
        name="* Richard Faynman *"
        icon={{ fontSource: { ...fontBuiltInProps }, color: 'white' }}
        avatarColor={avatarColor}
      />
      {svgIconsEnabled && (
        <>
          <JSAvatar
            active={active}
            activeAppearance={activeAppearance}
            size={imageSize === undefinedText ? undefined : imageSize}
            shape={isSquare ? 'square' : 'circular'}
            accessibilityLabel="SVG Icon"
            icon={iconProps}
            avatarColor={avatarColor}
            badge={{ status: 'outOfOffice' }}
          />
          <JSAvatar
            accessibilityHint="A picture representing a user"
            active={active}
            activeAppearance={activeAppearance}
            size={imageSize === undefinedText ? undefined : imageSize}
            shape={isSquare ? 'square' : 'circular'}
            accessibilityLabel="SVG Icon"
            icon={{ svgSource: svgProps, width: 20, height: 20 }}
            avatarColor={avatarColor}
            badge={{ status: 'away' }}
          />
        </>
      )}
    </View>
  );
};
