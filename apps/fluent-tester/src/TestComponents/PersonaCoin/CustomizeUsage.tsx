import * as React from 'react';
import { Switch, View, Text, TextInput } from 'react-native';

import type { IconAlignment } from '@fluentui/react-native';
import { PersonaCoin } from '@fluentui/react-native';
import type { Theme } from '@fluentui-react-native/theme-types';
import { useTheme } from '@fluentui-react-native/theme-types';
import { themedStyleSheet } from '@fluentui-react-native/themed-stylesheet';

import { steveBallmerPhotoUrl } from './styles';
import { AlignmentPicker } from '../Common/AlignmentPicker';
import { Slider } from '../Common/Slider';
import { commonTestStyles as commonStyles } from '../Common/styles';

const getThemedStyles = themedStyleSheet((t: Theme) => {
  return { textbox: { ...commonStyles.textBox, borderColor: t.colors.inputBorder } };
});

export const CustomizeUsage: React.FunctionComponent = () => {
  const [showImage, setShowImage] = React.useState(true);
  const [coinColor, setCoinColor] = React.useState<string>();
  const [textColor, setTextColor] = React.useState<string>();
  const [physicalSize, setPhysicalSize] = React.useState<number>(80);
  const [iconSize, setIconSize] = React.useState<number>(24);
  const [iconStrokeWidth, setIconStrokeWidth] = React.useState<number>(2);
  const [iconStrokeColor, setIconStrokeColor] = React.useState<string>(undefined);
  const [initialsSize, setInitialsSize] = React.useState<number>(14);
  const [horizontalAlignment, setHorizontalAlignment] = React.useState<IconAlignment>();
  const [verticalAlignment, setVerticalAlignment] = React.useState<IconAlignment>();

  const [ringColor, setRingColor] = React.useState<string>('red');
  const [ringBackgroundColor, setRingBackgroundColor] = React.useState<string>(undefined);
  const [showRing, setShowRing] = React.useState<boolean>(true);
  const [transparent, setTransparent] = React.useState<boolean>(false);

  const theme = useTheme();
  const textBoxBorderStyle = getThemedStyles(theme);

  const CustomizedPersonaCoin = React.useMemo(() => {
    const tokens = {
      backgroundColor: coinColor,
      color: textColor,
      horizontalIconAlignment: horizontalAlignment,
      verticalIconAlignment: verticalAlignment,
      iconSize: iconSize,
      iconStrokeWidth: iconStrokeWidth,
      iconStrokeColor: iconStrokeColor,
      initialsSize: initialsSize,
      coinSize: physicalSize,
    };
    return PersonaCoin.customize({ tokens });
  }, [
    coinColor,
    textColor,
    horizontalAlignment,
    verticalAlignment,
    iconSize,
    iconStrokeWidth,
    iconStrokeColor,
    initialsSize,
    physicalSize,
  ]);

  return (
    <View style={commonStyles.root}>
      {/* settings */}
      <View style={commonStyles.settings}>
        <View style={commonStyles.switch}>
          <Text>Show image</Text>
          <Switch value={showImage} onValueChange={setShowImage} />
        </View>

        <View style={commonStyles.switch}>
          <Text>Show rings</Text>
          <Switch value={showRing} onValueChange={setShowRing} />
        </View>

        <View style={commonStyles.switch}>
          <Text>Transparent Ring</Text>
          <Switch value={transparent} onValueChange={setTransparent} />
        </View>

        <TextInput
          accessibilityLabel="Background color"
          style={textBoxBorderStyle.textbox}
          placeholder="Background color"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setCoinColor(e.nativeEvent.text);
          }}
        />

        <TextInput
          accessibilityLabel="Initials text color"
          style={textBoxBorderStyle.textbox}
          placeholder="Initials text color"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setTextColor(e.nativeEvent.text);
          }}
        />

        <TextInput
          accessibilityLabel="Icon stroke color"
          style={textBoxBorderStyle.textbox}
          placeholder="Icon stroke color"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setIconStrokeColor(e.nativeEvent.text);
          }}
        />

        <TextInput
          accessibilityLabel="Ring color"
          style={textBoxBorderStyle.textbox}
          placeholder="Ring color"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setRingColor(e.nativeEvent.text);
          }}
        />

        <TextInput
          accessibilityLabel="Ring background color"
          style={textBoxBorderStyle.textbox}
          placeholder="Ring background color"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setRingBackgroundColor(e.nativeEvent.text);
          }}
        />

        <AlignmentPicker style={commonStyles.header} label="Horizontal icon alignment" onSelectionChange={setHorizontalAlignment} />
        <AlignmentPicker style={commonStyles.header} label="Vertical icon alignment" onSelectionChange={setVerticalAlignment} />

        <Text>Coin size</Text>
        <Slider minimum={8} maximum={200} initialValue={80} style={commonStyles.vmargin} onChange={setPhysicalSize} />

        <Text>Icon size</Text>
        <Slider minimum={8} maximum={100} initialValue={24} style={commonStyles.vmargin} onChange={setIconSize} />

        <Text>Icon stroke width</Text>
        <Slider minimum={0} maximum={8} initialValue={2} style={commonStyles.vmargin} onChange={setIconStrokeWidth} />

        <Text>Font size</Text>
        <Slider minimum={5} maximum={50} initialValue={14} style={commonStyles.vmargin} onChange={setInitialsSize} />
      </View>

      {/* component under test */}
      <CustomizedPersonaCoin
        initials="SB"
        imageDescription="Former CEO of Microsoft"
        presence="blocked"
        imageUrl={showImage ? steveBallmerPhotoUrl : undefined}
        ring={
          showRing
            ? {
                ringColor,
                ringBackgroundColor,
                ringThickness: 4,
                innerGap: 4,
                transparent,
              }
            : undefined
        }
      />
    </View>
  );
};
