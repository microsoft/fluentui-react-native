import type { NativeObservedNode, NativeObserveFact } from '../host/types';
import { buildSample, supportedFact, unsupportedFact } from '../testing/observationSample';
import type { SampleSpec } from '../testing/observationSample';
import { defaultObservedFacts, nativeFacts, observeFacts, project, shownFacts } from './projection';
import type { ProjectedElement, ProjectionFormat, ProjectionRefs, ProjectionView } from './projection';

// A fact added to the native protocol but not to `observeFacts` makes this the compile error that says so.
const everyNativeFactIsListed: Exclude<NativeObserveFact, (typeof observeFacts)[number]> extends never ? true : false = true;

test('lists every fact the native protocol defines, once', () => {
  expect(everyNativeFactIsListed).toBe(true);
  expect(new Set(observeFacts).size).toBe(observeFacts.length);
});

function refSource(tag = 'k3xa'): ProjectionRefs & { assigned: string[][] } {
  let issued = 0;
  const byId = new Map<string, string>();
  const assigned: string[][] = [];
  return {
    assigned,
    assign(nodes) {
      assigned.push(nodes.map((node) => node.id));
      return nodes.map((node) => {
        let reference = byId.get(node.id);
        if (reference === undefined) {
          issued += 1;
          reference = `${tag}${issued}`;
          byId.set(node.id, reference);
        }
        return reference;
      });
    },
    maxLength: (count) => tag.length + String(issued + count).length,
  };
}

type Options = {
  budgets?: { maxBytes: number; maxNodes: number };
  facts?: readonly NativeObserveFact[];
  format?: ProjectionFormat;
  view?: ProjectionView;
};

function run(spec: SampleSpec, options: Options = {}, overrides = {}) {
  const view = options.view ?? 'all';
  const refs = refSource();
  const projection = project({
    budgets: options.budgets ?? { maxBytes: 65_536, maxNodes: 500 },
    format: options.format ?? 'outline',
    observation: buildSample(spec, overrides),
    refs,
    shown: shownFacts(view, options.facts ?? defaultObservedFacts),
    view,
  });
  return { projection, refs };
}

function lines(spec: SampleSpec, options: Options = {}): string[] {
  const { projection } = run(spec, options);
  return projection.outline === '' ? [] : projection.outline.split('\n');
}

const enabled = supportedFact(true);
const disabled = supportedFact(false);

