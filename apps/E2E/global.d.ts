import type {BrowserCommands} from 'webdriverio'

declare global {
  const browser: BrowserCommands;
  const driver: BrowserCommands.Driver;
  const $: BrowserCommands.$;
}