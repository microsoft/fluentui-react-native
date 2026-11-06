import type { DesktopWebdriverSession } from '@fluentui-react-native/desktop-driver/wdio';
import type { DesktopEndpoint } from '@fluentui-react-native/desktop-driver';
import type { expect } from 'expect-webdriverio';
import type { DesktopCaseOptions } from '@fluentui-react-native/desktop-driver/authoring';

export type WdioStoryContext = {
  browser: DesktopWebdriverSession['browser'];
  desktop: DesktopWebdriverSession;
  expect: typeof expect;
  platform: DesktopEndpoint;
  signal: AbortSignal;
  skip(reason: string): void;
};

export type WdioStoryTest = (context: WdioStoryContext) => void | Promise<void>;
export type WdioStoryTests = Readonly<Record<string, WdioStoryTest>>;
export type WdioDescriptor = DesktopCaseOptions & { run: WdioStoryTest };
export type WdioStoryCase = WdioDescriptor & { name: string };

/** Wrap StoryObj, importing this type only; callbacks execute in Node, not React Native. */
export type WdioStory<TStory = object> = Omit<TStory, 'wdio'> & {
  wdio?: readonly WdioStoryCase[] | WdioStoryTest | WdioStoryTests;
};
