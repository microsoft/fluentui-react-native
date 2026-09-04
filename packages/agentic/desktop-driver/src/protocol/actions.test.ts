import { createInputState, parseActionSequences } from './actions';

describe('WebDriver actions', () => {
  test('requires key values to contain exactly one Unicode code point', () => {
    expect(() =>
      parseActionSequences([{ actions: [{ type: 'keyDown', value: 'ab' }], id: 'keyboard', type: 'key' }], createInputState()),
    ).toThrow('exactly one Unicode code point');
    expect(() =>
      parseActionSequences([{ actions: [{ type: 'keyDown', value: '\ud800' }], id: 'keyboard', type: 'key' }], createInputState()),
    ).toThrow('exactly one Unicode code point');

    const parsed = parseActionSequences(
      [
        {
          actions: [
            { type: 'keyDown', value: '\uE008' },
            { type: 'keyDown', value: '\u{1F600}' },
          ],
          id: 'keyboard',
          type: 'key',
        },
      ],
      createInputState(),
    );
    expect([...parsed.nextState.pressedKeys]).toEqual(['\uE008', '\u{1F600}']);
  });
});
