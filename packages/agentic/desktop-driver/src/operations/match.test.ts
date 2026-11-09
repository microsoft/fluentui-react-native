import { buildSample } from '../testing/observationSample';
import type { SampleSpec } from '../testing/observationSample';
import { classify, compilePredicates, factsNeeded, hasPredicate, verdictFor } from './match';
import type { FindPredicates } from './match';

function sample(children: SampleSpec[], overrides = {}) {
  return buildSample({ name: 'Window', role: 'window', children }, overrides);
}

function find(children: SampleSpec[], predicates: FindPredicates, overrides = {}, includeRoot = true) {
  const observation = sample(children, overrides);
  const result = classify(observation, predicates, includeRoot);
  return { ...result, ids: [...result.definite, ...result.possible].map((index) => observation.nodes[index].id) };
}

describe('verdictFor', () => {
  const node = (fields: SampleSpec) => buildSample(fields).nodes[0];

  test('compares role without case and exact fields with case', () => {
    expect(verdictFor(node({ name: 'Save', role: 'button' }), compilePredicates({ role: 'BUTTON', name: 'Save' }))).toBe('yes');
    expect(verdictFor(node({ name: 'Save', role: 'button' }), compilePredicates({ name: 'save' }))).toBe('no');
    expect(verdictFor(node({ name: 'Save', role: 'button' }), compilePredicates({ nameContains: 'AV' }))).toBe('yes');
    expect(verdictFor(node({ automationId: 'saveButton', role: 'button' }), compilePredicates({ automationId: 'saveButton' }))).toBe('yes');
  });

  test('a field the node does not report never matches, including withheld secure text', () => {
    const secure = node({ name: 'Password', role: 'textbox' });

    expect(verdictFor(secure, compilePredicates({ text: 'hunter2' }))).toBe('no');
    expect(verdictFor(secure, compilePredicates({ textContains: 'hunter' }))).toBe('no');
    expect(verdictFor(secure, compilePredicates({ automationId: 'x' }))).toBe('no');
  });

  test('a cut field can only be matched exactly by continuing past what was kept', () => {
    const cut = node({ clipped: ['name'], name: 'Save the docu', role: 'button' });

    expect(verdictFor(cut, compilePredicates({ name: 'Save the document' }))).toBe('possible');
    expect(verdictFor(cut, compilePredicates({ name: 'Save the docu' }))).toBe('no');
    expect(verdictFor(cut, compilePredicates({ name: 'Save as' }))).toBe('no');
    expect(verdictFor(cut, compilePredicates({ name: 'Save' }))).toBe('no');
  });

  test('contains on a cut field is definite only when the kept part has it', () => {
    const cut = node({ clipped: ['name'], name: 'Save the docu', role: 'button' });

    expect(verdictFor(cut, compilePredicates({ nameContains: 'THE' }))).toBe('yes');
    expect(verdictFor(cut, compilePredicates({ nameContains: 'ment' }))).toBe('possible');
  });

  test('any definite miss outweighs an open predicate', () => {
    const cut = node({ clipped: ['name'], name: 'Save the docu', role: 'link' });

    expect(verdictFor(cut, compilePredicates({ name: 'Save the document', role: 'button' }))).toBe('no');
    expect(verdictFor(cut, compilePredicates({ name: 'Save the document', role: 'link' }))).toBe('possible');
  });

  test('text and automation id are cut independently of the name', () => {
    const cut = node({ automationId: 'abc', clipped: ['automationId'], name: 'Whole', role: 'button', text: 'Whole' });

    expect(verdictFor(cut, compilePredicates({ automationId: 'abcdef', name: 'Whole' }))).toBe('possible');
    expect(verdictFor(cut, compilePredicates({ name: 'Whole', text: 'Whole' }))).toBe('yes');
  });
});

