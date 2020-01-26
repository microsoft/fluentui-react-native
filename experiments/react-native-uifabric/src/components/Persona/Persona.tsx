import * as React from 'react';
import { IPersonaProps } from './Persona.types';
import { ViewWin32 } from '@office-iss/react-native-win32';

export const Persona: React.FunctionComponent<IPersonaProps> = (props: IPersonaProps) => {
  return <ViewWin32 {...props} />;
};
