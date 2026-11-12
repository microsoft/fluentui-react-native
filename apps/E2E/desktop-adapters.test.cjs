const assert = require('node:assert/strict');
const { afterEach, mock, test } = require('node:test');
const { BasePage } = require('./lib/common/BasePage.js');
const { Keys } = require('./lib/common/consts.js');
const { installLegacyDesktopAttributes, scrollNativeDesktopElement, sendNativeDesktopKeys } = require('./lib/common/nativeDesktop.js');

afterEach(() => {
  mock.restoreAll();
  delete globalThis.browser;
});

test('Windows assertion checks inspect menu windows without selecting or activating them', async () => {
  const reads = [];
  globalThis.browser = {
    capabilities: { browserName: 'furn-native-desktop', platformName: 'windows', 'furn:endpoint': 'win32' },
    options: { protocol: 'http', hostname: '127.0.0.1', port: 1, path: '/' },
    sessionId: 'session',
    getWindowHandles: async () => ['main', 'menu'],
    getWindowHandle: async () => 'main',
    switchToWindow: () => assert.fail('an assertion check must not change native focus'),
  };
  mock.method(globalThis, 'fetch', async (url, init) => {
    reads.push(String(url));
    assert.equal(init.method, 'GET');
    return new Response(JSON.stringify({ value: [{ role: 'menu', children: [{ role: 'menuitem', children: [] }] }] }));
  });
  assert.equal(await new BasePage().didAssertPopup(), false);
  // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- mocked loopback transport; no service is contacted
  assert.deepEqual(reads, ['http://127.0.0.1:1/session/session/furn/window/menu/tree']);
  browser.getWindowHandles = async () => ['main'];
  browser.getWindowHandle = () => assert.fail('one window needs no further inspection');
  assert.equal(await new BasePage().didAssertPopup(), false);
  assert.equal(reads.length, 1);
});

test('Windows assertion checks fail closed for dialogs, unrecognized roots, and unreadable windows', async () => {
  globalThis.browser = {
    capabilities: { browserName: 'furn-native-desktop', platformName: 'windows', 'furn:endpoint': 'windows' },
    options: { protocol: 'http', hostname: '127.0.0.1', port: 1, path: '/' },
    sessionId: 'session',
    getWindowHandles: async () => ['main', 'other'],
    getWindowHandle: async () => 'main',
    switchToWindow: () => assert.fail('an assertion check must not change native focus'),
  };
  let value;
  const reader = mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ value })));
  const page = new BasePage();
  for (const roots of [
    [{ role: 'window', name: 'Assertion failed', children: [] }],
    [{ role: 'group', children: [] }],
    [],
    [{ role: 'menu', children: [{ role: 'dialog', children: [] }] }],
    [{ role: 'menu', children: [{ role: 'window', children: [] }] }],
    [
      { role: 'menu', children: [] },
      { role: 'dialog', children: [] },
    ],
  ]) {
    value = roots;
    assert.equal(await page.didAssertPopup(), true);
  }
  reader.mock.mockImplementation(async () => {
    throw new Error('provider is unavailable');
  });
  await assert.rejects(page.didAssertPopup(), /provider is unavailable/);
});

test('Windows assertion checks do not let an open menu hide another unexpected window', async () => {
  globalThis.browser = {
    capabilities: { browserName: 'furn-native-desktop', platformName: 'windows', 'furn:endpoint': 'win32' },
    options: { protocol: 'http', hostname: '127.0.0.1', port: 1, path: '/' },
    sessionId: 'session',
    getWindowHandles: async () => ['main', 'menu', 'assert'],
    getWindowHandle: async () => 'main',
  };
  mock.method(
    globalThis,
    'fetch',
    async (url) =>
      new Response(
        JSON.stringify({
          value: [{ role: String(url).endsWith('/menu/tree') ? 'menu' : 'window', children: [] }],
        }),
      ),
  );
  assert.equal(await new BasePage().didAssertPopup(), true);
});

test('assertion checks retain non-native and macOS window-count behavior', async () => {
  for (const capabilities of [
    { browserName: 'non-native' },
    { browserName: 'furn-native-desktop', platformName: 'macos', 'furn:endpoint': 'macos' },
  ]) {
    globalThis.browser = { capabilities, getWindowHandles: async () => ['main', 'other'] };
    assert.equal(await new BasePage().didAssertPopup(), true);
  }
});

test('native checkbox and switch state never falls back to selected', async () => {
  const page = new BasePage();
  const element = { elementId: 'toggle', isSelected: () => assert.fail('checked is not selected') };
  for (const value of [false, true, 'mixed', null, undefined]) {
    globalThis.browser = {
      capabilities: { browserName: 'furn-native-desktop' },
      async getElementProperty(id, property) {
        assert.equal(id, 'toggle');
        assert.equal(property, 'checked');
        return value;
      },
    };
    if (typeof value === 'boolean') assert.equal(await page.isChecked(element), value);
    else await assert.rejects(page.isChecked(element), /native boolean checked state/);
  }
});

test('non-native runners retain their selected-based toggle behavior', async () => {
  globalThis.browser = { capabilities: { browserName: 'non-native' } };
  const page = new BasePage();
  for (const value of [false, true]) assert.equal(await page.isChecked({ isSelected: async () => value }), value);
});

