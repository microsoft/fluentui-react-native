import * as React from 'react';
import { IPersonaCoinProps } from './PersonaCoin.types';
import { ViewWin32 } from '@office-iss/react-native-win32';

export const PersonaCoin: React.FunctionComponent<IPersonaCoinProps> = (props: IPersonaCoinProps) => {
  return <ViewWin32 {...props} />;
};
