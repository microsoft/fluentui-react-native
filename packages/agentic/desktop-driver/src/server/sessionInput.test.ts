import { createDesktopDriverClient } from '../client/DesktopDriverClient.js';
import type { DesktopSessionClient } from '../client/DesktopDriverClient.js';
import { compareDesktopInputReceipts, validateDesktopCaseOptions } from '../authoring/input.js';
import type { DesktopInputMode } from '../authoring/input.js';
import type { FakeDesktopHostOptions } from '../hosts/fake/FakeDesktopHost.js';
import type { WebDriverActionSequence } from '../protocol/types.js';
import { createDesktopDriverTestHarness } from '../testing/protocolHarness.js';
import type { DesktopDriverTestHarness } from '../testing/protocolHarness.js';

type Fixture = { harness: DesktopDriverTestHarness; session: DesktopSessionClient };

const element = (id: string, y: number, extra: Record<string, unknown> = {}) => ({
  automationId: id,
  id,
  name: id,
  parentId: 'root',
  rect: { height: 30, width: 100, x: 10, y },
  role: 'button',
  scope: 'application' as const,
  windowId: 'main',
  ...extra,
});

const windows: FakeDesktopHostOptions['windows'] = [
  {
    elements: [
      { id: 'root', name: 'Form', rect: { height: 600, width: 800, x: 0, y: 0 }, role: 'window', scope: 'application', windowId: 'main' },
      element('save', 10),
      element('field', 50, { role: 'textbox', value: 'draft' }),
      element('label', 90, { role: 'text' }),
      element('stepper', 130, { accessibilityActions: ['Increment', 'Decrement', 'Reset', 'Reset'] }),
    ],
    id: 'main',
    title: 'Input fixture',
  },
];

const allFeatures = { accessibilityActions: true, boundedObservation: true, performAccessibilityAction: true };

async function withSession(
  inputMode: DesktopInputMode | undefined,
  body: (fixture: Fixture) => Promise<void>,
  options: FakeDesktopHostOptions = {},
): Promise<void> {
  const harness = await createDesktopDriverTestHarness({ windows, ...options, features: { ...allFeatures, ...options.features } });
  try {
    const session = await createDesktopDriverClient({ url: harness.server.url }).newSession({
      alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id, ...(inputMode ? { 'furn:inputMode': inputMode } : {}) },
    });
    await body({ harness, session });
    await session.delete();
  } finally {
    await harness.close();
  }
}

const refused = (reason: 'input-policy' | 'input-unsupported', mechanism: string) => ({
  code: 'unsupported operation',
  data: expect.objectContaining({ mechanism, reason }),
});

const pointerDown: WebDriverActionSequence[] = [{ actions: [{ button: 0, type: 'pointerDown' }], id: 'mouse', type: 'pointer' }];
const keyDown: WebDriverActionSequence[] = [{ actions: [{ type: 'keyDown', value: 'a' }], id: 'keys', type: 'key' }];
const scroll: WebDriverActionSequence[] = [
  { actions: [{ deltaX: 0, deltaY: 10, type: 'scroll', x: 0, y: 0 }], id: 'wheel', type: 'wheel' },
];

