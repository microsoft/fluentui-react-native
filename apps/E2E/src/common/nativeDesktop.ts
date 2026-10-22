import { Keys } from './consts.js';

export function isNativeDesktop(): boolean {
  return browser.capabilities.browserName === 'furn-native-desktop';
}

export async function sendNativeDesktopKeys(element: ChainablePromiseElement, keys: readonly Keys[]): Promise<void> {
  const target = await element;
  await browser.elementSendKeys(await target.elementId, '');
  const actions: { type: 'keyDown' | 'keyUp'; value: string }[] = [];
  const held = new Set<string>();
  for (const value of keys) {
    if (value === Keys.NULL) {
      for (const modifier of held) actions.push({ type: 'keyUp', value: modifier });
      held.clear();
    } else if ([Keys.SHIFT, Keys.CONTROL, Keys.ALT].some((modifier) => modifier === value)) {
      if (!held.has(value)) actions.push({ type: 'keyDown', value });
      held.add(value);
    } else actions.push({ type: 'keyDown', value }, { type: 'keyUp', value });
  }
  for (const value of held) actions.push({ type: 'keyUp', value });
  let failure: unknown;
  try {
    await browser.performActions([{ type: 'key', id: 'tester-keyboard', actions }]);
  } catch (error) {
    failure = error;
  }
  try {
    await browser.releaseActions();
  } catch (error) {
    throw new AggregateError(failure === undefined ? [error] : [failure, error], 'Desktop keyboard input or release failed.');
  }
  if (failure !== undefined) throw failure;
}

export async function scrollNativeDesktopElement(element: ChainablePromiseElement, scroller: ChainablePromiseElement): Promise<void> {
  if (await element.isDisplayed()) return;
  if (!browser.capabilities['furn:features']?.wheel)
    throw new Error('This desktop does not support native wheel input; navigation cannot be qualified.');
  const origin = { 'element-6066-11e4-a52e-4f735466cecf': await scroller.elementId };
  await browser.waitUntil(
    async () => {
      await browser.performActions([
        { type: 'wheel', id: 'tester-scroll', actions: [{ type: 'scroll', origin, x: 0, y: 0, deltaX: 0, deltaY: 300, duration: 100 }] },
      ]);
      return element.isDisplayed();
    },
    { timeout: 30_000, timeoutMsg: 'The native scroll container did not expose the selected tester control.' },
  );
}

export function installLegacyDesktopAttributes(): void {
  const properties: Readonly<Record<string, string>> = {
    AutomationId: 'automationId',
    Name: 'name',
    ControlType: 'role',
    IsEnabled: 'enabled',
    HasKeyboardFocus: 'focused',
    IsRequiredForForm: 'required',
    'Toggle.ToggleState': 'checked',
    'ExpandCollapse.ExpandCollapseState': 'expanded',
  };
  const roles: Readonly<Record<string, string>> = {
    button: 'Button',
    group: 'Group',
    checkbox: 'CheckBox',
    image: 'Image',
    link: 'HyperLink',
    menu: 'Menu',
    menuitem: 'MenuItem',
    radio: 'RadioButton',
    list: 'List',
    tablist: 'Tab',
    tab: 'TabItem',
    text: 'Text',
  };
  browser.overwriteCommand(
    'getAttribute',
    async function (original, name) {
      const property = properties[name];
      if (!property) {
        if (['HelpText', 'IsTogglePatternAvailable'].includes(name)) {
          throw new Error(
            `Legacy attribute "${name}" has no qualified native mapping. It must not be reported as false or silently skipped.`,
          );
        }
        return original(name);
      }
      const value: unknown = await this.getElementProperty(this.elementId, property);
      if (name === 'ControlType') {
        if (typeof value !== 'string' || !roles[value])
          throw new Error(`Native role "${String(value)}" has no legacy ControlType mapping.`);
        return `ControlType.${roles[value]}`;
      }
      if (name === 'Toggle.ToggleState') {
        if (value === 'mixed') return '2';
        if (typeof value !== 'boolean') throw new Error('Native checked state is unavailable.');
        return value ? '1' : '0';
      }
      if (name === 'ExpandCollapse.ExpandCollapseState') {
        if (typeof value !== 'boolean') throw new Error('Native expanded state is unavailable.');
        return value ? 'Expanded' : 'Collapsed';
      }
      if (name === 'IsRequiredForForm' && typeof value !== 'boolean') throw new Error('Native required-form state is unavailable.');
      if (typeof value === 'boolean') return value ? 'True' : 'False';
      if (value === null || typeof value === 'string') return value;
      throw new Error(`Native property "${property}" returned an invalid value.`);
    },
    true,
  );
}
