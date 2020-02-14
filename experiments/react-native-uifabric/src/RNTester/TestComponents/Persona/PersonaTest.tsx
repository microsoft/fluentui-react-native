import * as React from 'react';
import { View } from 'react-native';
import { Separator } from '../../../components/Separator';
import { styles, satyaPhotoUrl } from '../PersonaCoin/styles';
import { TextWin32 } from '@office-iss/react-native-win32';
import { Persona } from '../../../components/Persona/Persona';
import { PersonaSize, PersonaPresence } from '../../../components/PersonaCoin';

export const PersonaTest: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <TextWin32 style={styles.section}>Standard Usage</TextWin32>
      <Separator />
      <Persona
        style={styles.root}
        text="Satya Nadella"
        secondaryText="CEO"
        tertiaryText="Building 34/5600"
        size={PersonaSize.size72}
        imageUrl={satyaPhotoUrl}
        presence={PersonaPresence.busy}
      />

      <TextWin32 style={styles.section}>Customize Usage</TextWin32>
      <Separator />
      {/* <CustomizeUsage /> */}
    </View>
  );
};
