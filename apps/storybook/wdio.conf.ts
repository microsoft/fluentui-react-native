/**
 * WebdriverIO configuration for the on-device Storybook desktop tests.
 *
 * One config serves Windows and macOS. Platform selection lives here and in the environment, not
 * in the specs: `desktop-tests/**` and the linked story specs in `packages/agentic/components`
 * run unchanged on both platforms.
 *
 * Usage:
 *   yarn desktop-test:macos      attach to a running macOS Storybook app
 *   yarn desktop-test:windows    attach to a running Windows Storybook app
 *   yarn desktop-test:fake       run the same specs against the in-process contract backend
 *
 * Set `DESKTOP_TEST_APP` to launch instead of attach. Attach mode leaves the application running.
 */
import { loadDesktopConfig, toDesktopWdioOptions } from '@fluentui-react-native/desktop-driver/config/node';
import { createDesktopWdioConfig } from '@fluentui-react-native/desktop-driver/wdio';

const project = loadDesktopConfig(new URL('./desktop.config.ts', import.meta.url));

export const config = createDesktopWdioConfig(toDesktopWdioOptions(project));
