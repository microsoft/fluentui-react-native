import React, { useState, useMemo } from 'react';
import { Avatar, AvatarSize } from '@fluentui-react-native/avatar';
import { Switch, View, Text, TextInput, Platform } from 'react-native';
import { steveBallmerPhotoUrl } from './../PersonaCoin/styles';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { FontWeight } from '@fluentui-react-native/theme-types';
import { SvgIconProps } from '@fluentui-react-native/icon';
import TestSvg from '../../test-data/test.svg';

export const CustomizeUsage: React.FunctionComponent = () => {
  const [showImage, setShowImage] = useState(true);
  const [showInitials, setShowInitials] = useState(true);
  const [avatarColor, setAvatarColor] = useState<string>();
  const [textColor, setTextColor] = useState<string>();
  const [size, setSize] = useState<string>('96');
  const [iconSize, setIconSize] = useState<number>(24);
  const [iconColor, setIconColor] = useState<string>(undefined);
  const [initialsSize, setInitialsSize] = useState<number>(16);
  const [fontWeight, setFontWeight] = useState<string>('normal');
  const [fontFamily, setFontFamily] = useState<string>('Georgia');
  const [name, setName] = useState<string>('Steve Ballmer');
  const [initials, setInitials] = useState<string>('');

  const [ringColor, setRingColor] = useState<string>(undefined);
  const [ringBackgroundColor, setRingBackgroundColor] = useState<string>('yellow');
  const [ringThickness, setRingThickness] = useState<string>('4');
  const [showRing, setShowRing] = useState<boolean>(true);

  const CustomizedAvatar = useMemo(() => {
    const tokens = {
      avatarColor,
      color: textColor,
      size: parseInt(size) as AvatarSize,
      iconSize: iconSize,
      iconColor,
      fontSize: initialsSize,
      fontWeight: fontWeight as FontWeight,
      fontFamily,
      ringColor,
      ringBackgroundColor,
      ringThickness: parseInt(ringThickness),
    };
    return Avatar.customize(tokens);
  }, [
    avatarColor,
    textColor,
    iconColor,
    iconSize,
    initialsSize,
    size,
    ringColor,
    ringBackgroundColor,
    ringThickness,
    fontWeight,
    fontFamily,
  ]);

  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);
  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };

  return (
    <View style={commonStyles.root}>
      <View style={commonStyles.settings}>
        <View style={commonStyles.switch}>
          <Text>Show image</Text>
          <Switch value={showImage} onValueChange={setShowImage} />
        </View>
        <View style={commonStyles.switch}>
          <Text>Show initials</Text>
          <Switch value={showInitials} onValueChange={setShowInitials} />
        </View>

        <View style={commonStyles.switch}>
          <Text>Show rings</Text>
          <Switch value={showRing} onValueChange={setShowRing} />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <View>
            <TextInput
              style={[commonStyles.textBox]}
              placeholder="Name for generating initials"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setName(e.nativeEvent.text);
              }}
            />
            <TextInput
              style={[commonStyles.textBox]}
              placeholder="Initials"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setInitials(e.nativeEvent.text);
              }}
            />
            <Text style={{ fontWeight: 'bold' }}>Avatar tokens</Text>
            <TextInput
              style={[commonStyles.textBox]}
              placeholder="Background color"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setAvatarColor(e.nativeEvent.text);
              }}
            />

            <TextInput
              style={[commonStyles.textBox]}
              placeholder="Avatar size"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setSize(e.nativeEvent.text);
              }}
            />

            <TextInput
              style={[commonStyles.textBox]}
              placeholder="Icon size"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setIconSize(parseInt(e.nativeEvent.text));
              }}
            />
            <TextInput
              style={[commonStyles.textBox]}
              placeholder="Icon color"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setIconColor(e.nativeEvent.text);
              }}
            />
            <Text style={{ fontWeight: 'bold' }}>Ring tokens</Text>
            <TextInput
              style={[commonStyles.textBox]}
              placeholder="Ring background color"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setRingBackgroundColor(e.nativeEvent.text);
              }}
            />
            <TextInput
              style={[commonStyles.textBox]}
              placeholder="Ring color"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setRingColor(e.nativeEvent.text);
              }}
            />
            <TextInput
              style={[commonStyles.textBox]}
              placeholder="Ring thickness"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setRingThickness(e.nativeEvent.text);
              }}
            />
          </View>
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ fontWeight: 'bold' }}>Font tokens</Text>
            <TextInput
              style={[commonStyles.textBox]}
              placeholder="Initials text color"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setTextColor(e.nativeEvent.text);
              }}
            />
            <TextInput
              style={[commonStyles.textBox]}
              placeholder="Initials size"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setInitialsSize(parseInt(e.nativeEvent.text));
              }}
            />
            <TextInput
              style={[commonStyles.textBox]}
              placeholder="Font weight"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setFontWeight(e.nativeEvent.text);
              }}
            />
            <TextInput
              style={[commonStyles.textBox]}
              placeholder="Font family"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setFontFamily(e.nativeEvent.text);
              }}
            />
          </View>
        </View>
      </View>
      <View>
        <Text>Customized Avatar</Text>
        <CustomizedAvatar
          active="active"
          activeAppearance="ring"
          avatarColor={avatarColor}
          accessibilityLabel="Former CEO of Microsoft"
          initials={showInitials ? initials : undefined}
          name={showInitials ? name : undefined}
          imageUrl={showImage ? steveBallmerPhotoUrl : undefined}
          icon={svgIconsEnabled ? { svgSource: svgProps } : undefined}
          transparentRing={!showRing}
        />
      </View>
      <View style={{ marginLeft: 20 }}>
        <Text>Avatar customized with props</Text>
        <Avatar
          active="active"
          activeAppearance="ring"
          avatarColor={avatarColor}
          accessibilityLabel="Former CEO of Microsoft"
          initials={showInitials ? initials : undefined}
          name={showInitials ? name : undefined}
          imageUrl={showImage ? steveBallmerPhotoUrl : undefined}
          ringBackgroundColor={ringBackgroundColor}
          ringColor={ringColor}
          ringThickness={parseInt(ringThickness)}
          size={parseInt(size) as AvatarSize}
          transparentRing={!showRing}
        />
      </View>
    </View>
  );
};