describe('project: all view', () => {
  test('writes document order with positive-only flags, numbering references in sample order', () => {
    const spec: SampleSpec = {
      name: 'Calc',
      role: 'window',
      children: [
        {
          role: 'group',
          children: [
            { enabled, focused: supportedFact(true), name: '7', role: 'button' },
            { checked: supportedFact(false), name: 'Opt', role: 'checkbox' },
            { enabled: disabled, name: 'Off', role: 'button' },
          ],
        },
        { name: 'Label', role: 'text' },
      ],
    };

    expect(lines(spec)).toEqual([
      'window "Calc" k3xa1',
      ' group k3xa2',
      '  button "7" k3xa4 focused',
      '  checkbox "Opt" k3xa5 unchecked',
      '  button "Off" k3xa6 disabled',
      ' text "Label" k3xa3',
    ]);
  });

  test('reports the root reference, counts, and completeness of a whole sample', () => {
    const { projection } = run({ name: 'W', role: 'window', children: [{ name: 'OK', role: 'button' }] });

    expect(projection).toMatchObject({
      complete: true,
      counts: { emitted: 2, matched: 2, visited: 2 },
      root: 'k3xa1',
      truncation: [],
    });
    expect(projection.counts.bytes).toBe(Buffer.byteLength(projection.outline));
  });

  test('marks the states a toggle, a tree item, and a field can be in', () => {
    const spec: SampleSpec = {
      role: 'window',
      children: [
        { checked: supportedFact(true), name: 'a', role: 'checkbox' },
        { checked: supportedFact('mixed'), name: 'b', role: 'checkbox' },
        { checked: supportedFact(false), name: 'c', role: 'button' },
        { checked: unsupportedFact(), name: 'd', role: 'button' },
        { checked: unsupportedFact(), name: 'e', role: 'switch' },
        { expanded: supportedFact(true), name: 'f', role: 'treeitem', selected: supportedFact(true) },
        { expanded: supportedFact(false), name: 'g', role: 'treeitem' },
        { enabled: unsupportedFact(), name: 'h', role: 'button' },
      ],
    };

    expect(lines(spec).slice(1)).toEqual([
      ' checkbox "a" k3xa2 checked',
      ' checkbox "b" k3xa3 mixed',
      ' button "c" k3xa4',
      ' button "d" k3xa5',
      ' switch "e" k3xa6 ?checked',
      ' treeitem "f" k3xa7 selected expanded',
      ' treeitem "g" k3xa8 collapsed',
      ' button "h" k3xa9 ?enabled',
    ]);
  });

  test('shows only the facts that were asked for', () => {
    const spec: SampleSpec = {
      role: 'window',
      children: [
        {
          actions: ['AXPress'],
          automationId: 'num7Button',
          helpText: supportedFact('Seven'),
          name: '7',
          rect: { height: 24.4, width: 40, x: 10.6, y: 20 },
          required: supportedFact(true),
          role: 'button',
          text: 'seven',
          value: '7!',
          visible: supportedFact(false),
        },
      ],
    };

    expect(lines(spec)[1]).toBe(' button "7" k3xa2 #num7Button');
    expect(lines(spec, { facts: ['actions', 'geometry', 'help', 'required', 'text', 'value', 'visible'] })[1]).toBe(
      ' button "7" k3xa2 #num7Button required hidden value="7!" text="seven" help="Seven" actions=AXPress @11,20 40x24',
    );
  });

  test('drops a toggle value that only repeats its checked state, and a text that repeats name or value', () => {
    const spec: SampleSpec = {
      role: 'window',
      children: [
        { checked: supportedFact(true), name: 'Opt', role: 'checkbox', value: '1' },
        { name: 'Same', role: 'text', text: 'Same', value: 'Same' },
        { name: 'Name', role: 'text', text: 'Body', value: 'Value' },
      ],
    };

    expect(lines(spec, { facts: ['checked', 'text', 'value'] }).slice(1)).toEqual([
      ' checkbox "Opt" k3xa2 checked',
      ' text "Same" k3xa3 value="Same"',
      ' text "Name" k3xa4 value="Value" text="Body"',
    ]);
  });
});

describe('project: filtered views', () => {
  const spec = (): SampleSpec => ({
    name: 'Calc',
    role: 'window',
    children: [
      {
        role: 'group',
        children: [
          { enabled, name: '7', role: 'button' },
          { enabled: disabled, name: 'Off', role: 'button' },
        ],
      },
      { name: 'Empty', role: 'group', children: [{ name: 'x', role: 'text' }] },
      { name: 'Label', role: 'text' },
      { role: 'toolbar', children: [{ role: 'group', children: [{ name: 'Save', role: 'button' }] }] },
    ],
  });

  test('interactive keeps operable nodes and the structure above them, and elides anonymous wrappers', () => {
    expect(lines(spec(), { view: 'interactive' })).toEqual([
      'window "Calc" k3xa1',
      ' button "7" k3xa3',
      ' button "Off" k3xa4 disabled',
      ' toolbar k3xa2',
      '  button "Save" k3xa5',
    ]);
  });

  test('content adds the nodes that display something and shows their value and text', () => {
    const content: SampleSpec = {
      name: 'Calc',
      role: 'window',
      children: [
        { name: 'Display', role: 'text', value: '42' },
        { name: 'Equals', role: 'button' },
        { role: 'text' },
        { role: 'group', children: [{ role: 'progressbar', value: '30%' }] },
      ],
    };

    expect(lines(content, { view: 'content' })).toEqual([
      'window "Calc" k3xa1',
      ' text "Display" k3xa2 value="42"',
      ' button "Equals" k3xa3',
      ' progressbar k3xa4 value="30%"',
    ]);
  });

  test('a node that is operable only through a published action says which action', () => {
    const custom: SampleSpec = {
      role: 'window',
      children: [
        { actions: ['AXPress', 'AXShowMenu'], name: 'Tile', role: 'group' },
        { actions: ['AXPress'], name: 'OK', role: 'button' },
        { actions: ['AXRaise'], name: 'Plain', role: 'group' },
      ],
    };

    expect(lines(custom, { view: 'interactive' })).toEqual(['window k3xa1', ' group "Tile" k3xa2 actions=AXPress', ' button "OK" k3xa3']);
  });

  test('matched counts what the view keeps, not what the sample holds', () => {
    const { projection } = run(spec(), { view: 'interactive' });

    expect(projection.counts).toMatchObject({ emitted: 5, matched: 5, visited: 10 });
    expect(projection.complete).toBe(true);
  });

  test('forces the facts a view needs to classify nodes without showing them', () => {
    expect(nativeFacts('all', ['enabled'])).toEqual(['enabled']);
    expect(nativeFacts('interactive', ['enabled'])).toEqual(['actions', 'enabled']);
    expect(shownFacts('interactive', ['enabled'])).toEqual(['enabled']);
    expect(shownFacts('content', ['enabled'])).toEqual(['enabled', 'text', 'value']);
  });
});

