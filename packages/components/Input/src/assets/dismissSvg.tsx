import * as React from 'react';

import type { SvgProps } from 'react-native-svg';
import { Path, Svg } from 'react-native-svg';

export const DismissSvg: React.FunctionComponent = (props: SvgProps) => {
  return (
    <Svg fill="none" {...props} width={props.width} height={props.height} viewBox="0 0 20 20" color={props.color}>
      <Path
        d="M10 0c5.523 0 10 4.477 10 10s-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0Zm0 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm3.446 4.897.084.073a.75.75 0 0 1 .073.976l-.073.084L11.061 10l2.47 2.47a.75.75 0 0 1 .072.976l-.073.084a.75.75 0 0 1-.976.073l-.084-.073L10 11.061l-2.47 2.47a.75.75 0 0 1-.976.072l-.084-.073a.75.75 0 0 1-.073-.976l.073-.084L8.939 10l-2.47-2.47a.75.75 0 0 1-.072-.976l.073-.084a.75.75 0 0 1 .976-.073l.084.073L10 8.939l2.47-2.47a.75.75 0 0 1 .976-.072Z"
        fill="currentColor"
      />
    </Svg>
  );
}; // Default accessory icon
