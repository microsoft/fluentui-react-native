import * as React from 'react';
import { View } from 'react-native';
import { Separator } from '../../../components/Separator';
import { styles } from '../PersonaCoin/styles';
import { TextWin32 } from '@office-iss/react-native-win32';

export const PersonaTest: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <TextWin32 style={styles.section}>Standard Usage</TextWin32>
      <Separator />
      {/* <StandardUsage /> */}

      <TextWin32 style={styles.section}>Customize Usage</TextWin32>
      <Separator />
      {/* <CustomizeUsage /> */}
    </View>
  );
};
