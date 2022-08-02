/* eslint-disable @typescript-eslint/no-var-requires */
import React, { useState, useCallback } from 'react';
import { BADGE_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { View, Platform, Text, Image } from 'react-native';
import {
  Badge,
  PresenceBadge,
  BadgeAppearance,
  BadgeAppearances,
  BadgeColor,
  BadgeColors,
  BadgeShape,
  BadgeShapes,
  BadgeSize,
  BadgeSizes,
  BadgeIconPosition,
} from '@fluentui-react-native/badge';
import { SvgIconProps } from '@fluentui-react-native/icon';
import { StyledPicker } from '../Common/StyledPicker';
import { satyaPhotoUrl } from './../PersonaCoin/styles';
import TestSvg from '../../FluentTester/test-data/test.svg';
import { ToggleButton } from '@fluentui/react-native';

const badgeColors: BadgeColor[] = [...BadgeColors];
const badgeShapes: BadgeShape[] = [...BadgeShapes];
const badgeSizes: BadgeSize[] = [...BadgeSizes];
const badgeAppearances: BadgeAppearance[] = [...BadgeAppearances];
const badgeIconPositions = ['before', 'after'];

const BadgeNoBorder = Badge.customize({
  borderColor: 'transparent',
  borderWidth: 0,
});

const StyledBadge = Badge.customize({
  backgroundColor: 'yellow',
  borderColor: '#f09',
  borderWidth: 4,
});

export const BasicBadge: React.FunctionComponent = () => {
  const [badgeAppearance, setBadgeAppearance] = useState<BadgeAppearance>('filled');
  const [badgeColor, setBadgeColor] = useState<BadgeColor>('brand');
  const [shape, setShape] = useState<BadgeShape>('circular');
  const [size, setSize] = useState<BadgeSize>('medium');
  const [showIcon, setShowIcon] = useState(false);
  const [iconPosition, setIconPosition] = useState<BadgeIconPosition>('before');

  const onBadgeAppearanceChange = useCallback((value) => setBadgeAppearance(value), []);
  const onBadgeColorChange = useCallback((value) => setBadgeColor(value), []);
  const onShapeChange = useCallback((value) => setShape(value), []);
  const onSizeChange = useCallback((value) => setSize(value), []);
  const onIconPositionChange = useCallback((value) => setIconPosition(value), []);

  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };

  const fontBuiltInProps = {
    fontFamily: 'Arial',
    codepoint: 0x2663,
    fontSize: 16,
  };

  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);
  const iconProps = { svgSource: svgProps, width: 20, height: 20 };
  const badgeConfig = {
    appearance: badgeAppearance,
    color: badgeColor,
    size,
    shape,
  };

  return (
    <View>
      <StyledPicker prompt="Badge appearance" selected={badgeAppearance} onChange={onBadgeAppearanceChange} collection={badgeAppearances} />
      <StyledPicker prompt="Badge color" selected={badgeColor} onChange={onBadgeColorChange} collection={badgeColors} />
      <StyledPicker prompt="Shape" selected={shape} onChange={onShapeChange} collection={badgeShapes} />
      <StyledPicker prompt="Size" selected={size} onChange={onSizeChange} collection={badgeSizes} />
      {svgIconsEnabled && (
        <>
          <ToggleButton onClick={() => setShowIcon(!showIcon)} checked={showIcon}>
            Set {showIcon ? ' Hide icon' : ' Show icon'}
          </ToggleButton>
          <StyledPicker prompt="Icon position" selected={iconPosition} onChange={onIconPositionChange} collection={badgeIconPositions} />
        </>
      )}

      {svgIconsEnabled && showIcon ? (
        <Badge {...badgeConfig} icon={{ svgSource: svgProps }} iconPosition={iconPosition}>
          Basic badge
        </Badge>
      ) : (
        <Badge {...badgeConfig}>Basic badge</Badge>
      )}

      <Text>Size</Text>
      <Badge size="tiny" shape="circular" />
      <Badge size="extraSmall" shape="circular" />
      <Badge size="small">Small</Badge>
      <Badge size="medium">Medium</Badge>
      <Badge size="large">Large</Badge>
      <Badge size="extraLarge">Extra Large</Badge>
      {svgIconsEnabled && (
        <>
          <Text>Badge with icon</Text>
          <Badge icon={{ svgSource: svgProps }} iconPosition="after">
            Badge with
            <Image source={{ uri: satyaPhotoUrl }} style={{ width: 20, height: 20 }} />
            <Text style={{ backgroundColor: 'yellow' }}>optional content</Text>
          </Badge>
          <Badge appearance="outline" icon={iconProps} />
          <Badge icon={{ fontSource: { ...fontBuiltInProps }, color: '#fff' }}>Badge with icon</Badge>
          <Text>Customized Badge</Text>
          <BadgeNoBorder appearance="outline" icon={iconProps} />
        </>
      )}
      <StyledBadge appearance="outline">Styled badge</StyledBadge>
      {svgIconsEnabled && (
        <>
          <Text>Presence Badge</Text>
          <PresenceBadge status="available" size="extraLarge" />
          <PresenceBadge status="available" outOfOffice={true} size="large" />
          <PresenceBadge status="doNotDisturb" outOfOffice={true} />
          <PresenceBadge status="away" size="small" />
          <PresenceBadge status="busy" size="tiny" />
          <PresenceBadge status="offline" />
          <PresenceBadge status="outOfOffice" />
          <PresenceBadge status="away" />
        </>
      )}
    </View>
  );
};

const badgeSections: TestSection[] = [
  {
    name: 'Basic Badge',
    testID: BADGE_TESTPAGE,
    component: BasicBadge,
  },
];

export const BadgeTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description =
    'A badge is an additional visual descriptor for UI elements. It can be used to denote numerical value, status or general information.\n Included in this spec are base properties for usage in all badge scenarios. Reference properties for other badge types i.e. size, layout, and style variations';

  return <Test name="Badge Test" description={description} sections={badgeSections} status={status}></Test>;
};
