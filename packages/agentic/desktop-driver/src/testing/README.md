# Test support

`in-process-session.ts` adapts the fake backend's W3C route dispatcher to the minimal
`DesktopBrowserLike` contract without binding a socket.

It is used by package integration tests to exercise selectors, portable commands, story
navigation, plan execution, lifecycle behavior, and artifacts against real repository stories.

This module is not a published consumer API and must not become a substitute for native macOS or
Windows verification.
