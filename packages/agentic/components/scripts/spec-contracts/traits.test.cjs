const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const { parseFrontMatter } = require('./common.cjs');
const { readTraitsSource, validateTraitsLink } = require('./traits.cjs');

const header = "import type { Traits } from '@fluentui-react-native/design/styling';\n";

function traitsFile(body, name = 'listItemTraits') {
  return `${header}\nexport const ${name} = ${body} as const satisfies Traits<'root', 'subtle', 'medium'>;\n`;
}

const validBody = `{
  channels: { root: { background: 'interactive', foreground: 'rest' } },
  hover: { base: 'enabled' },
  typography: { 'secondary-text': { lineHeight: 'token', weight: 'regular' } },
  geometry: { root: { radius: { small: 'base200', medium: 'base300' }, strokeWidth: 'none' } },
}`;

describe('spec front matter', () => {
  it('normalizes CRLF line endings', () => {
    assert.deepEqual(parseFrontMatter('---\r\nname: tag\r\nstatus: implemented\r\n---\r\n', 'SPEC.md'), {
      name: 'tag',
      status: 'implemented',
    });
  });

  it('rejects repeated keys', () => {
    assert.throws(() => parseFrontMatter('---\nname: tag\nname: badge\n---\n', 'SPEC.md'), /repeats name/);
  });

  it('rejects multi-line and empty values', () => {
    assert.throws(() => parseFrontMatter('---\ntraits:\n  - ./spec/traits.ts\n---\n', 'SPEC.md'), /single-line/);
  });
});

describe('traits source', () => {
  it('returns the declared traits as data', () => {
    assert.deepEqual(readTraitsSource(traitsFile(validBody), 'list-item'), {
      channels: { root: { background: 'interactive', foreground: 'rest' } },
      hover: { base: 'enabled' },
      typography: { 'secondary-text': { lineHeight: 'token', weight: 'regular' } },
      geometry: { root: { radius: { small: 'base200', medium: 'base300' }, strokeWidth: 'none' } },
    });
  });

  it('requires hover when a channel is interactive', () => {
    const body = "{ channels: { root: { background: 'interactive' } } }";
    assert.throws(() => readTraitsSource(traitsFile(body), 'list-item'), /must declare hover/);
  });

  it('rejects unknown facets', () => {
    assert.throws(() => readTraitsSource(traitsFile("{ motion: { root: 'fast' } }"), 'list-item'), /unknown facet motion/);
  });

  const rejected = [
    [
      'a value import',
      `import { Traits } from '@fluentui-react-native/design/styling';\nexport const listItemTraits = {} as const satisfies Traits<'root', never, never>;\n`,
      /import type/,
    ],
    ['a second statement', `${traitsFile(validBody)}const extra = 1;\n`, /may only contain/],
    ['a wrongly named constant', traitsFile(validBody, 'listTraits'), /named listItemTraits/],
    ['a missing as const', `${header}export const listItemTraits = {} satisfies Traits<'root', never, never>;\n`, /as const satisfies/],
    ['a missing satisfies', `${header}export const listItemTraits = {} as const;\n`, /as const satisfies/],
    ['a type annotation', `${header}export const listItemTraits: Traits<'root', never, never> = {};\n`, /unannotated/],
    ['a null value', traitsFile('{ hover: null }'), /NullLiteral/],
    ['an undefined value', traitsFile('{ hover: undefined }'), /Identifier/],
    ['a call', traitsFile("{ hover: hoverFor('button') }"), /CallExpression/],
    ['a spread', traitsFile('{ ...sharedTraits }'), /plain properties/],
    ['a computed key', traitsFile("{ ['hover']: { base: 'enabled' } }"), /computed keys/],
    ['a getter', traitsFile('{ get hover() { return {}; } }'), /plain properties/],
    ['a template literal', traitsFile('{ focusVisual: { root: `platform` } }'), /TemplateLiteral/],
    ['a nested cast', traitsFile("{ focusVisual: { root: 'platform' as 'platform' } }"), /TSAsExpression/],
    ['a repeated key', traitsFile("{ hover: { base: 'enabled' }, hover: { base: 'none' } }"), /repeats the key hover/],
  ];
  for (const [label, source, error] of rejected) {
    it(`rejects ${label}`, () => {
      assert.throws(() => readTraitsSource(source, 'list-item'), error);
    });
  }
});

describe('traits link', () => {
  const frontMatter = { name: 'list-item' };

  it('allows components without traits', () => {
    assert.equal(validateTraitsLink(frontMatter, undefined, 'list-item'), undefined);
  });

  it('requires the link when spec/traits.ts exists', () => {
    assert.throws(() => validateTraitsLink(frontMatter, traitsFile(validBody), 'list-item'), /must reference/);
  });

  it('requires the file when the link exists', () => {
    assert.throws(
      () => validateTraitsLink({ ...frontMatter, traits: './spec/traits.ts' }, undefined, 'list-item'),
      /missing spec\/traits.ts/,
    );
  });

  it('requires the canonical link and schema version', () => {
    assert.throws(
      () => validateTraitsLink({ ...frontMatter, traits: 'spec/traits.ts' }, traitsFile(validBody), 'list-item'),
      /must reference/,
    );
    assert.throws(
      () => validateTraitsLink({ ...frontMatter, traits: './spec/traits.ts', 'traits-schema': '2' }, traitsFile(validBody), 'list-item'),
      /traits-schema: 1/,
    );
    assert.throws(() => validateTraitsLink({ ...frontMatter, 'traits-schema': '1' }, undefined, 'list-item'), /without traits/);
  });

  it('accepts a linked, versioned traits file', () => {
    const traits = validateTraitsLink(
      { ...frontMatter, traits: './spec/traits.ts', 'traits-schema': '1' },
      traitsFile(validBody),
      'list-item',
    );
    assert.deepEqual(traits.hover, { base: 'enabled' });
  });
});
