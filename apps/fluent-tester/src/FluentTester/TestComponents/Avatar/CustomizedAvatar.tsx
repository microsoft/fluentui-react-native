import * as React from 'react';
import { JSAvatar, IconAlignment, AvatarSize } from '@fluentui-react-native/experimental-avatar';
import { Switch, View, Text, TextInput } from 'react-native';
import { steveBallmerPhotoUrl } from './../PersonaCoin/styles';
import { AlignmentPicker } from '../Common/AlignmentPicker';
import { commonTestStyles as commonStyles } from '../Common/styles';

export const CustomizeUsage: React.FunctionComponent = () => {
  const [showImage, setShowImage] = React.useState(true);
  const [coinColor, setCoinColor] = React.useState<string>();
  const [textColor, setTextColor] = React.useState<string>();
  const [size, setSize] = React.useState<AvatarSize>(96);
  const [iconSize, setIconSize] = React.useState<number>(24);
  const [initialsSize, setInitialsSize] = React.useState<number>(14);
  const [horizontalAlignment, setHorizontalAlignment] = React.useState<IconAlignment>();
  const [verticalAlignment, setVerticalAlignment] = React.useState<IconAlignment>();

  const [ringColor, setRingColor] = React.useState<string>('red');
  const [ringBackgroundColor, setRingBackgroundColor] = React.useState<string>(undefined);
  const [showRing, setShowRing] = React.useState<boolean>(true);
  const [transparent, setTransparent] = React.useState<boolean>(false);

  const CustomizedAvatar = React.useMemo(() => {
    const tokens = {
      backgroundColor: coinColor,
      color: textColor,
      horizontalIconAlignment: horizontalAlignment,
      verticalIconAlignment: verticalAlignment,
      iconSize: iconSize,
      initialsSize: initialsSize,
      size,
      ringColor,
      ringBackgroundColor,
    };
    return JSAvatar.customize(tokens);
  }, [coinColor, textColor, horizontalAlignment, verticalAlignment, iconSize, initialsSize, size, ringColor, ringBackgroundColor]);

  return (
    <View style={commonStyles.root}>
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
          style={[commonStyles.textBox]}
          placeholder="Background color"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setCoinColor(e.nativeEvent.text);
          }}
        />
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
          placeholder="Ring color"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setRingColor(e.nativeEvent.text);
          }}
        />

        <TextInput
          style={[commonStyles.textBox]}
          placeholder="Avatar size"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            const size = e.nativeEvent.text as unknown as AvatarSize;
            setSize(size);
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
          placeholder="Initials size"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setInitialsSize(parseInt(e.nativeEvent.text));
          }}
        />

        <TextInput
          style={[commonStyles.textBox]}
          placeholder="Ring background color"
          blurOnSubmit={true}
          onSubmitEditing={(e) => {
            setRingBackgroundColor(e.nativeEvent.text);
          }}
        />

        <Text>These features will be available later</Text>
        <AlignmentPicker style={commonStyles.header} label="Horizontal icon alignment" onSelectionChange={setHorizontalAlignment} />
        <AlignmentPicker style={commonStyles.header} label="Vertical icon alignment" onSelectionChange={setVerticalAlignment} />
      </View>

      <CustomizedAvatar
        active="active"
        activeAppearance="ring"
        initials="SB"
        accessibilityLabel="Former CEO of Microsoft"
        badge={{ status: 'blocked' }}
        src={showImage ? steveBallmerPhotoUrl : undefined}
        ring={
          showRing
            ? {
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
