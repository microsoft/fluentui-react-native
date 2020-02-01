import * as React from 'react';
import { PersonaCoin, PersonaSize, PersonaCoinColor } from '../../components/PersonaCoin';
import { Switch, View, Text } from 'react-native';
import { Stack } from '../../components/Stack';
import { SimpleSelector } from '../SimpleSelector';

const allSizes = Object.keys(PersonaSize).filter((item) => {
    return isNaN(Number(item));
});

const allColors = Object.keys(PersonaCoinColor).filter((item) => {
    return isNaN(Number(item));
});

export const PersonaCoinTest: React.FunctionComponent<{}> = () => {

    const [showImage, setShowImage] = React.useState(true);
    const [imageSize, setImageSize] = React.useState(PersonaSize.size40);
    const [coinColor, setCoinColor] = React.useState(PersonaCoinColor.gold);

    return (
        <Stack gap={2}>
            <View style={{flexDirection: 'row', marginBottom: 8, alignItems: 'center'}}>
                <Switch 
                    value={showImage}
                    onValueChange={setShowImage}
                    />
                <Text>Show image</Text>
            </View>

            <SimpleSelector
                title='Persona size'
                choices={allSizes}
                initialSelectedIndex={PersonaSize.size40}
                onSelectionChanged={(index)=>setImageSize(PersonaSize[allSizes[index]])} />

            <SimpleSelector
                title='Persona color'
                choices={allColors}
                initialSelectedIndex={PersonaCoinColor.gold}
                onSelectionChanged={(index)=>setCoinColor(PersonaCoinColor[allColors[index]])} />

            <PersonaCoin
              size={imageSize}
              initials='SN'
              imageDescription="Photo of Satya Nadella"
              imageUrl={showImage ? 'https://www.microsoft.com/en-us/CMSImages/satya.jpg?version=0881eb71-4942-b627-d602-84c832b8a0b6&amp;CollectionId=1b46ce2d-c90d-421e-94f1-cfb6bc6ef6ec' : undefined}
              coinColor={coinColor} />
        </Stack>
    );
  };
  