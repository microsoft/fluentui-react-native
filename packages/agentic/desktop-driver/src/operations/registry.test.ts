import { z } from 'zod';

import { describeOperations, lookupOperation } from './registry';

const readOnly = {
  accessibilityClick: false,
  elementCapture: false,
  keyboard: false,
  physicalClick: false,
  windowCapture: false,
};

const everything = {
  accessibilityClick: true,
  boundedObservation: true,
  elementCapture: true,
  keyboard: true,
  physicalClick: true,
  windowCapture: true,
};

function walk(value: unknown, visit: (key: string, child: unknown) => void): void {
  if (Array.isArray(value)) {
    for (const child of value) {
      walk(child, visit);
    }
  } else if (typeof value === 'object' && value !== null) {
    for (const [key, child] of Object.entries(value)) {
      visit(key, child);
      walk(child, visit);
    }
  }
}

describe('lookupOperation', () => {
  test('finds the registered operations', () => {
    expect(['observe', 'find', 'journal'].map((name) => lookupOperation(name)?.name)).toEqual(['observe', 'find', 'journal']);
  });

  test.each(['', '__proto__', 'constructor', 'toString', 'hasOwnProperty', 'Observe', 'observe '])(
    'does not find %j, which is not a registered name',
    (name) => {
      expect(lookupOperation(name)).toBeUndefined();
    },
  );
});

describe('describeOperations', () => {
  test('lists the operations in a fixed order with their effect and summary', () => {
    const catalog = describeOperations(everything);
    expect(catalog.schemaVersion).toBe(1);
    expect(catalog.operations.map(({ available, effect, name }) => [name, effect, available])).toEqual([
      ['observe', 'read', true],
      ['find', 'read', true],
      ['act', 'mutate', true],
      ['check', 'read', true],
      ['sequence', 'mutate', true],
      ['capture', 'read', true],
      ['artifact', 'read', true],
      ['journal', 'read', true],
    ]);
    for (const entry of catalog.operations) {
      expect(entry.summary.length).toBeGreaterThan(20);
      expect(entry.unavailableReason).toBeUndefined();
    }
  });

  test('marks the operations that need bounded observation unavailable, with the reason, when the provider lacks it', () => {
    const catalog = describeOperations({ ...readOnly, boundedObservation: false });
    expect(catalog.operations.map(({ available, name, unavailableReason }) => [name, available, unavailableReason])).toEqual([
      ['observe', false, 'bounded-observation-unsupported'],
      ['find', false, 'bounded-observation-unsupported'],
      ['act', false, 'bounded-observation-unsupported'],
      ['check', false, 'bounded-observation-unsupported'],
      ['sequence', false, 'bounded-observation-unsupported'],
      ['capture', false, 'bounded-observation-unsupported'],
      ['artifact', false, 'bounded-observation-unsupported'],
      ['journal', true, undefined],
    ]);
  });

  test('marks capture unavailable when the provider cannot capture a window', () => {
    const catalog = describeOperations({ ...everything, windowCapture: false });
    const reasons = catalog.operations
      .filter(({ available }) => !available)
      .map(({ name, unavailableReason }) => [name, unavailableReason]);
    expect(reasons).toEqual([
      ['capture', 'capture-unsupported'],
      ['artifact', 'capture-unsupported'],
    ]);
  });

  describe('schemas', () => {
    const { operations } = describeOperations(everything);

    function inputOf(name: string): Record<string, any> {
      const entry = operations.find((candidate) => candidate.name === name);
      if (!entry) {
        throw new Error(`The catalog has no ${name} operation.`);
      }
      return entry.input;
    }
    test('carry no $schema marker, which every entry would repeat', () => {
      for (const entry of operations) {
        expect(entry.input).not.toHaveProperty('$schema');
        expect(entry.output).not.toHaveProperty('$schema');
      }
    });

    test('keep inputs strict and leave results open to new optional fields', () => {
      for (const entry of operations) {
        expect(entry.input).toMatchObject({ additionalProperties: false, type: 'object' });
        walk(entry.output, (key, child) => {
          expect(key === 'additionalProperties' && child === false).toBe(false);
        });
      }
    });

    test('state the range and default of every budget, so a caller can stay inside them', () => {
      const budget = inputOf('observe').properties.budget.properties;
      expect(budget.maxNodes).toMatchObject({ default: 100, maximum: 500, minimum: 1, type: 'integer' });
      expect(budget.deadlineMs).toMatchObject({ default: 3_000, maximum: 15_000, minimum: 50 });
      expect(inputOf('find').properties.limit).toMatchObject({ default: 10, maximum: 50, minimum: 1 });
    });

    test('require nothing of an observe or journal call, which both have defaults for everything', () => {
      for (const name of ['observe', 'journal']) {
        expect(inputOf(name).required ?? []).toEqual([]);
      }
    });

    // The catalog is context an agent spends on every session; raise these bounds deliberately, not to make a test pass.
    // Capture and artifact raised the total from 23,500.
    test('stay small', () => {
      for (const entry of operations) {
        expect(JSON.stringify(entry.input).length).toBeLessThan(2_500);
        expect(JSON.stringify(entry.output).length).toBeLessThan(5_000);
      }
      expect(JSON.stringify(describeOperations(everything)).length).toBeLessThan(26_500);
    });

    test('are frozen, so a consumer cannot corrupt the cache the next caller reads', () => {
      const first = describeOperations(everything).operations[0];
      expect(() => {
        (first.input as Record<string, unknown>).type = 'string';
      }).toThrow(TypeError);
      expect(describeOperations(everything).operations[0].input).toMatchObject({ type: 'object' });
    });

    test('are real JSON Schema, which accepts the inputs the operations accept', () => {
      for (const entry of operations) {
        expect(() => z.fromJSONSchema(entry.input as never)).not.toThrow();
      }
    });
  });
});