describe('project: limits', () => {
  const wide = (): SampleSpec => ({
    name: 'W',
    role: 'window',
    children: [
      {
        name: 'A',
        role: 'group',
        children: [
          { name: 'A1', role: 'button' },
          { name: 'A2', role: 'button' },
        ],
      },
      { name: 'B', role: 'group', children: [{ name: 'B1', role: 'button' }] },
    ],
  });

  test('keeps a breadth-first prefix, writes it in document order, and marks what was left out', () => {
    const { projection } = run(wide(), { budgets: { maxBytes: 65_536, maxNodes: 4 } });

    expect(projection.outline.split('\n')).toEqual([
      'window "W" k3xa1',
      ' group "A" k3xa2 more',
      '  button "A1" k3xa4',
      ' group "B" k3xa3 more',
    ]);
    expect(projection).toMatchObject({
      complete: false,
      counts: { emitted: 4, matched: 6, visited: 6 },
      truncation: [{ limit: 4, omitted: 2, reason: 'maxNodes' }],
    });
  });

  test('drops the marker once the last child of a node fits', () => {
    const { projection } = run(wide(), { budgets: { maxBytes: 65_536, maxNodes: 5 } });

    expect(projection.outline.split('\n')).toEqual([
      'window "W" k3xa1',
      ' group "A" k3xa2',
      '  button "A1" k3xa4',
      '  button "A2" k3xa5',
      ' group "B" k3xa3 more',
    ]);
  });

  test('stops at the byte budget and reports why', () => {
    const { projection } = run(wide(), { budgets: { maxBytes: 70, maxNodes: 500 } });

    expect(projection.counts.bytes).toBeLessThanOrEqual(70);
    expect(projection.truncation).toEqual([{ limit: 70, omitted: expect.any(Number), reason: 'maxBytes' }]);
    expect(projection.complete).toBe(false);
    expect(projection.counts.emitted).toBeLessThan(6);
  });

  test('emits nothing, and no references, when not even the root fits', () => {
    const { projection, refs } = run(wide(), { budgets: { maxBytes: 5, maxNodes: 500 } });

    expect(projection).toMatchObject({ complete: false, counts: { bytes: 0, emitted: 0 }, outline: '' });
    expect(projection.root).toBeUndefined();
    expect(refs.assigned).toEqual([[]]);
  });

  test('issues references only to the nodes it emits', () => {
    const { refs } = run(wide(), { budgets: { maxBytes: 65_536, maxNodes: 3 } });

    expect(refs.assigned).toEqual([['n0', 'n1', 'n2']]);
  });

  test('never exceeds the byte budget, in either format, on arbitrary trees', () => {
    let seed = 7;
    const random = (limit: number) => {
      seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648;
      return seed % limit;
    };
    const roles = ['button', 'group', 'text', 'checkbox', 'list', 'row'];
    const grow = (depth: number): SampleSpec => ({
      automationId: random(3) === 0 ? `id${random(1000)}` : undefined,
      name: random(4) === 0 ? undefined : 'n'.repeat(1 + random(30)) + (random(5) === 0 ? '"é\n' : ''),
      role: roles[random(roles.length)],
      children: depth > 0 ? Array.from({ length: random(5) }, () => grow(depth - 1)) : [],
    });

    for (let round = 0; round < 60; round += 1) {
      const tree = grow(4);
      for (const format of ['outline', 'nodes'] as const) {
        for (const view of ['all', 'interactive'] as const) {
          const maxBytes = 120 + random(900);
          const { projection } = run(tree, { budgets: { maxBytes, maxNodes: 10 + random(60) }, format, view });

          expect(projection.counts.bytes).toBeLessThanOrEqual(maxBytes);
          if (format === 'outline') {
            expect(Buffer.byteLength(projection.outline)).toBe(projection.counts.bytes);
          }
        }
      }
    }
  });
});

