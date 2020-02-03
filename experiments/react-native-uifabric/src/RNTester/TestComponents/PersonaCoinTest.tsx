import * as React from 'react';
import { PersonaCoin, PersonaSize, PersonaCoinColor } from '../../components/PersonaCoin';
import { Switch, View, Text } from 'react-native';
import { Picker } from '../Picker/Picker.win32';
import { PickerItem } from '../Picker/PickerItem';
import { StyleSheet } from 'react-native';

const allSizes = Object.keys(PersonaSize).filter(item => {
  return isNaN(Number(item));
});

const allColors = Object.keys(PersonaCoinColor).filter(item => {
  return isNaN(Number(item));
});

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row'
  },
  settings: {
    flexGrow: 1
  },
  showImage: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  header: {
    marginTop: 12,
    fontSize: 12
  },
  personaContainer: {
    minWidth: 150
  }
});

export const PersonaCoinTest: React.FunctionComponent<{}> = () => {
  const [showImage, setShowImage] = React.useState(true);
  const [imageSize, setImageSize] = React.useState(PersonaSize.size40);
  const [coinColor, setCoinColor] = React.useState(PersonaCoinColor.gold);

  return (
    <View style={styles.root}>
      {/* settings */}
      <View style={styles.settings}>
        <View style={styles.showImage}>
          <Switch value={showImage} onValueChange={setShowImage} />
          <Text>Show image</Text>
        </View>

        <Text style={styles.header}>Size</Text>
        <Picker selectedValue={PersonaSize[imageSize]} onValueChange={size => setImageSize(PersonaSize[size as string])}>
          {allSizes.map((size, index) => (
            <PickerItem label={size} key={index} value={size} />
          ))}
        </Picker>

        <Text style={styles.header}>Coin Color</Text>
        <Picker
          enabled={!showImage}
          selectedValue={PersonaCoinColor[coinColor]}
          onValueChange={color => setCoinColor(PersonaCoinColor[color as string])}
        >
          {allColors.map((color, index) => (
            <PickerItem label={color} key={index} value={color} />
          ))}
        </Picker>
      </View>

      {/* component under test */}
      <View style={styles.personaContainer}>
        <PersonaCoin
          size={imageSize}
          initials="SN"
          imageDescription="Photo of Satya Nadella"
          imageUrl={
            showImage
              ? 'https://www.microsoft.com/en-us/CMSImages/satya.jpg?version=0881eb71-4942-b627-d602-84c832b8a0b6&amp;CollectionId=1b46ce2d-c90d-421e-94f1-cfb6bc6ef6ec'
              : undefined
          }
          coinColor={coinColor}
        />
      </View>
    </View>
  );
};
