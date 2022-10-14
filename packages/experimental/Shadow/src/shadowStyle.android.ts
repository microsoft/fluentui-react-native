import { memoize } from '@fluentui-react-native/framework';
import { ShadowToken } from '@fluentui-react-native/theme-types';

/**
 * For Android, we do not set two independent shadows on two views.
 * Instead, the `elevation` prop takes care of synthesizing a key and ambient
 * shadow together with it's own depth ramp. The `blur` token of our key shadow roughly
 * matches the elevation value. See the following:
 * https://material.io/design/environment/light-shadows.html#light
 * https://github.com/microsoft/apple-ux-guide/blob/gh-pages/Shadows.md
 *
 * We still however, want to have two views in our heirarchy so that the "ambient" shadow
 * constrains the Android Ripple's borders due to the following bug:
 * https://stackoverflow.com/questions/63048178/ripple-effect-leaking-at-corners-as-if-pressable-button-has-a-borderradius
 */
export const getShadowTokenStyleSet = memoize(getShadowTokenStyleSetWorker);

function getShadowTokenStyleSetWorker(shadowToken: ShadowToken) {
  return {
    key: {
      elevation: shadowToken?.key?.blur,
    },
    ambient: {},
  };
}
