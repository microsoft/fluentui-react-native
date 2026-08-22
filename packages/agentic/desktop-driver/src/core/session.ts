import type { ArtifactManifest, DesktopAppState, DesktopSessionInfo } from '../types.ts';

/** Minimal driver-neutral browser surface used by portable commands and test doubles. */
export interface DesktopBrowserLike {
  sessionId: string;
  $(selector: string): Promise<DesktopElementLike>;
  execute(script: string, ...args: unknown[]): Promise<unknown>;
  getPageSource(): Promise<string>;
  takeScreenshot(): Promise<string>;
  getActiveElement?(): Promise<Record<string, string>>;
  getWindowHandles?(): Promise<readonly string[]>;
  addCommand(name: string, handler: (...args: never[]) => unknown, isElementCommand?: boolean): void;
  desktop?: DesktopBrowserCommands;
}

export interface DesktopElementLike {
  elementId: string;
  isExisting(): Promise<boolean>;
  isDisplayed(): Promise<boolean>;
  isEnabled(): Promise<boolean>;
  isSelected(): Promise<boolean>;
  getText(): Promise<string>;
  getAttribute(name: string): Promise<string | null>;
  click(): Promise<void>;
  clearValue(): Promise<void>;
  setValue(value: string): Promise<void>;
  waitForDisplayed(options?: { timeout?: number; interval?: number; reverse?: boolean }): Promise<boolean>;
  waitForExist(options?: { timeout?: number; interval?: number; reverse?: boolean }): Promise<boolean>;
}

export interface DesktopBrowserCommands {
  getSessionInfo(): Promise<DesktopSessionInfo>;
  waitForAppState(state: DesktopAppState, options?: { timeout?: number }): Promise<void>;
  captureArtifacts(reason: string): Promise<ArtifactManifest>;
  selectStory(storyId: string): Promise<void>;
  waitForStory(storyId: string): Promise<void>;
  isFocused(selector: string): Promise<boolean>;
  scrollIntoView(selector: string): Promise<void>;
}
