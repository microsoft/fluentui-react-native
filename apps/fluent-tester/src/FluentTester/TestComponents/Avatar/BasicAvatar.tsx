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
import { Switch, View, Text, ColorValue, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { satyaPhotoUrl, undefinedText } from './../PersonaCoin/styles';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { useTheme } from '@fluentui-react-native/theme-types';
import TestSvg from '../../test-data/test.svg';
import { SvgIconProps } from '@fluentui-react-native/icon';
import { MenuPicker } from '../Common/MenuPicker';

type WithUndefined<T> = T | typeof undefinedText;

const avatarActive: AvatarActive[] = ['unset', 'active', 'inactive'];
const avatarColors: AvatarColor[] = ['neutral', 'brand', 'colorful', ...AvatarColors];
const avatarActiveAppearance: AvatarActiveAppearance[] = ['ring'];

const allSizes: WithUndefined<AvatarSize>[] = [undefinedText, ...AvatarSizes];
const allPresences: WithUndefined<PresenceBadgeStatus>[] = [undefinedText, ...PresenceBadgeStatuses];

export const StandardUsage: FunctionComponent = () => {
  const [isSquare, setSquare] = useState(false);
  const [showImage, setShowImage] = useState(true);
  const [outOfOffice, setOutOfOffice] = useState(false);
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

  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);

  const renderMenuPicker = Platform.OS == ('win32' as any) || Platform.OS == 'macos';

  const MenuPickers = () => {
    return (
      <View>
        <MenuPicker prompt="Size" selected={imageSize.toString()} onChange={onSizeChange} collection={avatarSizesForPicker} />
        <MenuPicker prompt="Active" selected={active} onChange={onActiveChange} collection={avatarActive} />
        {active === 'active' ? (
          <MenuPicker
            prompt="Active appearance"
            selected={activeAppearance}
            onChange={onActiveAppearanceChange}
            collection={avatarActiveAppearance}
          />
        ) : null}
        <MenuPicker prompt="Avatar Color" selected={avatarColor} onChange={onAvatarColorChange} collection={avatarColors} />
        <MenuPicker prompt="Presence status" selected={presence} onChange={onPresenceChange} collection={allPresences} />
      </View>
    );
  };

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

  const StyledPickers = () => {
    return (
      <View>
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
    );
  };

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
        <View style={commonStyles.switch}>
          <Text style={textStyles}>Set outOfOffice</Text>
          <Switch value={outOfOffice} onValueChange={() => setOutOfOffice(!outOfOffice)} />
        </View>

        {renderMenuPicker ? <MenuPickers /> : <StyledPickers />}
      </View>
      <JSAvatar
        accessibilityLabel="Fall-back Icon"
        accessibilityHint="A picture representing a user"
        size={imageSize === undefinedText ? undefined : imageSize}
      />
      <JSAvatar
        active={active}
        activeAppearance={activeAppearance}
        size={imageSize === undefinedText ? undefined : imageSize}
        name="Satya Nadella"
        shape={isSquare ? 'square' : 'circular'}
        accessibilityLabel="Photo of Satya Nadella"
        badge={{ status: presence === undefinedText ? undefined : presence, outOfOffice }}
        imageUrl={showImage ? satyaPhotoUrl : undefined}
        avatarColor={avatarColor}
      />
      <JSAvatar
        active={active}
        activeAppearance={activeAppearance}
        size={imageSize === undefinedText ? undefined : imageSize}
        shape={isSquare ? 'square' : 'circular'}
        accessibilityLabel="Icon"
        name="* Richard Faynman *"
        avatarColor="#ff0099"
        initialsColor="yellow"
      />
      {svgIconsEnabled && (
        <>
          <JSAvatar
            active={active}
            activeAppearance={activeAppearance}
            size={imageSize === undefinedText ? undefined : imageSize}
            shape={isSquare ? 'square' : 'circular'}
            accessibilityLabel="SVG Icon"
            icon={{ fontSource: { ...fontBuiltInProps, fontSize: 32 }, color: 'red' }}
            avatarColor={avatarColor}
            badge={{ status: 'outOfOffice', outOfOffice }}
          />
          <JSAvatar
            accessibilityHint="A picture representing a user"
            active={active}
            activeAppearance={activeAppearance}
            size={imageSize === undefinedText ? undefined : imageSize}
            shape={isSquare ? 'square' : 'circular'}
            accessibilityLabel="SVG Icon"
            icon={{ svgSource: svgProps }}
            avatarColor={avatarColor}
            badge={{ status: 'away', outOfOffice }}
            idForColor="15"
          />
        </>
      )}
    </View>
  );
};
