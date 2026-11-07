import {
  desktopTestSelectionEnvironment,
  desktopTestSelectionFromEnvironment,
  parseDesktopTestSelection,
  serializeDesktopTestSelection,
} from './selection.js';

describe('desktop test selection', () => {
  test('round-trips a lane, the custom scope domains and the target values', () => {
    const raw = serializeDesktopTestSelection({
      endpoint: 'macos',
      lane: 'accessible',
      testScopes: { flavor: ['dev', 'prod'] },
      values: { 'rn.renderer': 'fabric', flavor: 'dev' },
    });

    const selection = parseDesktopTestSelection(raw);

    expect(selection).toMatchObject({ endpoint: 'macos', lane: 'accessible', values: { 'rn.renderer': 'fabric', flavor: 'dev' } });
    expect(selection.domains.flavor).toEqual(['dev', 'prod']);
    expect(selection.domains['rn.renderer']).toEqual(['fabric', 'paper']);
  });

  test('no lane means a run that only applies platform, scope and declared gaps', () => {
    const selection = parseDesktopTestSelection(serializeDesktopTestSelection({ endpoint: 'win32', values: {} }));

    expect(selection.lane).toBeUndefined();
  });

  test('is absent when no run started the process, and malformed values fail loudly rather than being guessed at', () => {
    expect(desktopTestSelectionFromEnvironment({})).toBeUndefined();
    expect(desktopTestSelectionFromEnvironment({ [desktopTestSelectionEnvironment]: '{"endpoint":"win32","values":{}}' })).toMatchObject({
      endpoint: 'win32',
    });
    expect(() => desktopTestSelectionFromEnvironment({ [desktopTestSelectionEnvironment]: '' })).toThrow('is not valid JSON');
  });

  test.each([
    ['not json', 'is not valid JSON'],
    ['[]', 'must be an object'],
    ['null', 'must be an object'],
    ['{"endpoint":"linux","values":{}}', 'endpoint must be one of: macos, windows, win32'],
    ['{"endpoint":"win32","lane":"fast","values":{}}', 'lane must be one of: accessible, physical'],
    ['{"endpoint":"win32","values":{},"extra":1}', 'unknown key "extra"'],
    ['{"endpoint":"win32","values":{"flavor":"dev"}}', 'flavor'],
    ['{"endpoint":"win32","testScopes":{"rn.renderer":["x"]},"values":{}}', 'rn.renderer'],
  ])('rejects %s', (raw, message) => {
    expect(() => parseDesktopTestSelection(raw)).toThrow(message);
  });
});
