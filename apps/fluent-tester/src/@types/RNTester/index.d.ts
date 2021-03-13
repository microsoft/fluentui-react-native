declare module '*.svg' {
  import { SvgProps } from '@microsoft/react-native-svg-desktop';
  const content: React.FC<SvgProps>;
  export default content;
}