describe('project: native truncation', () => {
  test('marks a node whose children were not read and carries the sample truncation through', () => {
    const spec: SampleSpec = {
      role: 'window',
      children: [
        { childrenState: 'unknown', name: 'Deep', role: 'group' },
        { childCount: 9, children: [{ name: 'Only', role: 'button' }], childrenState: 'truncated', name: 'Wide', role: 'list' },
      ],
    };
    const { projection } = run(spec, {}, { truncation: [{ limit: 1, reason: 'depth', unvisited: 3 }] });

    expect(projection.outline.split('\n')).toEqual([
      'window k3xa1',
      ' group "Deep" k3xa2 more',
      ' list "Wide" k3xa3 more',
      '  button "Only" k3xa4',
    ]);
    expect(projection.complete).toBe(false);
    expect(projection.truncation).toEqual([{ limit: 1, reason: 'depth', unvisited: 3 }]);
  });

  test('a filtered view still shows a container whose children were not read', () => {
    const spec: SampleSpec = {
      role: 'window',
      children: [
        { childrenState: 'unknown', name: 'Sidebar', role: 'group' },
        { childrenState: 'unknown', role: 'group' },
        { childrenState: 'unknown', name: 'Open', role: 'button' },
      ],
    };
    const { projection } = run(spec, { view: 'interactive' }, { truncation: [{ reason: 'depth' }] });

    expect(projection.outline.split('\n')).toEqual(['window k3xa1', ' group "Sidebar" k3xa2 more', ' button "Open" k3xa3 more']);
  });

  test('reports an empty sample without inventing a root', () => {
    const projection = project({
      budgets: { maxBytes: 4_096, maxNodes: 100 },
      format: 'outline',
      observation: { complete: false, elapsedMs: 1, nodes: [], truncation: [{ reason: 'references' }], unsupportedFacts: [] },
      refs: refSource(),
      shown: [],
      view: 'all',
    });

    expect(projection).toMatchObject({
      complete: false,
      counts: { bytes: 0, emitted: 0, matched: 0, visited: 0 },
      outline: '',
      truncation: [{ reason: 'references' }],
    });
    expect(projection.root).toBeUndefined();
  });
});

describe('project: untrusted text', () => {
  const hostile = (): SampleSpec => ({
    name: 'Win "dow"\nsecond line',
    role: 'window',
    children: [
      { automationId: 'has space', name: 'tag\u{e0049}\u{e0067}x\u200b', role: 'button' },
      { automationId: 'safe.Id-1', name: 'line\u2028sep', role: 'my role "x"\n' },
    ],
  });

  test('keeps every element on one line and replaces invisible characters with escapes', () => {
    const { projection } = run(hostile());
    const written = projection.outline.split('\n');

    expect(written).toHaveLength(3);
    expect(projection.outline).not.toMatch(/[\u2028\u2029\u0085\u200b]|[\udb40]/);
    expect(written[0]).toBe('window "Win \\"dow\\"\\nsecond line" k3xa1');
    expect(written[1]).toBe(' button "tag\\\\udb40\\\\udc49\\\\udb40\\\\udc67x\\\\u200b" k3xa2 #"has space"');
    expect(written[2]).toBe(' my_role__x__ "line\\\\u2028sep" k3xa3 #safe.Id-1');
  });

  test('marks a cut string with an ellipsis inside its quotes and lists it in the nodes format', () => {
    const spec: SampleSpec = {
      role: 'window',
      children: [{ automationId: 'verylong', clipped: ['name', 'automationId'], name: 'Truncated na', role: 'button' }],
    };

    expect(lines(spec)[1]).toBe(' button "Truncated na…" k3xa2 #"verylong…"');
    const { projection } = run(spec, { format: 'nodes' });
    expect(projection.nodes[1]).toMatchObject({ clipped: ['name', 'automationId'], name: 'Truncated na' });
  });
});

