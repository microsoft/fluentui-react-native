import { createInputState, parseActionSequences } from './actions';

const pointerMove = { type: 'pointerMove', x: 0, y: 0 };
const scroll = { type: 'scroll', x: 0, y: 0, deltaX: 0, deltaY: 0 };

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

  test.each([
    ['pointer', 'x', pointerMove],
    ['pointer', 'y', pointerMove],
    ['wheel', 'x', scroll],
    ['wheel', 'y', scroll],
    ['wheel', 'deltaX', scroll],
    ['wheel', 'deltaY', scroll],
  ] as const)('rejects invalid %s action field %s', (type, field, action) => {
    for (const value of [JSON.parse('1e309'), JSON.parse('-1e309'), NaN, -2_147_483_648.5, 2_147_483_647.5, '0', undefined]) {
      expect(() => parseActionSequences([{ id: type, type, actions: [{ ...action, [field]: value }] }], createInputState())).toThrow(
        expect.objectContaining({ code: 'invalid argument', message: expect.stringContaining(`actions[0].actions[0].${field} `) }),
      );
    }
  });

  test('preserves signed 32-bit endpoints and in-range fractions for pointer and wheel actions', () => {
    const sequences = [
      { id: 'mouse', type: 'pointer', actions: [{ ...pointerMove, x: -2_147_483_648, y: 2_147_483_647 }] },
      {
        id: 'wheel',
        type: 'wheel',
        actions: [{ ...scroll, x: -2_147_483_647.5, y: 2_147_483_646.5, deltaX: 2_147_483_647, deltaY: -2_147_483_648 }],
      },
    ];
    expect(parseActionSequences(sequences, createInputState()).actions).toEqual(sequences);
  });

  test('allows none sources to pause without pointer or wheel values', () => {
    const sequences = [{ id: 'clock', type: 'none', actions: [{ type: 'pause', duration: 1 }] }];
    expect(parseActionSequences(sequences, createInputState()).actions).toEqual(sequences);
    expect(() => parseActionSequences([{ ...sequences[0], actions: [pointerMove] }], createInputState())).toThrow(
      'must be "pause" for a none input source',
    );
  });
});
