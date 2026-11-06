import type { DesktopWebdriverSession } from '@fluentui-react-native/desktop-driver/wdio';
import type { DesktopEndpoint, DesktopStoryInputModes } from '@fluentui-react-native/desktop-driver';
import type { expect } from 'expect-webdriverio';

export type WdioStoryContext = {
  browser: DesktopWebdriverSession['browser'];
  desktop: DesktopWebdriverSession;
  expect: typeof expect;
  platform: DesktopEndpoint;
  signal: AbortSignal;
  skip(reason: string): void;
};

export type WdioStoryTest = (context: WdioStoryContext) => void | Promise<void>;
export type ClassifiedWdioStoryTest = {
  inputModes: DesktopStoryInputModes;
  run: WdioStoryTest;
};
export type WdioStoryTests = Readonly<Record<string, WdioStoryTest | ClassifiedWdioStoryTest>>;

/** Wrap StoryObj, importing this type only; callbacks execute in Node, not React Native. */
export type WdioStory<TStory = object> = Omit<TStory, 'wdio'> & {
  wdio?: WdioStoryTest | WdioStoryTests;
};
