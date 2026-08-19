/**
 * The `browser.desktop` augmentation.
 *
 * Deliberately narrow: element lookup, interaction, state, waits, screenshots, and source stay on
 * standard WebdriverIO. What lives here is what WebdriverIO cannot express against a native
 * desktop driver (focus and scroll), plus lifecycle, capability reporting, Storybook selection,
 * and failure artifacts.
 */

import { PORTABLE_COMMANDS, portableCommandsFor, platformExtensionsFor } from '../capabilities.ts';
import { DesktopDriverError } from '../errors.ts';
import { PACKAGE_VERSION } from '../package-version.ts';
import { DESKTOP_PROTOCOL_VERSION, PORTABLE_COMMAND_MATRIX_VERSION } from '../protocol.ts';
import { byTestId } from '../selectors.ts';
import type { ArtifactStore } from '../artifacts.ts';
import type { DesktopLifecycle } from '../lifecycle.ts';
import type { StoryController } from '../storybook/controller.ts';
import type { ArtifactManifest, DesktopAppState, DesktopSessionInfo, ResolvedDesktopDriverOptions } from '../types.ts';

/** The minimal WebdriverIO surface these commands need, so the package does not hard-depend on it. */
export interface DesktopBrowserLike {
  sessionId: string;
  $(selector: string): Promise<DesktopElementLike>;
  execute(script: string, ...args: unknown[]): Promise<unknown>;
  getPageSource(): Promise<string>;
  takeScreenshot(): Promise<string>;
  getActiveElement?(): Promise<Record<string, string>>;
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
  waitForDisplayed(options?: { timeout?: number; reverse?: boolean }): Promise<boolean>;
  waitForExist(options?: { timeout?: number; reverse?: boolean }): Promise<boolean>;
}

/** The commands added to `browser.desktop`. */
export interface DesktopBrowserCommands {
  getSessionInfo(): Promise<DesktopSessionInfo>;
  waitForAppState(state: DesktopAppState, options?: { timeout?: number }): Promise<void>;
  captureArtifacts(reason: string): Promise<ArtifactManifest>;
  selectStory(storyId: string): Promise<void>;
  waitForStory(storyId: string): Promise<void>;
  /** Focus inspection; WebdriverIO's `isFocused()` evaluates a DOM script and cannot be used. */
  isFocused(selector: string): Promise<boolean>;
  /** Scrolls an element into view through the backend's native scroll command. */
  scrollIntoView(selector: string): Promise<void>;
}

export interface DesktopCommandContext {
  options: ResolvedDesktopDriverOptions;
  lifecycle: DesktopLifecycle;
  artifacts: ArtifactStore;
  storyController: StoryController;
  driverHostUrl: string;
  storybookUrl?: string;
}

const SCROLL_SCRIPTS: Readonly<Record<string, string>> = {
  mac2: 'macos: scroll',
  windows: 'windows: scroll',
  novawindows: 'windows: scroll',
  fake: 'desktop: scroll',
};

/** Builds the command implementations for a session. */
export function createDesktopCommands(browser: DesktopBrowserLike, context: DesktopCommandContext): DesktopBrowserCommands {
  const { options, lifecycle, artifacts, storyController } = context;

  return {
    async getSessionInfo(): Promise<DesktopSessionInfo> {
      return {
        protocolVersion: DESKTOP_PROTOCOL_VERSION,
        portableCommandMatrixVersion: PORTABLE_COMMAND_MATRIX_VERSION,
        packageVersion: PACKAGE_VERSION,
        platform: options.platform,
        backend: options.backend,
        sessionId: browser.sessionId,
        target: options.target,
        ownership: options.target.mode === 'launch' ? 'self' : 'external',
        state: lifecycle.current,
        driverHostUrl: context.driverHostUrl,
        storybookUrl: context.storybookUrl,
        portableCommands: portableCommandsFor(options.backend),
        platformExtensions: platformExtensionsFor(options.backend),
      };
    },

    async waitForAppState(state: DesktopAppState, waitOptions?: { timeout?: number }): Promise<void> {
      const timeout = waitOptions?.timeout ?? options.readiness.timeout;
      const deadline = Date.now() + timeout;
      while (Date.now() < deadline) {
        if (lifecycle.current === state) {
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      throw new DesktopDriverError(`Application did not reach state "${state}" within ${timeout}ms`, {
        kind: 'lifecycle',
        detail: { expected: state, actual: lifecycle.current, exitReason: lifecycle.reason },
      });
    },

    async captureArtifacts(reason: string): Promise<ArtifactManifest> {
      const directory = artifacts.testDirectory(reason);
      const relative = (name: string) => `${directory.slice(artifacts.runDirectory.length + 1)}/${name}`;

      const failures: string[] = [];
      try {
        artifacts.write(relative('source.xml'), await browser.getPageSource());
      } catch (error) {
        failures.push(`source: ${(error as Error).message}`);
      }
      try {
        artifacts.write(relative('screenshot.png'), Buffer.from(await browser.takeScreenshot(), 'base64'));
      } catch (error) {
        failures.push(`screenshot: ${(error as Error).message}`);
      }
      artifacts.write(
        relative('result.json'),
        `${JSON.stringify({ reason, state: lifecycle.current, exitReason: lifecycle.reason, captureFailures: failures }, null, 2)}\n`,
      );
      return artifacts.manifest();
    },

    async selectStory(storyId: string): Promise<void> {
      await storyController.select(storyId);
    },

    async waitForStory(storyId: string): Promise<void> {
      await storyController.waitForStory(storyId);
    },

    async isFocused(selector: string): Promise<boolean> {
      const element = await browser.$(selector);
      if (!browser.getActiveElement) {
        throw new DesktopDriverError('The connected driver does not report an active element', { kind: 'capability' });
      }
      const active = await browser.getActiveElement().catch(() => undefined);
      if (!active) {
        return false;
      }
      const activeId = Object.values(active)[0];
      return activeId === element.elementId;
    },

    async scrollIntoView(selector: string): Promise<void> {
      const element = await browser.$(selector);
      const script = SCROLL_SCRIPTS[options.backend];
      if (!script) {
        throw new DesktopDriverError(`Backend "${options.backend}" does not implement a portable scroll command`, { kind: 'capability' });
      }
      await browser.execute(script, { elementId: element.elementId });
    },
  };
}

/** Attaches the augmentation to a session without replacing any standard WebdriverIO command. */
export function attachDesktopCommands(browser: DesktopBrowserLike, context: DesktopCommandContext): DesktopBrowserCommands {
  const commands = createDesktopCommands(browser, context);
  browser.desktop = commands;
  return commands;
}

/** Re-exported so consumers can assert against the same list the runtime reports. */
export { PORTABLE_COMMANDS, byTestId };