test('legacy required-form attributes use the authoritative native required property', async () => {
  let attribute;
  globalThis.browser = {
    overwriteCommand(name, callback, options) {
      assert.equal(name, 'getAttribute');
      assert.deepEqual(options, { attachToElement: true });
      attribute = callback;
    },
  };
  installLegacyDesktopAttributes();
  for (const value of [false, true, null, undefined, 'False']) {
    const element = {
      elementId: 'field',
      async getElementProperty(id, property) {
        assert.equal(id, 'field');
        assert.equal(property, 'required');
        return value;
      },
    };
    const result = attribute.call(element, undefined, 'IsRequiredForForm');
    if (typeof value === 'boolean') assert.equal(await result, value ? 'True' : 'False');
    else await assert.rejects(result, /required-form state is unavailable/);
  }
});

test('native key chords release held input even when dispatch fails', async () => {
  const actions = [
    { type: 'keyDown', value: Keys.CONTROL },
    { type: 'keyDown', value: Keys.ENTER },
    { type: 'keyUp', value: Keys.ENTER },
    { type: 'keyUp', value: Keys.CONTROL },
  ];
  for (const fail of [false, true]) {
    let released = false;
    globalThis.browser = {
      async elementSendKeys(id, value) {
        assert.equal(id, 'button');
        assert.equal(value, '');
      },
      async performActions(sources) {
        assert.deepEqual(sources, [{ type: 'key', id: 'tester-keyboard', actions }]);
        if (fail) throw new Error('input dispatch failed');
      },
      async releaseActions() {
        released = true;
      },
    };
    const dispatch = sendNativeDesktopKeys({ elementId: 'button' }, [Keys.CONTROL, Keys.ENTER, Keys.NULL]);
    if (fail) await assert.rejects(dispatch, /input dispatch failed/);
    else await dispatch;
    assert.equal(released, true);
  }
});

test('native scrolling clips oversized scrollers and keeps click centers away from clip edges', async () => {
  for (const [scrollerHeight, targetY] of [
    [670, 720],
    [585, 652],
  ]) {
    let scrolled = false;
    globalThis.browser = {
      capabilities: { 'furn:features': { wheel: true } },
      getWindowRect: async () => ({ x: 200, y: 100, width: 1000, height: 700 }),
      getElementRect: async (id) =>
        id === 'scroller'
          ? { x: 10, y: 80, width: 150, height: scrollerHeight }
          : { x: 20, y: scrolled ? 450 : targetY, width: 120, height: 24 },
      getWindowHandle: async () => 'window',
      switchToWindow: async (handle) => assert.equal(handle, 'window'),
      async performActions() {
        scrolled = true;
      },
      async waitUntil(predicate) {
        assert.equal(await predicate(), true);
      },
    };
    await scrollNativeDesktopElement({ elementId: 'button', isDisplayed: async () => true }, { elementId: 'scroller' });
    assert.equal(scrolled, true);
  }
});

test('negative disabled-control clicks use physical input and release it on failure', async () => {
  for (const fail of [false, true]) {
    let released = false;
    globalThis.browser = {
      capabilities: { browserName: 'furn-native-desktop', 'furn:features': { physicalClick: true } },
      async performActions([source]) {
        assert.equal(source.actions[0].origin['element-6066-11e4-a52e-4f735466cecf'], 'disabled');
        assert.deepEqual(source.actions.slice(1), [
          { type: 'pointerDown', button: 0 },
          { type: 'pointerUp', button: 0 },
        ]);
        if (fail) throw new Error('physical input failed');
      },
      async releaseActions() {
        released = true;
      },
    };
    const result = new BasePage().click({
      elementId: 'disabled',
      isEnabled: async () => false,
      click: () => assert.fail('Element Click cannot exercise a disabled control'),
    });
    if (fail) await assert.rejects(result, /physical input failed/);
    else await result;
    assert.equal(released, true);
  }
});

test('hosted macOS navigation uses keyboard only when physical clicks are explicitly disabled', async () => {
  for (const physicalClick of [false, true, undefined]) {
    const page = new BasePage();
    page.platform = 'macos';
    const inputs = [];
    const button = {
      elementId: 'page',
      isDisplayed: async () => true,
      isEnabled: async () => true,
      click: async () => inputs.push('click'),
    };
    Object.defineProperties(page, {
      _pageButton: { value: button },
      _testPageButtonScrollViewer: { value: { elementId: 'scroller' } },
    });
    page.waitForPageToLoad = async () => true;
    globalThis.browser = {
      capabilities: { browserName: 'furn-native-desktop', 'furn:features': { physicalClick, keyboard: true } },
      getWindowRect: async () => ({ x: 8, y: 32, width: 1000, height: 680 }),
      getElementRect: async () => ({ x: 10, y: 80, width: 140, height: 30 }),
      async elementSendKeys(id, text) {
        assert.equal(id, 'page');
        assert.equal(text, '');
        inputs.push('focus');
      },
      async performActions([source]) {
        assert.deepEqual(source.actions, [
          { type: 'keyDown', value: Keys.SPACE },
          { type: 'keyUp', value: Keys.SPACE },
        ]);
        inputs.push('space');
      },
      async releaseActions() {
        inputs.push('release');
      },
    };
    assert.equal(await page.navigateToPageAndLoadTests(), true);
    assert.deepEqual(inputs, physicalClick === false ? ['focus', 'space', 'release'] : ['click']);
    if (physicalClick === false) {
      browser.capabilities['furn:features'].keyboard = false;
      await assert.rejects(page.navigateToPageAndLoadTests(), /does not support keyboard navigation/);
      button.isEnabled = async () => false;
      assert.equal(await page.navigateToPageAndLoadTests(), true);
      assert.deepEqual(inputs, ['focus', 'space', 'release']);
    }
  }
});
