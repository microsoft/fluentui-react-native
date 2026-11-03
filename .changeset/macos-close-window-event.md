---
'@fluentui-react-native/desktop-driver': patch
---

Stop the macOS helper from publishing a `window-closed` event for a window that `closeWindow` closed. The native protocol reserves the event for windows the platform destroys, but the observer thread published it whenever the destroyed notification arrived before the command forgot the window, which happened on every close of a Calculator window. The helper now marks the window before it presses the close button, still records the destruction in the window event log, and removes the mark if the press fails. The fake host no longer publishes the event for `closeWindow` either.
