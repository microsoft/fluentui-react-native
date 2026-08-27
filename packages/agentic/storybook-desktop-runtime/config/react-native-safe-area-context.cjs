const React = require('react');
const { View } = require('react-native');

const insets = { top: 0, right: 0, bottom: 0, left: 0 };
const frame = { x: 0, y: 0, width: 0, height: 0 };

const SafeAreaInsetsContext = React.createContext(insets);
const SafeAreaFrameContext = React.createContext(frame);

const SafeAreaProvider = ({ children }) => React.createElement(View, { style: { flex: 1 } }, children);
const SafeAreaView = React.forwardRef((props, ref) => React.createElement(View, { ref, ...props }));

module.exports = {
  SafeAreaProvider,
  SafeAreaConsumer: SafeAreaInsetsContext.Consumer,
  SafeAreaInsetsContext,
  SafeAreaFrameContext,
  SafeAreaView,
  useSafeAreaInsets: () => insets,
  useSafeAreaFrame: () => frame,
  initialWindowMetrics: { insets, frame },
};