describe('Desktop Driver session input policy', () => {
  test('defaults to compatibility, and reports the mode it enforces', async () => {
    await withSession(undefined, async ({ session }) => {
      expect(session.capabilities['furn:inputMode']).toBe('compatibility');
      await expect(session.getInput()).resolves.toEqual({ mode: 'compatibility', receipts: {} });
    });
    await withSession('accessible', async ({ session }) => {
      expect(session.capabilities).toMatchObject({ 'furn:clickMode': 'accessibility', 'furn:inputMode': 'accessible' });
    });
    await withSession('physical', async ({ session }) => {
      expect(session.capabilities).toMatchObject({ 'furn:clickMode': 'physical', 'furn:inputMode': 'physical' });
    });
  });

  test('refuses a click mode that conflicts with a strict input mode', async () => {
    const harness = await createDesktopDriverTestHarness();
    try {
      const client = createDesktopDriverClient({ url: harness.server.url });
      for (const [inputMode, clickMode] of [
        ['accessible', 'physical'],
        ['physical', 'accessibility'],
      ]) {
        await expect(
          client.newSession({
            alwaysMatch: {
              platformName: 'windows',
              'furn:clickMode': clickMode,
              'furn:inputMode': inputMode,
              'furn:target': harness.target.id,
            },
          }),
        ).rejects.toMatchObject({ code: 'session not created' });
      }
    } finally {
      await harness.close();
    }
  });

  test('an accessible session delivers only semantic input, and dispatches nothing it refuses', async () => {
    await withSession('accessible', async ({ harness, session }) => {
      const save = await session.findElement('accessibility id', 'save');
      const field = await session.findElement('accessibility id', 'field');
      await save.click();
      await field.clear();
      await expect(field.sendKeys('secret')).rejects.toMatchObject(refused('input-policy', 'keyboard'));
      await expect(session.performActions(pointerDown)).rejects.toMatchObject(refused('input-policy', 'pointer'));
      await expect(session.performActions(keyDown)).rejects.toMatchObject(refused('input-policy', 'keyboard'));
      await expect(session.performActions(scroll)).rejects.toMatchObject(refused('input-policy', 'wheel'));
      // Waiting delivers nothing, so an accessible case may still pause.
      await session.performActions([{ actions: [{ duration: 0, type: 'pause' }], id: 'idle', type: 'none' }]);
      await session.performActions([{ actions: [{ duration: 0, type: 'pause' }], id: 'keys', type: 'key' }]);

      expect(harness.host.actions.filter((action) => ['actions', 'clear', 'click', 'send-keys'].includes(action.type as string))).toEqual([
        { elementId: 'save', mode: 'accessibility', type: 'click' },
        { elementId: 'field', mechanism: 'semantic', type: 'clear' },
        expect.objectContaining({ actions: [expect.objectContaining({ id: 'idle' })], type: 'actions' }),
        expect.objectContaining({ actions: [expect.objectContaining({ id: 'keys' })], type: 'actions' }),
      ]);
      await expect(session.getInput()).resolves.toEqual({
        mode: 'accessible',
        receipts: { 'accessibility-click': 1, 'semantic-clear': 1 },
      });
    });
  });

  test('an accessible session refuses a clear the target cannot make semantically', async () => {
    await withSession('accessible', async ({ harness, session }) => {
      await expect((await session.findElement('accessibility id', 'label')).clear()).rejects.toMatchObject({
        code: 'element not interactable',
      });
      expect(harness.host.actions.filter((action) => action.type === 'clear')).toEqual([]);
      await expect(session.getInput()).resolves.toEqual({ mode: 'accessible', receipts: {} });
    });
    await withSession(
      'accessible',
      async ({ harness, session }) => {
        await expect((await session.findElement('accessibility id', 'field')).clear()).rejects.toMatchObject(
          refused('input-unsupported', 'semantic-clear'),
        );
        expect(harness.host.actions.filter((action) => action.type === 'clear')).toEqual([]);
      },
      { features: { strictClear: false } },
    );
  });

  test('a physical session clears only with the keyboard, and needs only the keyboard to start', async () => {
    await withSession(
      'physical',
      async ({ harness, session }) => {
        const field = await session.findElement('accessibility id', 'field');
        await field.clear();
        await field.sendKeys('typed');
        await expect((await session.findElement('accessibility id', 'save')).click()).rejects.toMatchObject(
          refused('input-unsupported', 'physical-click'),
        );
        expect(harness.host.actions.filter((action) => action.type === 'clear' || action.type === 'click')).toEqual([
          { elementId: 'field', mechanism: 'keyboard', type: 'clear' },
        ]);
        await expect(session.getInput()).resolves.toEqual({ mode: 'physical', receipts: { keyboard: 2 } });
      },
      { features: { accessibilityClick: false, physicalClick: false } },
    );
  });

  test('fails a strict clear that the host made another way, after recording what it delivered', async () => {
    await withSession('physical', async ({ harness, session }) => {
      Object.assign(harness.host, { clear: async () => 'semantic' });
      await expect((await session.findElement('accessibility id', 'field')).clear()).rejects.toMatchObject({
        code: 'unknown error',
        data: expect.objectContaining({ reason: 'input-mechanism-mismatch' }),
      });
      await expect(session.getInput()).resolves.toEqual({ mode: 'physical', receipts: { 'semantic-clear': 1 } });
    });
  });

  test('counts a delivery unless its failure proves nothing was dispatched, and attributes what compatibility clears', async () => {
    await withSession(undefined, async ({ harness, session }) => {
      const save = await session.findElement('accessibility id', 'save');
      harness.host.injectFault('click', { effect: 'none', mode: 'reject' });
      await expect(save.click()).rejects.toBeDefined();
      harness.host.injectFault('click', { effect: 'applied', mode: 'reject' });
      await expect(save.click()).rejects.toBeDefined();
      await save.click();
      const field = await session.findElement('accessibility id', 'field');
      await field.clear();
      Object.assign(harness.host, { clear: async () => undefined });
      await field.clear();
      await expect(session.getInput()).resolves.toEqual({
        mode: 'compatibility',
        receipts: { 'physical-click': 2, 'semantic-clear': 1, 'unattributed-clear': 1 },
      });
    });
  });

  test('performs exactly one published accessibility action by name', async () => {
    await withSession('accessible', async ({ harness, session }) => {
      const stepper = await session.findElement('accessibility id', 'stepper');
      await stepper.performAccessibilityAction('Increment');
      await expect(stepper.performAccessibilityAction('Toggle')).rejects.toMatchObject({
        code: 'element not interactable',
        data: expect.objectContaining({ reason: 'action-not-published' }),
      });
      await expect(stepper.performAccessibilityAction('Reset')).rejects.toMatchObject({
        code: 'element not interactable',
        data: expect.objectContaining({ reason: 'action-not-unique' }),
      });
      await expect(stepper.performAccessibilityAction('')).rejects.toMatchObject({ code: 'invalid argument' });
      expect(harness.host.actions.filter((action) => action.type === 'accessibility-action')).toEqual([
        { elementId: 'stepper', name: 'Increment', type: 'accessibility-action' },
      ]);
      await expect(session.getInput()).resolves.toEqual({ mode: 'accessible', receipts: { 'accessibility-action': 1 } });
    });
    await withSession(
      'accessible',
      async ({ session }) => {
        await expect(
          (await session.findElement('accessibility id', 'stepper')).performAccessibilityAction('Increment'),
        ).rejects.toMatchObject({
          code: 'unsupported operation',
        });
      },
      { features: { performAccessibilityAction: false } },
    );
  });

  test('a physical session also delivers the accessible transports a mixed case declares, and receipts account for each', async () => {
    await withSession('physical', async ({ session }) => {
      await (await session.findElement('accessibility id', 'field')).sendKeys('typed');
      await (await session.findElement('accessibility id', 'stepper')).performAccessibilityAction('Increment');
      const { receipts } = await session.getInput();

      expect(receipts).toEqual({ 'accessibility-action': 1, keyboard: 1 });
      const mixed = validateDesktopCaseOptions({ input: 'physical', requires: ['keyboard', 'perform-accessibility-action'] });
      expect(compareDesktopInputReceipts(mixed, receipts, 'physical')).toEqual({ undeclared: [], unused: [] });
      expect(compareDesktopInputReceipts(validateDesktopCaseOptions({ requires: ['keyboard'] }), receipts, 'physical').undeclared).toEqual([
        'accessibility-action',
      ]);
    });
  });

  test('agent operations in an accessible session never type or move the pointer', async () => {
    await withSession('accessible', async ({ harness, session }) => {
      await expect(session.act({ action: 'click', find: { automationId: 'save' } })).rejects.toMatchObject({
        code: 'unsupported operation',
      });
      await expect(session.act({ action: 'type', find: { automationId: 'field' }, text: 'secret' })).rejects.toMatchObject({
        code: 'unsupported operation',
      });
      await expect(session.act({ action: 'activate', find: { automationId: 'save' } })).resolves.toMatchObject({
        result: { mechanism: 'accessibility' },
      });
      await expect(session.act({ action: 'clear', find: { automationId: 'field' } })).resolves.toMatchObject({
        result: { mechanism: 'accessibility' },
      });
      await expect(session.act({ action: 'perform', find: { automationId: 'stepper' }, name: 'Increment' })).resolves.toBeDefined();
      expect(
        harness.host.actions.some((action) => action.type === 'send-keys' || (action.type === 'click' && action.mode === 'physical')),
      ).toBe(false);
      await expect(session.getInput()).resolves.toEqual({
        mode: 'accessible',
        receipts: { 'accessibility-action': 1, 'accessibility-click': 1, 'semantic-clear': 1 },
      });
    });
  });
});
