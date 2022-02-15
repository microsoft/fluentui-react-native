import { globalTokens } from '@fluentui-react-native/theme-tokens';

export const shadowStyleFromGlobalToken = (shadowToken: number) => {
  // Grab the second shadow from the global token, as we only support displaying one shadow
  const shadow = globalTokens.shadow[shadowToken][1];
  return {
    // iOS Shadow props
    shadowColor: shadow.color.substr(0, 7), // split out the color
    shadowOpacity: Number('0x' + shadow.color.substr(7, 2)) / 255.0, // split out the opacity
    shadowRadius: shadow.blur,
    shadowOffset: {
      width: shadow.x,
      height: shadow.y,
    },
    // Android shadow props
    elevation: shadowToken,
  };
};