describe('classify: the outcome table', () => {
  test('unique requires a complete sample with exactly one definite match', () => {
    const result = find(
      [
        { name: 'Save', role: 'button' },
        { name: 'Cancel', role: 'button' },
      ],
      { name: 'Save' },
    );

    expect(result).toMatchObject({ ids: ['n1'], outcome: 'unique', reasons: [] });
  });

  test('none requires a complete sample with no definite or possible match', () => {
    expect(find([{ name: 'Save', role: 'button' }], { name: 'Open' })).toMatchObject({ ids: [], outcome: 'none' });
  });

  test('two definite matches prove multiple even in a partial sample', () => {
    const result = find(
      [
        { name: 'Save', role: 'button' },
        { name: 'Save', role: 'button' },
      ],
      { name: 'Save' },
      { truncation: [{ reason: 'visited' }] },
    );

    expect(result).toMatchObject({ outcome: 'multiple', reasons: [] });
  });

  test('one match in a partial sample is not proof of uniqueness', () => {
    const result = find([{ name: 'Save', role: 'button' }], { name: 'Save' }, { truncation: [{ reason: 'depth' }] });

    expect(result).toMatchObject({ ids: ['n1'], outcome: 'inconclusive', reasons: ['incomplete'] });
  });

  test('no match in a partial sample is not proof of absence', () => {
    const result = find([{ name: 'Save', role: 'button' }], { name: 'Open' }, { truncation: [{ reason: 'deadline' }] });

    expect(result).toMatchObject({ ids: [], outcome: 'inconclusive', reasons: ['incomplete'] });
  });

  test('a cut field that could still match keeps a single definite match from being unique', () => {
    const result = find(
      [
        { name: 'Save the document', role: 'button' },
        { clipped: ['name'], name: 'Save the docu', role: 'button' },
      ],
      { name: 'Save the document' },
    );

    expect(result).toMatchObject({ ids: ['n1', 'n2'], outcome: 'inconclusive', reasons: ['clipped'] });
  });

  test('a cut field that cannot match does not block uniqueness', () => {
    const result = find(
      [
        { name: 'Save the document', role: 'button' },
        { clipped: ['name'], name: 'Open the docu', role: 'button' },
      ],
      { name: 'Save the document' },
    );

    expect(result).toMatchObject({ ids: ['n1'], outcome: 'unique' });
  });

  test('a possible match does not turn a proven multiple into inconclusive', () => {
    const result = find(
      [
        { name: 'Save', role: 'button' },
        { name: 'Save', role: 'button' },
        { clipped: ['name'], name: 'Save the docu', role: 'button' },
      ],
      { nameContains: 'save' },
    );

    expect(result.outcome).toBe('multiple');
  });

  test('reports both reasons when the sample is partial and a field is cut', () => {
    const result = find(
      [{ clipped: ['name'], name: 'Save the docu', role: 'button' }],
      { name: 'Save the document' },
      { truncation: [{ reason: 'visited' }] },
    );

    expect(result.reasons).toEqual(['incomplete', 'clipped']);
  });

  test('a fact the provider cannot read makes a text search inconclusive instead of empty', () => {
    const result = find([{ name: 'Save', role: 'button' }], { textContains: 'sav' }, { unsupportedFacts: ['text'] });

    expect(result).toMatchObject({ ids: [], outcome: 'inconclusive', reasons: ['unsupported-fact'] });
  });

  test('searching inside an element never returns that element', () => {
    const inside = find([{ name: 'Save', role: 'button' }], { role: 'window' }, {}, false);
    const outside = find([{ name: 'Save', role: 'button' }], { role: 'window' }, {}, true);

    expect(inside.outcome).toBe('none');
    expect(outside).toMatchObject({ ids: ['n0'], outcome: 'unique' });
  });

  test('lists matches in document order, not sample order', () => {
    const result = find(
      [
        { role: 'group', children: [{ name: 'Item', role: 'button', id: 'deep' }] },
        { name: 'Item', role: 'button', id: 'shallow' },
      ],
      { name: 'Item' },
    );

    expect(result.ids).toEqual(['deep', 'shallow']);
    expect(result.outcome).toBe('multiple');
  });
});

describe('predicate helpers', () => {
  test('knows which predicates exist and which facts they need', () => {
    expect(hasPredicate({})).toBe(false);
    expect(hasPredicate({ role: 'button' })).toBe(true);
    expect(factsNeeded({ role: 'button', name: 'x' })).toEqual([]);
    expect(factsNeeded({ textContains: 'x' })).toEqual(['text']);
  });
});
