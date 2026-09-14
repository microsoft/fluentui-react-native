import type { DesktopWebdriverSession } from '@fluentui-react-native/desktop-driver/wdio';
import type { expect } from 'expect-webdriverio';

export type WdioStoryContext = {
  browser: DesktopWebdriverSession['browser'];
  desktop: DesktopWebdriverSession;
  expect: typeof expect;
  signal: AbortSignal;
  skip(reason: string): void;
};

/** Wrap StoryObj, importing this type only; callbacks execute in Node, not React Native. */
export type WdioStory<TStory = object> = Omit<TStory, 'wdio'> & {
  wdio?: (context: WdioStoryContext) => void | Promise<void>;
};
