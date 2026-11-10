import type { NativeActionSequence, NativeSelector } from '../../host/types';
import { FakeDesktopHost } from './FakeDesktopHost';
import type { FakeDesktopElement, FakeDesktopHostOptions } from './FakeDesktopHost';

const base = { scope: 'preview', windowId: 'window-1' } as const;
const rect = { height: 20, width: 100, x: 0, y: 0 };

function createHost(elements: FakeDesktopElement[], options: FakeDesktopHostOptions = {}): FakeDesktopHost {
  return new FakeDesktopHost({ ...options, windows: [{ elements, id: 'window-1', title: 'Fake' }] });
}

async function findIds(host: FakeDesktopHost, selector: NativeSelector): Promise<string[]> {
  return (await host.find({ windowId: 'window-1' }, selector)).map(({ id }) => id);
}

describe('FakeDesktopHost selectors', () => {
  const host = createHost([
    { ...base, id: 'label', rect, role: 'text', text: 'Visible text' },
    { ...base, id: 'save', name: 'Save draft', rect, role: 'button' },
    { ...base, id: 'field', rect, role: 'textbox', value: 'Ada' },
    { ...base, id: 'link', automationId: 'home', name: 'Home', rect, role: 'link' },
    { ...base, id: 'unnamed', automationId: '', rect, role: 'group' },
  ]);

  test('matches -furn:text exactly against text, value or accessible name', async () => {
    await expect(findIds(host, { strategy: '-furn:text', value: 'Visible text' })).resolves.toEqual(['label']);
    await expect(findIds(host, { strategy: '-furn:text', value: 'Visible' })).resolves.toEqual([]);
    await expect(findIds(host, { strategy: '-furn:text', value: 'Ada' })).resolves.toEqual(['field']);
    await expect(findIds(host, { strategy: '-furn:text', value: 'Save draft' })).resolves.toEqual(['save']);
    await expect(findIds(host, { strategy: '-furn:text', value: 'save draft' })).resolves.toEqual([]);
  });

  test('normalizes a role query as the native helpers do', async () => {
    await expect(findIds(host, { strategy: 'tag name', value: 'button' })).resolves.toEqual(['save']);
    await expect(findIds(host, { strategy: 'tag name', value: '  BUTTON ' })).resolves.toEqual(['save']);
    await expect(findIds(host, { strategy: 'tag name', value: 'edit' })).resolves.toEqual(['field']);
    await expect(findIds(host, { strategy: 'tag name', value: 'Hyperlink' })).resolves.toEqual(['link']);
    await expect(findIds(host, { strategy: 'tag name', value: 'constructor' })).resolves.toEqual([]);
  });

  test('compares an accessibility id and link text exactly, and refuses empty ones', async () => {
    await expect(findIds(host, { strategy: 'accessibility id', value: 'home' })).resolves.toEqual(['link']);
    await expect(findIds(host, { strategy: 'accessibility id', value: 'hom' })).resolves.toEqual([]);
    await expect(findIds(host, { strategy: 'accessibility id', value: '' })).resolves.toEqual([]);
    await expect(findIds(host, { strategy: 'link text', value: 'Save' })).resolves.toEqual([]);
    await expect(findIds(host, { strategy: 'partial link text', value: 'Save' })).resolves.toEqual(['save']);
    await expect(findIds(host, { strategy: 'partial link text', value: '' })).resolves.toEqual([]);
  });
});

describe('FakeDesktopHost element state', () => {
  test('reports a state only when the element declares it, and never turns unsupported into false', async () => {
    const host = createHost([
      { ...base, id: 'plain', rect, role: 'button' },
      { ...base, id: 'box', checked: false, expanded: true, rect, role: 'checkbox', selected: false },
    ]);

    const plain = await host.snapshot('plain');
    expect(plain.checked).toMatchObject({ supported: false });
    expect(plain.expanded).toMatchObject({ supported: false });
    expect(plain.selected).toMatchObject({ supported: false });
    expect(plain.enabled).toEqual({ supported: true, value: true });

    const box = await host.snapshot('box');
    expect(box.checked).toEqual({ supported: true, value: false });
    expect(box.expanded).toEqual({ supported: true, value: true });
    expect(box.selected).toEqual({ supported: true, value: false });
  });

  test('toggles only a checkbox that reports a checked state', async () => {
    const host = createHost([
      { ...base, id: 'declared', checked: false, rect, role: 'checkbox' },
      { ...base, id: 'undeclared', rect, role: 'checkbox' },
    ]);

    await host.click('declared', 'physical');
    await host.click('undeclared', 'physical');

    expect((await host.snapshot('declared')).checked).toEqual({ supported: true, value: true });
    expect((await host.snapshot('undeclared')).checked).toMatchObject({ supported: false });
  });
});

describe('FakeDesktopHost input masks', () => {
  const field: FakeDesktopElement = { ...base, id: 'field', rect, role: 'textbox', value: '' };
  const sequence = (type: NativeActionSequence['type'], actions: NativeActionSequence['actions']): NativeActionSequence => ({
    actions,
    id: type,
    type,
  });

  test('refuses typing and key sequences when the keyboard is masked', async () => {
    const host = createHost([field], { features: { keyboard: false } });

    await expect(host.sendKeys('field', 'secret')).rejects.toThrow('keyboard input is disabled');
    await expect(host.performActions([sequence('key', [{ type: 'keyDown', value: 'a' }])])).rejects.toThrow('key input is disabled');
    expect((await host.snapshot('field')).value).toBe('');
    expect(host.actions).toEqual([]);
  });

  test('refuses pointer and wheel sequences when those inputs are masked', async () => {
    const host = createHost([field], { features: { physicalClick: false, wheel: false } });

    await expect(host.performActions([sequence('pointer', [{ type: 'pointerDown', button: 0 }])])).rejects.toThrow(
      'pointer input is disabled',
    );
    await expect(host.performActions([sequence('wheel', [{ type: 'scroll', deltaX: 0, deltaY: 1, x: 0, y: 0 }])])).rejects.toThrow(
      'wheel input is disabled',
    );
    expect(host.actions).toEqual([]);
  });

  test('lets a masked target wait with a pause-only source, and an unmasked one deliver input', async () => {
    const masked = createHost([field], { features: { keyboard: false } });
    await expect(masked.performActions([sequence('key', [{ type: 'pause', duration: 0 }])])).resolves.toBeUndefined();

    const open = createHost([field]);
    await open.sendKeys('field', 'Ada');
    await open.performActions([sequence('key', [{ type: 'keyDown', value: 'a' }])]);
    expect((await open.snapshot('field')).value).toBe('Ada');
    expect(open.actions.map(({ type }) => type)).toEqual(['send-keys', 'actions-start', 'actions']);
  });
});
