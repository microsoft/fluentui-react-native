import * as React from 'react';
import { useTheme } from '../ThemeContext';
import { ITheme } from '../Theme.types';

const getBoxStyle = (theme: ITheme) => ({
  backgroundColor: theme.colors.background
});

export const withBox = (WrappedComponent?: React.ComponentType): React.FunctionComponent<any> => (props: any) => {
  const theme = useTheme();
  const boxStyle = React.useMemo(() => getBoxStyle(theme), [theme]);
  return WrappedComponent ? <WrappedComponent {...props} style={boxStyle} /> : <div {...props} style={boxStyle} />;
};
