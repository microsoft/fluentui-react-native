import * as React from 'react';
import { View } from 'react-native';
import { Separator } from '../../../components/Separator';
import { TextWin32 } from '@office-iss/react-native-win32';
import { Persona } from '../../../components/Persona/Persona';
import { PersonaSize, PersonaPresence } from '../../../components/PersonaCoin';
import { styles, rajeshImageUrl } from './styles';

export const PersonaTest: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <TextWin32 style={styles.section}>Standard Usage</TextWin32>
      <Separator />
      <Persona
        style={styles.root}
        text="Rajesh Jha"
        secondaryText="Executive Vice President"
        tertiaryText="Experiences and Devices"
        optionalText="Building 36/5600"
        size={PersonaSize.size100}
        initials="RJ"
        imageUrl={rajeshImageUrl}
        imageDescription="Profile photo of Rajesh Jha"
        presence={PersonaPresence.busy}
      />

      <TextWin32 style={styles.section}>Customize Usage</TextWin32>
      <Separator />
      {/* <CustomizeUsage /> */}
    </View>
  );
};
