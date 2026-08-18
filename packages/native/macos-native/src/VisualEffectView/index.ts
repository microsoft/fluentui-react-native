// NSVisualEffectView is already implemented natively as `@fluentui-react-native/vibrancy-view`
// (see packages/experimental/VibrancyView). Rather than duplicate that native Swift/podspec code,
// this module re-exports it under the name used by the rest of this package's control inventory.
export { VibrancyView as VisualEffectView } from '@fluentui-react-native/vibrancy-view';
export type {
  Material as VisualEffectMaterial,
  BlendingMode as VisualEffectBlendingMode,
  State as VisualEffectState,
} from '@fluentui-react-native/vibrancy-view';
export type { VibrancyViewProps as VisualEffectViewProps } from '@fluentui-react-native/vibrancy-view';