describe('project: formats agree', () => {
  /** A reference reader for the outline grammar in `references/operations.md`. */
  function readLine(line: string) {
    let position = 0;
    while (line[position] === ' ') {
      position += 1;
    }
    const element: Record<string, unknown> = { depth: position, flags: [] as string[] };
    const word = () => {
      const start = position;
      while (position < line.length && line[position] !== ' ') {
        position += 1;
      }
      return line.slice(start, position);
    };
    const quoted = () => {
      const start = position;
      position += 1;
      while (line[position] !== '"') {
        position += line[position] === '\\' ? 2 : 1;
      }
      position += 1;
      return JSON.parse(line.slice(start, position)) as string;
    };
    element.role = word();
    let referenceSeen = false;
    while (position < line.length) {
      position += 1;
      if (line[position] === '"') {
        element.name = quoted();
        continue;
      }
      if (line.startsWith('#"', position)) {
        position += 1;
        element.automationId = quoted();
        continue;
      }
      const start = position;
      const token = word();
      if (!referenceSeen) {
        element.ref = token;
        referenceSeen = true;
      } else if (token.startsWith('#')) {
        element.automationId = token.slice(1);
      } else if (token.startsWith('value=') || token.startsWith('text=') || token.startsWith('help=')) {
        const key = token.slice(0, token.indexOf('='));
        position = start + key.length + 1;
        element[key] = quoted();
      } else if (token.startsWith('actions=')) {
        element.actions = token.slice('actions='.length).split(',');
      } else if (token.startsWith('@')) {
        const [x, y] = token.slice(1).split(',').map(Number);
        const [width, height] = word_after().split('x').map(Number);
        element.rect = { height, width, x, y };
      } else if (token === 'more') {
        element.more = true;
      } else {
        (element.flags as string[]).push(token);
      }
    }
    return element;

    function word_after() {
      position += 1;
      return word();
    }
  }

  test('the outline and the nodes carry the same elements, in the same order', () => {
    const spec: SampleSpec = {
      name: 'Calc "X"',
      role: 'window',
      children: [
        {
          actions: ['AXPress'],
          automationId: 'num7',
          enabled: disabled,
          focused: supportedFact(true),
          helpText: supportedFact('Seven, "7"'),
          name: 'Se\\ven',
          rect: { height: 24, width: 40, x: 10, y: 20 },
          role: 'button',
          text: 'seven',
          value: '7',
        },
        { automationId: 'with space', name: 'Two', role: 'group', children: [{ name: 'Inner', role: 'text' }] },
      ],
    };
    const facts: readonly NativeObserveFact[] = ['actions', 'enabled', 'focused', 'geometry', 'help', 'text', 'value'];
    const outline = run(spec, { facts, format: 'outline' }).projection;
    const structured = run(spec, { facts, format: 'nodes' }).projection;

    const fromOutline = outline.outline.split('\n').map(readLine);
    const fromNodes = structured.nodes.map((element: ProjectedElement) => {
      const { clipped: _clipped, ...rest } = element;
      return { flags: [], ...rest };
    });
    expect(fromOutline).toEqual(fromNodes);
    expect(structured.counts).toMatchObject({ emitted: 4, matched: 4, visited: 4 });
    expect(outline.root).toBe(structured.root);
  });

  test('counts the serialized elements and separators of the nodes format', () => {
    const { projection } = run({ name: 'W', role: 'window', children: [{ name: 'OK', role: 'button' }] }, { format: 'nodes' });

    const serialized = projection.nodes.map((element: ProjectedElement) => JSON.stringify(element));
    expect(projection.counts.bytes).toBe(serialized.join(',').length);
    expect(projection.outline).toBeUndefined();
  });
});

describe('project: node fixtures', () => {
  test('reads nodes the way a provider returns them, with absent facts treated as unobserved', () => {
    const node: NativeObservedNode = { childrenState: 'none', depth: 0, id: 'e1', role: 'window', scope: 'application' };
    const projection = project({
      budgets: { maxBytes: 4_096, maxNodes: 10 },
      format: 'outline',
      observation: { complete: true, elapsedMs: 1, nodes: [node], truncation: [], unsupportedFacts: [] },
      refs: refSource(),
      shown: defaultObservedFacts,
      view: 'all',
    });

    expect(projection.outline).toBe('window k3xa1');
  });
});
