import * as React from 'react';
import { PersonaCoin, PersonaSize, PersonaCoinColor } from '../../components/PersonaCoin';

export const PersonaCoinTest: React.FunctionComponent<{}> = () => {
    
    return (
      <PersonaCoin
        size={PersonaSize.size100}
        initials='SN'
        imageUrl='https://www.microsoft.com/en-us/CMSImages/satya.jpg?version=0881eb71-4942-b627-d602-84c832b8a0b6&amp;CollectionId=1b46ce2d-c90d-421e-94f1-cfb6bc6ef6ec'
        coinColor={PersonaCoinColor.burgundy} />
    );
  };
  