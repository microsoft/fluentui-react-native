# @fluentui-react-native/component-cache

This is a simple wrapper to ensure that `requireNativeComponent` doesn't get called multiple times and that multiple consuming controls can reference the same HostComponent. It is designed to be very rarely changed, this helps insulate against multiple versions of a component in the same bundle making rNC calls.
