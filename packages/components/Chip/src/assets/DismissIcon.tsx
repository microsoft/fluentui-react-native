import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';

const DismissSvg = (props: SvgProps) => (
  <Svg width={16} height={16} fill="none" {...props}>
    <Path
      fill="currentColor"
      d="m4.089 4.216.057-.07a.5.5 0 0 1 .638-.057l.07.057L8 7.293l3.146-3.147a.5.5 0 0 1 .708.708L8.707 8l3.147 3.146a.5.5 0 0 1 .057.638l-.057.07a.5.5 0 0 1-.638.057l-.07-.057L8 8.707l-3.146 3.147a.5.5 0 0 1-.708-.708L7.293 8 4.146 4.854a.5.5 0 0 1-.057-.638l.057-.07-.057.07Z"
    />
  </Svg>
);
export default DismissSvg;
