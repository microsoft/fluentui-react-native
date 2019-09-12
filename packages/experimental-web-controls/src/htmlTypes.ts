import * as React from 'react';
import { IStyleProp } from '@uifabric/foundation-settings';

export type ICSSStyle = React.CSSProperties;
export type IDivProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { style?: IStyleProp<ICSSStyle> };
export type IImageProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
  style?: IStyleProp<ICSSStyle>;
};
