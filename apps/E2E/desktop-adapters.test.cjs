const assert = require('node:assert/strict');
const { afterEach, test } = require('node:test');
const { BasePage } = require('./lib/common/BasePage.js');
const { Keys } = require('./lib/common/consts.js');
const { installLegacyDesktopAttributes, sendNativeDesktopKeys } = require('./lib/common/nativeDesktop.js');

afterEach(() => {
  delete globalThis.browser;
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

test('legacy runners retain their selected-based toggle behavior', async () => {
  globalThis.browser = { capabilities: { browserName: 'legacy-appium' } };
  const page = new BasePage();
  for (const value of [false, true]) assert.equal(await page.isChecked({ isSelected: async () => value }), value);
});

test('legacy required-form attributes use the authoritative native required property', async () => {
  let attribute;
  globalThis.browser = {
    overwriteCommand(name, callback, element) {
      assert.equal(name, 'getAttribute');
      assert.equal(element, true);
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
