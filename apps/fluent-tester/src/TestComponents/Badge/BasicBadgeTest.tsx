/* eslint-disable @typescript-eslint/no-var-requires */
import React, { useState, useCallback, useMemo } from 'react';
import { View, Platform, Text, Image } from 'react-native';
import {
  Badge,
  BadgeAppearance,
  BadgeAppearances,
  BadgeColor,
  BadgeColors,
  BadgeShape,
  BadgeShapes,
  BadgeSize,
  BadgeSizes,
  BadgeIconPosition,
  BadgeProps,
  BadgeTokens,
} from '@fluentui-react-native/badge';
import { StyledPicker } from '../Common/StyledPicker';
import { satyaPhotoUrl } from './../PersonaCoin/styles';
import { ToggleButton } from '@fluentui/react-native';
import { useFluentTheme } from '@fluentui-react-native/framework';
import { svgProps, iconProps } from '../Common/iconExamples';

const badgeColors: BadgeColor[] = [...BadgeColors];
const badgeShapes: BadgeShape[] = [...BadgeShapes];
const badgeSizes: BadgeSize[] = [...BadgeSizes];
const badgeAppearances: BadgeAppearance[] = [...BadgeAppearances];
const badgeIconPositions = ['before', 'after'];

const useCustomizedBadge = (tokensAndprops: BadgeProps & BadgeTokens) => {
  return useMemo(() => Badge.customize({ ...tokensAndprops }), [tokensAndprops]);
};

export const BasicBadge: React.FunctionComponent = () => {
  const [badgeAppearance, setBadgeAppearance] = useState<BadgeAppearance>('filled');
  const [badgeColor, setBadgeColor] = useState<BadgeColor>('brand');
  const [shape, setShape] = useState<BadgeShape>('circular');
  const [size, setSize] = useState<BadgeSize>('medium');
  const [showIcon, setShowIcon] = useState(false);
  const [iconPosition, setIconPosition] = useState<BadgeIconPosition>('before');
  const [showShadow, setShowShadow] = useState(false);

  const onBadgeAppearanceChange = useCallback((value) => setBadgeAppearance(value), []);
  const onBadgeColorChange = useCallback((value) => setBadgeColor(value), []);
  const onShapeChange = useCallback((value) => setShape(value), []);
  const onSizeChange = useCallback((value) => setSize(value), []);
  const onIconPositionChange = useCallback((value) => setIconPosition(value), []);
  const onShowShadowChange = useCallback(() => setShowShadow(!showShadow), [showShadow, setShowShadow]);
  const onShowIconChange = useCallback(() => setShowIcon(!showIcon), [showIcon, setShowIcon]);

  const theme = useFluentTheme();

  const fontBuiltInProps = {
    fontFamily: 'Arial',
    codepoint: 0x2663,
    fontSize: 16,
  };

  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);

  const shadow = showShadow ? theme.shadows.shadow4 : undefined;
  const CustomBadge = useCustomizedBadge({ shadowToken: shadow });

  const badgeConfig = {
    appearance: badgeAppearance,
    badgeColor,
    size,
    shape,
  };

  const StyledBadge = useCustomizedBadge({
    fontWeight: 'bold',
    fontSize: 12,
    fontFamily: 'Georgia',
    backgroundColor: '#f09',
    borderColor: 'purple',
    color: 'yellow',
    borderWidth: 4,
    borderStyle: 'dashed',
    borderRadius: 2,
    iconColor: 'cyan',
    shadowToken: theme.shadows.shadow16,
  });

  return (
    <View>
      <StyledPicker prompt="Badge appearance" selected={badgeAppearance} onChange={onBadgeAppearanceChange} collection={badgeAppearances} />
      <StyledPicker prompt="Badge color" selected={badgeColor} onChange={onBadgeColorChange} collection={badgeColors} />
      <StyledPicker prompt="Shape" selected={shape} onChange={onShapeChange} collection={badgeShapes} />
      <StyledPicker prompt="Size" selected={size} onChange={onSizeChange} collection={badgeSizes} />
      {svgIconsEnabled && (
        <>
          <ToggleButton onClick={onShowIconChange} checked={showIcon}>
            Set {showIcon ? ' Hide icon' : ' Show icon'}
          </ToggleButton>
          <StyledPicker prompt="Icon position" selected={iconPosition} onChange={onIconPositionChange} collection={badgeIconPositions} />
        </>
      )}
      <ToggleButton onClick={onShowShadowChange} checked={showShadow}>
        Set {showShadow ? ' Hide shadow' : ' Show shadow'}
      </ToggleButton>

      <View style={{ position: 'relative', backgroundColor: 'yellow', padding: 20, width: 200 }}>
        <Text>Parent component for the Badge</Text>
        {svgIconsEnabled && showIcon ? (
          <CustomBadge {...badgeConfig} icon={{ svgSource: svgProps }} iconPosition={iconPosition}>
            Basic badge
          </CustomBadge>
        ) : (
          <CustomBadge {...badgeConfig}>Basic badge</CustomBadge>
        )}
      </View>
      <Text>Size</Text>
      <Badge size="tiny" />
      <Badge size="extraSmall" badgeColor="red" />
      <Badge size="small">Small</Badge>
      <Badge size="medium">Medium</Badge>
      <Badge size="large">Large</Badge>
      <Badge size="extraLarge">Extra Large</Badge>
      {svgIconsEnabled && (
        <>
          <Text>Badge with icon</Text>
          <Badge icon={iconProps} iconPosition="after">
            Badge with
            <Image source={{ uri: satyaPhotoUrl }} style={{ width: 20, height: 20 }} />
            <Text style={{ backgroundColor: 'yellow' }}>optional content</Text>
          </Badge>
          <Badge appearance="outline" icon={{ ...iconProps, width: 20, height: 20 }} />
          <Badge icon={{ fontSource: { ...fontBuiltInProps }, color: '#fff' }}>Badge with icon</Badge>
          <Text>Customized Badge with icon</Text>
          <StyledBadge icon={{ svgSource: svgProps }}>Styled badge</StyledBadge>
        </>
      )}
    </View>
  );
};
