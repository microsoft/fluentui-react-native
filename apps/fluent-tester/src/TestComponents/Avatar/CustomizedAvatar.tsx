import React, { useState, useMemo } from 'react';
import { Avatar, AvatarSize } from '@fluentui-react-native/avatar';
import { View, Text, TextInput, Platform, StyleSheet } from 'react-native';
import { steveBallmerPhotoUrl } from './../PersonaCoin/styles';
import { commonTestStyles as commonStyles } from '../Common/styles';
import { FontWeight } from '@fluentui-react-native/theme-types';
import { svgProps } from '../Common/iconExamples';
import { ToggleButton } from '@fluentui/react-native';

const styles = StyleSheet.create({
  avatarTestCaseContainer: { marginLeft: 20 },
  avatarTokenOptions: { flexDirection: 'row' },
  fontTokenOptions: { paddingHorizontal: 20 },
  tokenHeader: { fontWeight: 'bold' },
});

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
  const [ringInnerGap, setRingInnerGap] = useState<string>('4');
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
      ringInnerGap: parseInt(ringInnerGap),
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
    ringInnerGap,
    ringThickness,
    fontWeight,
    fontFamily,
  ]);

  const svgIconsEnabled = ['ios', 'macos', 'win32', 'android'].includes(Platform.OS as string);

  return (
    <View style={commonStyles.root}>
      <View style={commonStyles.settings}>
        <ToggleButton onClick={() => setShowImage(!showImage)} checked={showImage} style={commonStyles.vmargin}>
          {showImage ? 'Hide' : 'Show'} image
        </ToggleButton>
        <ToggleButton onClick={() => setShowInitials(!showInitials)} checked={showInitials} style={commonStyles.vmargin}>
          {showInitials ? 'Hide' : 'Show'} initials
        </ToggleButton>
        <ToggleButton onClick={() => setShowRing(!showRing)} checked={showRing} style={commonStyles.vmargin}>
          {showRing ? 'Hide' : 'Show'} ring
        </ToggleButton>
        <View style={styles.avatarTokenOptions}>
          <View>
            <TextInput
              accessibilityLabel="Name for generating initials"
              style={commonStyles.textBox}
              placeholder="Name for generating initials"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setName(e.nativeEvent.text);
              }}
            />
            <TextInput
              accessibilityLabel="Initials"
              style={commonStyles.textBox}
              placeholder="Initials"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setInitials(e.nativeEvent.text);
              }}
            />
            <Text style={styles.tokenHeader}>Avatar tokens</Text>
            <TextInput
              accessibilityLabel="Background color"
              style={commonStyles.textBox}
              placeholder="Background color"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setAvatarColor(e.nativeEvent.text);
              }}
            />

            <TextInput
              accessibilityLabel="Avatar size"
              style={commonStyles.textBox}
              placeholder="Avatar size"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setSize(e.nativeEvent.text);
              }}
            />

            <TextInput
              accessibilityLabel="Icon size"
              style={commonStyles.textBox}
              placeholder="Icon size"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setIconSize(parseInt(e.nativeEvent.text));
              }}
            />
            <TextInput
              accessibilityLabel="Icon color"
              style={commonStyles.textBox}
              placeholder="Icon color"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setIconColor(e.nativeEvent.text);
              }}
            />
            <Text style={styles.tokenHeader}>Ring tokens</Text>
            <TextInput
              accessibilityLabel="Ring background color"
              style={commonStyles.textBox}
              placeholder="Ring background color"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setRingBackgroundColor(e.nativeEvent.text);
              }}
            />
            <TextInput
              accessibilityLabel="Ring color"
              style={commonStyles.textBox}
              placeholder="Ring color"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setRingColor(e.nativeEvent.text);
              }}
            />
            <TextInput
              accessibilityLabel="Ring thickness"
              style={commonStyles.textBox}
              placeholder="Ring thickness"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setRingThickness(e.nativeEvent.text);
              }}
            />
            <TextInput
              accessibilityLabel="Ring inner gap"
              style={commonStyles.textBox}
              placeholder="Ring inner gap"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setRingInnerGap(e.nativeEvent.text);
              }}
            />
          </View>
          <View style={styles.fontTokenOptions}>
            <Text style={styles.tokenHeader}>Font tokens</Text>
            <TextInput
              accessibilityLabel="Initials text color"
              style={commonStyles.textBox}
              placeholder="Initials text color"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setTextColor(e.nativeEvent.text);
              }}
            />
            <TextInput
              accessibilityLabel="Initials size"
              style={commonStyles.textBox}
              placeholder="Initials size"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setInitialsSize(parseInt(e.nativeEvent.text));
              }}
            />
            <TextInput
              accessibilityLabel="Font weight"
              style={commonStyles.textBox}
              placeholder="Font weight"
              blurOnSubmit={true}
              onSubmitEditing={(e) => {
                setFontWeight(e.nativeEvent.text);
              }}
            />
            <TextInput
              accessibilityLabel="Font family"
              style={commonStyles.textBox}
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
      <View style={styles.avatarTestCaseContainer}>
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
          ringInnerGap={parseInt(ringInnerGap)}
        />
      </View>
    </View>
  );
};
