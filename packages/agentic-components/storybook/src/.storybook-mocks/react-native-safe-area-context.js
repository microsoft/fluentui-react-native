// Lightweight JS-only stub for `react-native-safe-area-context`.
//
// Storybook's on-device UI imports SafeAreaProvider / SafeAreaView / useSafeAreaInsets at module
// load time. The real package ships a Fabric native module that is iOS-only (UIKit) and uses a Yoga
// API that is incompatible with react-native-macos 0.81, so it fails to compile for macOS. Since
// safe-area insets are irrelevant for this on-device Storybook host, we alias the package to this
// stub via metro.config.js and disable its native autolinking in react-native.config.js.
const React = require('react');
const { View } = require('react-native');

const insets = { top: 0, right: 0, bottom: 0, left: 0 };
const frame = { x: 0, y: 0, width: 0, height: 0 };

const SafeAreaInsetsContext = React.createContext(insets);
const SafeAreaFrameContext = React.createContext(frame);

const SafeAreaProvider = ({ children }) => React.createElement(View, { style: { flex: 1 } }, children);

const SafeAreaView = React.forwardRef((props, ref) => React.createElement(View, { ref, ...props }));

const useSafeAreaInsets = () => insets;
const useSafeAreaFrame = () => frame;

const initialWindowMetrics = { insets, frame };

module.exports = {
  SafeAreaProvider,
  SafeAreaConsumer: SafeAreaInsetsContext.Consumer,
  SafeAreaInsetsContext,
  SafeAreaFrameContext,
  SafeAreaView,
  useSafeAreaInsets,
  useSafeAreaFrame,
  initialWindowMetrics,
};
