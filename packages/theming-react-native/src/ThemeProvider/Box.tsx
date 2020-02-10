import * as React from 'react';
import { ITheme } from '../Theme.types';
import { useTheme } from '../ThemeContext';

const getBoxStyle = (t: ITheme) => ({ backgroundColor: t.colors.background });

export const useBoxStyle = () => {
  const t = useTheme();
  return getBoxStyle(t);
};

type IBoxProps = React.PropsWithChildren<{}>;
export const Box: React.FunctionComponent<IBoxProps> = (p: IBoxProps) => {
  const style = useBoxStyle();
  return <div style={style} {...p} />;
};
