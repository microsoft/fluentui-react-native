import { Theme } from '@fluentui-react-native/framework';

export const shadowStyleFromTheme = (t: Theme, shadowToken: string) => {
  // Grab the second shadow from the global token, as we only support displaying one shadow
  const shadow = t.shadows[shadowToken].key;
  return {
    // iOS Shadow props
    shadowColor: shadow.color.toString().substr(0, 7), // split out the color
    shadowOpacity: Number('0x' + shadow.color.toString().substr(7, 2)) / 255.0, // split out the opacity
    shadowRadius: shadow.blur,
    shadowOffset: {
      width: shadow.x,
      height: shadow.y,
    },
    // Android shadow props
    elevation: shadow.blur,
  };
};
