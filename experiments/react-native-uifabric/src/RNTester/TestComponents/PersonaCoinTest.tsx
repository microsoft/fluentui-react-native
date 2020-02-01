import * as React from 'react';
import { PersonaCoin, PersonaSize, PersonaCoinColor } from '../../components/PersonaCoin';
import { Switch, View, Text } from 'react-native';
import { Stack } from '../../components/Stack';

export const PersonaCoinTest: React.FunctionComponent<{}> = () => {

    const [showImage, setShowImage] = React.useState(true);

    return (
        <Stack gap={2}>
            <View style={{flexDirection: 'row', marginBottom: 8, alignItems: 'center'}}>
                <Switch 
                    value={showImage}
                    onValueChange={setShowImage}
                    />
                <Text>Show image</Text>
            </View>

            <PersonaCoin
              size={PersonaSize.size100}
              initials='SN'
              imageDescription="Photo of Satya Nadella"
              imageUrl={showImage ? 'https://www.microsoft.com/en-us/CMSImages/satya.jpg?version=0881eb71-4942-b627-d602-84c832b8a0b6&amp;CollectionId=1b46ce2d-c90d-421e-94f1-cfb6bc6ef6ec' : undefined}
              coinColor={PersonaCoinColor.gold} />
        </Stack>
    );
  };
  