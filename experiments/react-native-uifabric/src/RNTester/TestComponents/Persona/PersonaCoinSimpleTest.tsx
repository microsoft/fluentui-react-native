import * as React from 'react';
import { View } from 'react-native';
import { PersonaCoin, PersonaSize, PersonaCoinColor, PersonaPresence } from '../../../components/PersonaCoin';
import { satyaPhotoUrl, styles } from './styles';

export const PersonaCoinSimpleTest: React.FunctionComponent<{}> = () => {
  return (
    <View>
      <PersonaCoin
        style={styles.oneCoin}
        size={PersonaSize.size40}
        initials="LN"
        imageUrl={satyaPhotoUrl}
        coinColor={PersonaCoinColor.darkBlue}
      />

      <PersonaCoin style={styles.oneCoin} size={PersonaSize.size56} initials="ALN" coinColor={PersonaCoinColor.magenta} />

      <PersonaCoin
        style={styles.oneCoin}
        imageUrl={satyaPhotoUrl}
        size={PersonaSize.size100}
        initials="SN"
        coinColor={PersonaCoinColor.purple}
        presence={PersonaPresence.busy}
      />
    </View>
  );
};
