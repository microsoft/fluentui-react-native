import React, { useState, useCallback, FunctionComponent } from 'react';
import { AvatarSize, AvatarSizes, AvatarColor, AvatarColors, Avatar, AvatarActive } from '@fluentui-react-native/avatar';
import { PresenceBadgeStatuses, PresenceBadgeStatus } from '@fluentui-react-native/badge';
import { View, Text, Platform } from 'react-native';
import { satyaPhotoUrl, undefinedText } from './../PersonaCoin/styles';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { svgProps } from '../Common/iconExamples';
import { StyledPicker } from '../Common/StyledPicker';
import { ToggleButton } from '@fluentui/react-native';

type WithUndefined<T> = T | typeof undefinedText;

const avatarActive: AvatarActive[] = ['unset', 'active', 'inactive'];
const avatarColors: AvatarColor[] = ['neutral', 'brand', 'colorful', ...AvatarColors];

const allSizes: WithUndefined<AvatarSize>[] = [undefinedText, ...AvatarSizes];
const allPresences: WithUndefined<PresenceBadgeStatus>[] = [undefinedText, ...PresenceBadgeStatuses];

export const StandardUsage: FunctionComponent = () => {
  const [isSquare, setSquare] = useState(false);
  const [showImage, setShowImage] = useState(true);
  const [outOfOffice, setOutOfOffice] = useState(false);
  const [active, setActive] = useState<AvatarActive>('unset');
  const [imageSize, setImageSize] = useState<WithUndefined<AvatarSize>>(72);
  const [presence, setPresence] = useState<WithUndefined<PresenceBadgeStatus>>('available');
  const [avatarColor, setAvatarColor] = useState<AvatarColor>('brass');

  const onActiveChange = useCallback((value) => setActive(value), []);
  const onAvatarColorChange = useCallback((value) => setAvatarColor(value), []);
  const onSizeChange = useCallback((value) => setImageSize(value), []);

  const onPresenceChange = useCallback((value) => setPresence(value), []);
  const avatarSizesForPicker = allSizes.map((size) => size.toString());

  const activeAppearance = 'ring';

  const fontBuiltInProps = {
    fontFamily: 'Arial',
    codepoint: 0x2663,
  };

  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);
  const badgeStatus = presence === undefinedText ? undefined : presence;

  return (
    <View style={commonStyles.root}>
      <View style={commonStyles.settingsPicker}>
        <ToggleButton onClick={() => setShowImage(!showImage)} checked={showImage} style={commonStyles.vmargin}>
          {showImage ? 'Hide' : 'Show'} image
        </ToggleButton>
        <ToggleButton onClick={() => setSquare(!isSquare)} checked={isSquare} style={commonStyles.vmargin}>
          Set {isSquare ? ' circle' : ' square'} Avatar
        </ToggleButton>
        <ToggleButton onClick={() => setOutOfOffice(!outOfOffice)} checked={outOfOffice} style={commonStyles.vmargin}>
          Set {outOfOffice ? ' In office' : ' Out of office'}
        </ToggleButton>

        <StyledPicker prompt="Size" selected={imageSize.toString()} onChange={onSizeChange} collection={avatarSizesForPicker} />
        <StyledPicker prompt="Active" selected={active} onChange={onActiveChange} collection={avatarActive} />
        {active === 'active' && <Text>Active appearance is ring</Text>}
        <StyledPicker prompt="Avatar Color" selected={avatarColor} onChange={onAvatarColorChange} collection={avatarColors} />
        <StyledPicker prompt="Presence status" selected={presence} onChange={onPresenceChange} collection={allPresences} />
      </View>
      <View style={commonStyles.pickerControlled}>
        <Avatar
          accessibilityLabel="Fall-back Icon"
          accessibilityHint="A picture representing a user"
          size={imageSize === undefinedText ? undefined : imageSize}
        />
        <Avatar
          active={active}
          activeAppearance={activeAppearance}
          size={imageSize === undefinedText ? undefined : imageSize}
          name="Satya Nadella"
          shape={isSquare ? 'square' : 'circular'}
          accessibilityLabel="Photo of Satya Nadella"
          badge={{ status: badgeStatus, outOfOffice, accessibilityLabel: badgeStatus }}
          imageUrl={showImage ? satyaPhotoUrl : undefined}
          avatarColor={avatarColor}
        />
        <Avatar
          active={active}
          activeAppearance={activeAppearance}
          size={imageSize === undefinedText ? undefined : imageSize}
          shape={isSquare ? 'square' : 'circular'}
          accessibilityLabel="Icon"
          image={{ source: showImage ? { uri: satyaPhotoUrl } : undefined }}
          name="* Richard Faynman *"
          avatarColor="#ff0099"
          initialsColor="yellow"
        />
        <Avatar
          active={active}
          activeAppearance={activeAppearance}
          size={36}
          shape={isSquare ? 'square' : 'circular'}
          accessibilityLabel="SVG Icon"
          icon={{ fontSource: fontBuiltInProps }}
          avatarColor={avatarColor}
          badge={{ status: 'outOfOffice', outOfOffice }}
        />
        <Avatar
          active={active}
          activeAppearance={activeAppearance}
          size={imageSize === undefinedText ? undefined : imageSize}
          shape={isSquare ? 'square' : 'circular'}
          accessibilityLabel="SVG Icon"
          icon={{ fontSource: fontBuiltInProps, color: 'green' }}
          avatarColor={avatarColor}
          badge={{ status: 'outOfOffice', outOfOffice }}
        />
        {svgIconsEnabled && (
          <>
            <Avatar
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
    </View>
  );
};
