import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const output = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(output, '..', '..', '..');
const design = path.join(root, 'packages', 'agentic', 'design');
const require = createRequire(path.join(design, 'package.json'));
const YAML = require('yaml');
const research = path.dirname(output);
const read = (file) => fs.readFileSync(file, 'utf8');
const json = (file) => JSON.parse(read(file));
const yaml = (file) => YAML.parse(read(file));
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const portable = (file) => path.relative(root, file).split(path.sep).join('/');
const unique = (values) => [...new Set(values)];
const office = json(path.join(research, 'office_colors.json'));
const overrides = json(path.join(research, 'office_app_overrides.json'));
const usage = yaml(path.join(research, 'office-swatch-set-usage.yaml'));
const templates = yaml(path.join(research, 'office-templates.yaml'));
const flexUsage = yaml(path.join(research, 'flex-research.yaml'));
const win32Root = path.dirname(require.resolve('@fluentui-react-native/design-tokens-win32/package.json'));
const win32Package = json(path.join(win32Root, 'package.json'));
const fixtures = path.join(design, 'scripts', 'token-mappings', '__fixtures__', 'x3');
const pin = json(path.join(design, 'src', 'tokens', 'mappings', 'upstream-pin.json'));
const manifest = [];
function record(file, source = portable(file)) {
  manifest.push({ source, sha256: sha256(file) });
}
for (const name of [
  'office_colors.json',
  'office_app_overrides.json',
  'office-swatch-set-usage.yaml',
  'office-templates.yaml',
  'flex-research.yaml',
]) {
  record(path.join(research, name));
}
record(fileURLToPath(import.meta.url));
record(path.join(design, 'src', 'tokens', 'mappings', 'upstream-pin.json'));

// Normalize only literal representation, never resolve system colors or discard transparent RGB.
function normalized(value) {
  if (value === null || value === undefined) return null;
  if (value === 'transparent') return '#00000000';
  if (/^#[0-9a-f]{6}$/i.test(value)) return `${value.toLowerCase()}ff`;
  if (/^#[0-9a-f]{8}$/i.test(value)) return value.toLowerCase();
  if (value.startsWith('PlatformColor(') && value.endsWith(')')) return `system:${value.slice(14, -1)}`;
  if (/^[A-Za-z]+$/.test(value)) return `system:${value}`;
  throw new Error(`Unsupported color syntax: ${value}`);
}
assert.equal(normalized('#FFFFFF'), normalized('#ffffffff'));
assert.equal(normalized('Window'), normalized('PlatformColor(Window)'));
assert.notEqual(normalized('#24242400'), normalized('#00000000'));

function equalStates(states) {
  const seen = new Map();
  const result = {};
  for (const [state, value] of Object.entries(states)) {
    if (value === null) continue;
    const key = normalized(value);
    if (seen.has(key)) result[state] = seen.get(key);
    else seen.set(key, state);
  }
  return result;
}

function css(file) {
  record(file);
  const values = {};
  for (const line of read(file).split('\n')) {
    const match = /^\s*(--gnrc-[a-z0-9-]+):\s*([^;]+);/.exec(line);
    if (match) {
      assert.equal(values[match[1]], undefined, `Duplicate CSS variable ${match[1]}`);
      values[match[1]] = match[2].trim();
    }
  }
  return values;
}
const camel = (value) => value.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const flex = {};
const flexTypeFile = path.join(design, 'src', 'flex', 'tokens.types.ts');
record(flexTypeFile);
const flexKeys = new Set([...read(flexTypeFile).matchAll(/^\s+(\w+): InteractiveColor;/gm)].map((match) => match[1]));
const unrepresented = new Set();
for (const tone of ['cool', 'warm']) {
  for (const scheme of ['light', 'dark']) {
    const directory = tone === 'cool' ? fixtures : path.join(fixtures, 'warm');
    const rest = css(path.join(directory, `semantic-${scheme}.css`));
    const states = css(path.join(directory, `interaction-fallback-${scheme}.css`));
    for (const [variable, value] of Object.entries(rest)) {
      if (!variable.startsWith('--gnrc-color-') && !variable.startsWith('--gnrc-material-')) continue;
      const token = camel(variable.slice(variable.startsWith('--gnrc-color-') ? '--gnrc-color-'.length : '--gnrc-'.length));
      if (!flexKeys.has(token)) {
        unrepresented.add(variable);
        continue;
      }
      flex[token] ??= { source_variable: variable, values: {} };
      flex[token].values[`${tone}.${scheme}`] = {
        rest: value,
        hover: states[`${variable}-hover`] ?? null,
        pressed: states[`${variable}-pressed`] ?? null,
      };
    }
  }
}
assert.deepEqual(Object.keys(flex).sort(), [...flexKeys].sort(), 'Every runtime color needs direct CSS evidence');
for (const entry of Object.values(flex)) {
  entry.equal_value_states = Object.fromEntries(Object.entries(entry.values).map(([context, states]) => [context, equalStates(states)]));
}

const candidate = (tokens, note) => ({
  status: tokens.length ? 'candidate_not_approved' : 'no_direct_equivalent',
  tokens,
  rationale: note,
});
const officeCandidates = {
  AccentDark: [
    ['strokeNeutralSoft', 'strokeNeutralLoud'],
    'Accent region border; not a brand fill. Weight depends on the region contract.',
  ],
  AccentEmphasis: [['strokeBrandLoud'], 'Emphasized accent border; do not merge with action fills by equal values.'],
  AccentLight: [['strokeNeutralSubtle'], 'Quiet region border.'],
  AccentOutline: [['strokeNeutralHeavy'], 'Outline around accent rectangles; distinguish focus outlines.'],
  Bkg: [
    ['surfaceNeutralNear', 'surfaceNeutralFar', 'surfaceNeutralNearer', 'backgroundNeutralTransparent', 'backgroundNeutralSoft'],
    'Rest is the region surface; hover/pressed are final transparent-control fills, selected is a separate presentation. Not one interchangeable Flex token.',
  ],
  BkgAccentTint: [
    ['backgroundBrandSubtle', 'backgroundBrandSoft'],
    'Tinted region paired with TextAccentTint; surface composition must be specified.',
  ],
  BkgBadge: [
    [],
    'Office notification badge is not semantically danger merely because its fill is red; requires a notification presentation.',
  ],
  BkgCtl: [['backgroundNeutralSubtle'], 'Standard push-button fill; secondary-button candidate from Flex usage.'],
  BkgCtlEmphasis: [['backgroundBrandHeavy'], 'Emphasis push-button fill; primary-button candidate from Flex usage.'],
  BkgCtlSubtle: [
    ['backgroundNeutralTransparent'],
    'Checkbox/radio family, not a subtle push button. Checked/unchecked and background ownership require component evidence.',
  ],
  BkgHeader: [['surfaceNeutralFar', 'backgroundNeutralSubtle'], 'Group header plane, not a generic button shader.'],
  BkgStripe: [[], 'Striped pseudo-disabled treatment needs pattern and stroke behavior, not just a scalar color.'],
  BkgSubtle: [[], 'Scrollbar gutter, not a generic subtle background; current Flex usage does not establish a gutter token.'],
  BkgTextBox: [['backgroundNeutralTransparent'], 'Input background candidate; Office supplies region-dependent opaque fills.'],
  BkgToggleSwitchOff: [['backgroundNeutralTransparent'], 'Unchecked switch track candidate.'],
  BkgToggleSwitchOn: [['backgroundNeutralHeavy'], 'Checked Flex switch is neutral-heavy, while Office may use application branding.'],
  GlyphAsButtonSubtle: [['foregroundNeutralTertiary'], 'Scrollbar glyph/mark candidate; glyph-button semantics differ from a thumb.'],
  SliderBuffer: [[], 'Buffered slider region is not specified by the current Flex role inventory.'],
  SliderKeyboard: [['strokeFocusOuter'], 'Slider-specific outer keyboard focus.'],
  SliderPrimary: [
    ['backgroundBrandHeavy', 'backgroundNeutralHeavy', 'foregroundBrandPrimary'],
    'Slider style controls part ownership; no fixed thumb/track identity in Office usage.',
  ],
  SliderSecondary: [['backgroundNeutralSoft', 'strokeNeutralSubtle'], 'Secondary slider part needs style-specific pairing.'],
  SliderToolTipBkg: [['surfaceNeutralNearer'], 'Tooltip surface; retain slider-specific identity.'],
  SliderToolTipBorder: [['strokeNeutralSubtle'], 'Tooltip border candidate.'],
  SliderToolTipLabel: [['foregroundNeutralPrimary'], 'Tooltip foreground candidate.'],
  StrokeBadge: [[], 'Notification badge outline requires a notification presentation, not an assumed danger status.'],
  StrokeCtl: [['strokeNeutralSubtle', 'strokeNeutralSoft'], 'Standard button border; disabled and keyboard focus are independent roles.'],
  StrokeCtlEmphasis: [
    ['strokeBrandLoud', 'strokeBrandOnloud'],
    'Emphasis-button outline absent from some Flex primary presentations; do not infer from fill.',
  ],
  StrokeCtlSubtle: [['strokeNeutralSoft', 'strokeBrandLoud'], 'Checkbox/radio outline, separate from generic subtle buttons.'],
  StrokeKeyboard: [['strokeFocusOuter', 'strokeFocusInner'], 'Focus pair; selected and inverse contexts cannot be collapsed.'],
  StrokeOnly: [['strokeNeutralSoft'], 'Color-picker border-only control; synthetic absent rest is not a source alias.'],
  StrokeOver: [
    ['strokeNeutralTransparent'],
    'All three supplied states are transparent, including HC. Preserve the separate source identity.',
  ],
  StrokeOverSelected: [['strokeNeutralSoft', 'strokeBrandLoud'], 'Selected transparent-control outline has its own interactive triplet.'],
  StrokeOverSubtle: [[], 'Scrollbar hover frame has no confirmed Flex equivalent.'],
  StrokeSelected: [[], 'Additional selected-hover outline has no single generic Flex role.'],
  StrokeStripe: [[], 'Striped-control border requires geometry/pattern semantics.'],
  StrokeStripeOuter: [[], 'Outer striped-control outline requires geometry/pattern semantics.'],
  StrokeTextBox: [['strokeNeutralSoft', 'strokeNeutralSubtle'], 'Text-entry outline; focused stroke is a separate brand/focus binding.'],
  StrokeToggleSwitchOff: [
    ['foregroundNeutralSecondary', 'strokeNeutralSoft'],
    'Flex switch uses a foreground token as an outline; preserve cross-role usage.',
  ],
  StrokeToggleSwitchOn: [
    ['strokeNeutralHeavy', 'strokeBrandLoud'],
    'Checked track outline must follow the chosen neutral/brand presentation.',
  ],
  Text: [
    ['foregroundNeutralPrimary'],
    'Static Text and interactive TextRest are distinct even when equal. SelectionHighlight is selected text, not selected controls.',
  ],
  TextAccentTint: [['foregroundBrandPrimary', 'foregroundNeutralPrimary'], 'Pair with the tinted region, not independently by color.'],
  TextActive: [['foregroundNeutralPrimary', 'foregroundBrandPrimary'], 'Text-only controls retain the region background in every state.'],
  TextBadge: [['foregroundNeutralOnloud'], 'Notification foreground candidate requires the corresponding notification fill.'],
  TextCtl: [['foregroundNeutralPrimary'], 'Standard button content.'],
  TextCtlEmphasis: [['foregroundBrandOnloud', 'foregroundNeutralOnloud'], 'Primary-button content; web and mobile Flex usage differ.'],
  TextCtlSubtle: [
    ['foregroundBrandOnloud', 'foregroundBrandPrimary', 'foregroundNeutralPrimary'],
    'Checkbox/radio content needs checked/unchecked and mark/label separation.',
  ],
  TextEmphasis: [['foregroundBrandPrimary'], 'Static emphasis and transparent-control emphasis are independent bindings.'],
  TextEmphasis2: [[], 'Office declares no distinct meaning from TextEmphasis; owner decision required.'],
  TextError: [['foregroundDangerPrimary'], 'Error foreground; keep actual Office authored states.'],
  TextHeader: [
    ['foregroundNeutralPrimary', 'foregroundNeutralSecondary'],
    'Group header foreground; semantic prominence needs confirmation.',
  ],
  TextHyperlink: [['foregroundBrandPrimary'], 'Link on a resting parent; not interchangeable with brand content on other parents.'],
  TextHyperlinkParentHovered: [['foregroundBrandPrimary'], 'Link on hovered parent; preserves parent state as a separate axis.'],
  TextHyperlinkParentSelected: [['foregroundBrandPrimary'], 'Link on selected parent; preserves parent state as a separate axis.'],
  TextSecondary: [['foregroundNeutralSecondary'], 'Static and interactive secondary foregrounds are separate identities.'],
  TextStripe: [[], 'Pseudo-disabled striped-control text is not ordinary disabled text.'],
  TextTextBox: [['foregroundNeutralPrimary'], 'Text-entry content; placeholder, link, and text selection require separate roles.'],
  ThumbToggleSwitchOff: [
    ['foregroundNeutralSecondary', 'foregroundNeutralPrimary'],
    'Unchecked thumb candidate; validate the track/thumb pair.',
  ],
  ThumbToggleSwitchOn: [['foregroundNeutralOnloud'], 'Checked thumb candidate; disabled may remain visible.'],
};
assert.deepEqual(Object.keys(officeCandidates).sort(), Object.keys(templates.colors).sort());
function validateCandidates(value) {
  for (const token of value.tokens) assert(flexKeys.has(token), `Unknown candidate ${token}`);
  return value;
}

const contexts = {};
const effective = {};
const fieldOrigins = {};
for (const theme of Object.keys(office)) {
  for (const app of ['Mso', ...Object.keys(overrides)]) {
    for (const region of Object.keys(office[theme]).filter((name) => name !== 'Shared')) {
      const id = `${app}.${theme}.${region}`;
      const appData = overrides[app]?.[theme] ?? {};
      const layers = [
        ['base.Shared', office[theme].Shared],
        [`base.${region}`, office[theme][region]],
        ['app.Shared', appData.Shared ?? {}],
        [`app.${region}`, appData[region] ?? {}],
      ];
      const values = {};
      const origins = {};
      for (const [layer, fields] of layers) {
        for (const [field, value] of Object.entries(fields)) {
          assert(usage.fields[field], `Undocumented field ${field}`);
          normalized(value);
          values[field] = value;
          origins[field] = layer;
        }
      }
      assert.deepEqual(Object.keys(values).sort(), Object.keys(usage.fields).sort(), `Incomplete ${id}`);
      contexts[id] = { app, theme, region, application_overrides: Object.keys(appData).length ? 'present' : 'none_in_snapshot' };
      effective[id] = values;
      fieldOrigins[id] = origins;
    }
  }
}

function bucketRows(rows) {
  const buckets = new Map();
  for (const [context, values] of Object.entries(rows)) {
    const key = JSON.stringify(values);
    if (!buckets.has(key)) buckets.set(key, { contexts: [], values });
    buckets.get(key).contexts.push(context);
  }
  return [...buckets.values()];
}
const officeEntries = {};
const covered = [];
for (const [name, fields] of Object.entries(templates.colors)) {
  const states = Object.keys(fields);
  const sourceFields = Object.values(fields).filter((field) => field !== 'transparent');
  covered.push(...sourceFields);
  const values = Object.fromEntries(
    Object.entries(effective).map(([context, palette]) => [
      context,
      states.map((state) => (fields[state] === 'transparent' ? '#00000000' : palette[fields[state]])),
    ]),
  );
  const origins = Object.fromEntries(
    Object.entries(fieldOrigins).map(([context, palette]) => [
      context,
      states.map((state) => (fields[state] === 'transparent' ? 'template.synthetic_absent_rest' : palette[fields[state]])),
    ]),
  );
  officeEntries[name] = {
    source_fields: fields,
    control_families: unique(sourceFields.map((field) => usage.fields[field].control_family)),
    declared_aliases: Object.fromEntries(
      sourceFields.filter((field) => usage.fields[field].aliases).map((field) => [field, usage.fields[field].aliases]),
    ),
    flex: validateCandidates(candidate(...officeCandidates[name])),
    state_order: states,
    state_specificity: Object.fromEntries(
      states
        .filter((state) => !['rest', 'hover', 'pressed'].includes(state))
        .map((state) => [
          state,
          {
            status: 'separate_binding_required',
            note: 'Family candidates do not approve this column. Resolve source usage and consumer ownership separately; no generic token equivalence is asserted.',
          },
        ]),
    ),
    value_sets: bucketRows(values),
    origin_sets: bucketRows(origins),
    equal_value_state_sets: bucketRows(
      Object.fromEntries(
        Object.entries(values).map(([context, row]) => [
          context,
          equalStates(Object.fromEntries(states.map((state, index) => [state, row[index]]))),
        ]),
      ),
    ),
  };
}
const deprecated = {};
for (const [field, metadata] of Object.entries(usage.fields)) {
  if (!metadata.deprecated) continue;
  covered.push(field);
  deprecated[field] = {
    ...metadata,
    flex: candidate([], 'Retained for coverage only; deprecated fields must not seed new mappings.'),
    value_sets: bucketRows(Object.fromEntries(Object.entries(effective).map(([context, palette]) => [context, palette[field]]))),
  };
}
assert.equal(covered.length, 181);
assert.equal(unique(covered).length, covered.length, 'Duplicate Office field coverage');

function fluentCandidate(name) {
  const direct = {
    brandBackground: ['backgroundBrandHeavy', 'backgroundBrandLoud'],
    brandBackground2: ['backgroundBrandSoft', 'backgroundBrandSubtle'],
    brandBackgroundStatic: [],
    brandForeground1: ['foregroundBrandPrimary'],
    brandForeground2: ['foregroundBrandPrimary'],
    brandForegroundLink: ['foregroundBrandPrimary'],
    brandStroke1: ['strokeBrandLoud'],
    brandStroke2: ['strokeBrandSoft', 'strokeBrandSubtle'],
    compoundBrandBackground1: ['backgroundBrandHeavy'],
    compoundBrandForeground1: ['foregroundBrandPrimary'],
    compoundBrandStroke1: ['strokeBrandLoud'],
    neutralBackground1: ['surfaceNeutralNearer', 'backgroundNeutralSubtle'],
    neutralBackground2: ['surfaceNeutralNear'],
    neutralBackground3: ['surfaceNeutralFar'],
    neutralBackground4: ['surfaceNeutralFar', 'surfaceNeutralFarther'],
    neutralBackground5: ['surfaceNeutralFarther'],
    neutralBackground6: ['surfaceNeutralFarther'],
    neutralBackgroundDisabled: ['backgroundNeutralDisabled', 'backgroundNeutralSubtleDisabled'],
    neutralBackgroundInverted: ['backgroundNeutralHeavy'],
    neutralForeground1: ['foregroundNeutralPrimary'],
    neutralForeground2: ['foregroundNeutralSecondary'],
    neutralForeground3: ['foregroundNeutralTertiary'],
    neutralForeground4: ['foregroundNeutralTertiary'],
    neutralForegroundDisabled: ['foregroundNeutralDisabled'],
    neutralForegroundInverted: ['foregroundNeutralOnloud'],
    neutralForegroundInvertedLink: [],
    neutralForegroundOnBrand: ['foregroundBrandOnloud', 'foregroundNeutralOnloud'],
    neutralStencil1: ['backgroundNeutralSubtle'],
    neutralStencil2: ['backgroundNeutralSoft'],
    neutralStroke1: ['strokeNeutralSubtle'],
    neutralStroke2: ['strokeNeutralSubtle'],
    neutralStroke3: ['strokeNeutralSubtle'],
    neutralStrokeAccessible: ['strokeNeutralSoft'],
    neutralStrokeDisabled: ['strokeNeutralDisabled'],
    strokeFocus1: ['strokeFocusInner'],
    strokeFocus2: ['strokeFocusOuter'],
    subtleBackground: ['backgroundNeutralTransparent'],
    transparentBackground: ['backgroundNeutralTransparent', 'backgroundBrandTransparent'],
    transparentStroke: ['strokeNeutralTransparent'],
  };
  if (Object.hasOwn(direct, name)) {
    const special = {
      brandBackgroundStatic: 'Fixed-brand semantics cannot be merged with appearance-dependent brand backgrounds.',
      neutralForegroundInvertedLink: 'Inverted parent and link interaction need a separate presentation.',
      transparentBackground: 'Always transparent states differ from interactive transparent Flex shaders.',
      subtleBackground: 'Transparent rest plus opaque interaction fills; not equivalent to an alpha shader without a backdrop.',
    };
    return candidate(
      direct[name],
      special[name] ?? 'Semantic-name and role candidate only; state vectors and component usage must decide specificity.',
    );
  }
  const status = /^(danger|success|warning)(Background|Foreground|Border)(1|2|3|Active|Inverted)$/.exec(name);
  if (status) {
    const [, family, role, level] = status;
    const cap = family[0].toUpperCase() + family.slice(1);
    if (level === 'Inverted')
      return candidate([], 'Inverted status foreground is a separate context absent from the current generic status roles.');
    const token =
      role === 'Background'
        ? `background${cap}${{ 1: 'Subtle', 2: 'Soft', 3: 'Loud' }[level]}`
        : role === 'Foreground'
          ? `foreground${cap}Primary`
          : `stroke${cap}${level === '1' ? 'Subtle' : 'Loud'}`;
    return candidate(
      [token],
      'Status role candidate; numbered foregrounds and active borders remain distinct until usage proves equivalence.',
    );
  }
  assert(name.startsWith('severe') || name.startsWith('outofoffice'), `Unclassified Fluent alias ${name}`);
  return candidate([], 'No matching Flex semantic family; do not substitute a similarly colored expression token or another status.');
}
const fluent = {};
const ignoredFluent = {};
for (const appearance of ['colorful', 'black', 'darkgray', 'hc']) {
  const file = path.join(win32Root, appearance, 'tokens-aliases.json');
  record(file, `${win32Package.name}@${win32Package.version}/${appearance}/tokens-aliases.json`);
  const data = json(file);
  ignoredFluent[appearance] = [];
  for (const [name, states] of Object.entries(data)) {
    if (states.rest === undefined) {
      assert(
        Object.keys(states).every((key) => key.startsWith('font')),
        `Unexpected noncolor entry ${name}`,
      );
      ignoredFluent[appearance].push(name);
      continue;
    }
    for (const value of Object.values(states)) normalized(value);
    fluent[name] ??= { flex: validateCandidates(fluentCandidate(name)), values: {}, equal_value_states: {} };
    fluent[name].values[appearance] = states;
    fluent[name].equal_value_states[appearance] = equalStates(states);
  }
}
for (const entry of Object.values(fluent)) assert.equal(Object.keys(entry.values).length, 4);

function exactClasses(entries, getVector) {
  const byValue = new Map();
  for (const name of Object.keys(entries)) {
    const key = JSON.stringify(getVector(name));
    if (!byValue.has(key)) byValue.set(key, []);
    byValue.get(key).push(name);
  }
  return [...byValue.values()].filter((names) => names.length > 1);
}
const officeEquality = exactClasses(usage.fields, (field) => Object.values(effective).map((palette) => normalized(palette[field])));
const fluentEquality = exactClasses(fluent, (name) =>
  Object.values(fluent[name].values).map((states) =>
    Object.entries(states)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([state, value]) => [state, normalized(value)]),
  ),
);

const pairings = [
  {
    id: 'primary-button-versus-checkbox',
    flex_pair: ['backgroundBrandHeavy', 'foregroundBrandOnloud'],
    flex_users: ['button.primary', 'checkbox.checked', 'checkbox.indeterminate'],
    office_pairs: [
      ['BkgCtlEmphasis', 'TextCtlEmphasis'],
      ['BkgCtlSubtle', 'TextCtlSubtle'],
    ],
    gate: 'Checkbox selected/mark ownership is provisional; Office CtlSubtle is not a generic subtle button.',
  },
  {
    id: 'secondary-button-versus-surface',
    flex_pair: ['backgroundNeutralSubtle', 'foregroundNeutralPrimary'],
    flex_users: ['button.secondary', 'tag.secondary', 'messageBar.information'],
    office_pairs: [
      ['BkgCtl', 'TextCtl'],
      ['BkgHeader', 'TextHeader'],
    ],
    gate: 'Group-header analogy is provisional; static and interactive consumers cannot share all states automatically.',
  },
  {
    id: 'transparent-button-versus-input',
    flex_pair: ['backgroundNeutralTransparent', 'foregroundNeutralPrimary'],
    flex_users: ['button.outline', 'button.subtle', 'input'],
    office_pairs: [
      ['Bkg', 'Text'],
      ['BkgTextBox', 'TextTextBox'],
    ],
    gate: 'Bkg is the exposed region at rest, not an authored transparent shader. Evaluate final composited colors.',
  },
  {
    id: 'checked-switch-versus-selected-control',
    flex_pair: ['backgroundNeutralHeavy', 'foregroundNeutralOnloud'],
    flex_users: ['switch.checked', 'tab.selected', 'toggleButton.secondary.selected'],
    office_pairs: [['BkgToggleSwitchOn', 'ThumbToggleSwitchOn']],
    gate: 'Only the switch has an established Office pair; tab/toggle selections need component-specific usage evidence.',
  },
  {
    id: 'brand-foreground-parent-context',
    flex_pair: ['backgroundNeutralTransparent', 'foregroundBrandPrimary'],
    flex_users: ['radio.selected'],
    office_pairs: [
      ['Bkg', 'TextHyperlink'],
      ['Bkg', 'TextHyperlinkParentHovered'],
      ['Bkg', 'TextHyperlinkParentSelected'],
    ],
    parent_background_states: ['rest', 'hover', 'selected'],
    gate: 'Office parent-context probe, NOT evidence that Flex link uses this pair. The parent stays in its own rest/hover/selected state through the child interaction.',
  },
];
for (const pairing of pairings) {
  pairing.flex_usage_evidence = flexUsage.colorMaps.bgToFg[pairing.flex_pair[0]]?.[pairing.flex_pair[1]] ?? null;
  pairing.witnesses = [];
  pairing.contexts_with_different_vectors = 0;
  pairing.contexts_with_different_authored_rest_pairs = 0;
  pairing.comparison_status = pairing.office_pairs.length > 1 ? 'provisional_comparison' : 'insufficient_pairs';
  for (const [context, palette] of Object.entries(effective)) {
    const rows = pairing.office_pairs.map(([background, foreground], index) => {
      const colors = [background, foreground].map((name) => templates.colors[name]);
      return colors.map((fields, role) =>
        ['rest', 'hover', 'pressed'].map((state) => {
          const sourceState = role === 0 && pairing.parent_background_states ? pairing.parent_background_states[index] : state;
          return fields[sourceState] ? (palette[fields[sourceState]] ?? null) : null;
        }),
      );
    });
    const restPairs = rows.map((row) => row.map((states) => states[0]));
    if (
      restPairs.every((pair) => pair.every((value) => value !== null)) &&
      new Set(restPairs.map((pair) => JSON.stringify(pair))).size > 1
    ) {
      pairing.contexts_with_different_authored_rest_pairs++;
    }
    if (new Set(rows.map((row) => JSON.stringify(row))).size > 1) {
      pairing.contexts_with_different_vectors++;
      if (pairing.witnesses.length < 3) pairing.witnesses.push({ context, vectors_bg_fg_rest_hover_pressed: rows });
    }
  }
}
const scalarCollisions = {};
for (const [name, entry] of Object.entries(officeEntries)) {
  for (const token of entry.flex.tokens) (scalarCollisions[token] ??= []).push(name);
}
for (const token of Object.keys(scalarCollisions)) if (scalarCollisions[token].length < 2) delete scalarCollisions[token];

const officeTypeFile = path.join(design, 'src', 'fluent', 'types', 'palette.types.ts');
record(officeTypeFile);
const officeInterface = read(officeTypeFile).split('export interface OfficePalette {')[1].split('\n}')[0];
const officeTypeFields = [...officeInterface.matchAll(/^  (\w+): ColorValue;/gm)].map((match) => match[1]);
const missingOfficeFields = Object.keys(usage.fields).filter((field) => !officeTypeFields.includes(field));
const summary = {
  office_contexts: Object.keys(contexts).length,
  office_fields_per_context: Object.keys(usage.fields).length,
  office_effective_values: Object.keys(contexts).length * Object.keys(usage.fields).length,
  office_color_groups: Object.keys(officeEntries).length,
  office_groups_with_hover_or_pressed: Object.values(officeEntries).filter((entry) =>
    entry.state_order.some((state) => state === 'hover' || state === 'pressed'),
  ).length,
  office_deprecated_fields: Object.keys(deprecated).length,
  office_declared_aliases: Object.values(usage.fields).flatMap((field) => field.aliases ?? []).length,
  office_public_type_fields: officeTypeFields.length,
  office_fields_absent_from_public_type: missingOfficeFields.length,
  office_nondeprecated_fields_absent_from_public_type: missingOfficeFields.filter((field) => !usage.fields[field].deprecated).length,
  office_no_direct_equivalent_groups: Object.entries(officeEntries)
    .filter(([, entry]) => !entry.flex.tokens.length)
    .map(([name]) => name),
  office_equal_value_classes_across_all_contexts: officeEquality.length,
  fluent_color_groups: Object.keys(fluent).length,
  fluent_appearances: 4,
  fluent_authored_state_values: Object.values(fluent).reduce(
    (sum, entry) => sum + Object.values(entry.values).reduce((n, states) => n + Object.keys(states).length, 0),
    0,
  ),
  fluent_no_direct_equivalent_groups: Object.entries(fluent)
    .filter(([, entry]) => !entry.flex.tokens.length)
    .map(([name]) => name),
  flex_color_groups: Object.keys(flex).length,
  flex_contexts: 4,
  flex_absent_interaction_state_values: Object.values(flex).reduce(
    (sum, entry) => sum + Object.values(entry.values).reduce((n, states) => n + Object.values(states).filter((v) => v === null).length, 0),
    0,
  ),
  flex_unrepresented_color_variables: [...unrepresented],
};
const common = {
  schema_version: 1,
  analysis_date: '2026-11-01',
  authority: 'Research evidence and provisional candidates, NOT production mappings.',
  equality: 'Equal literal values are observations, not semantic aliases. Missing states are not synthesized.',
};
function write(name, data) {
  const document = new YAML.Document(data);
  function flow(node) {
    if (YAML.isSeq(node) && node.items.every((item) => YAML.isScalar(item))) node.flow = true;
    if (YAML.isMap(node)) for (const pair of node.items) flow(pair.value);
    if (YAML.isSeq(node)) for (const item of node.items) flow(item);
  }
  flow(document.contents);
  const text = document.toString({ lineWidth: 140 });
  assert.deepEqual(YAML.parse(text), data, `YAML round trip: ${name}`);
  const filename = path.join(output, name);
  if (process.argv.includes('--check')) assert.deepEqual(yaml(filename), data, `Stale catalog: ${name}`);
  else fs.writeFileSync(filename, text);
}
write('office-color-values.yaml', {
  ...common,
  sources: ['../office_colors.json', '../office_app_overrides.json', '../office-swatch-set-usage.yaml', '../office-templates.yaml'],
  resolution_order: ['base.Shared', 'base.region', 'app.Shared', 'app.region'],
  resolution_status: 'Inferred from disjoint sparse snapshot layers; host composition order still requires runtime qualification.',
  context_note: 'Shared is a partial layer, not a fourth region. App HC values inherit Mso because no HC app overrides were supplied.',
  contexts,
  colors: officeEntries,
  deprecated_fields: deprecated,
});
write('fluent2-win32-color-values.yaml', {
  ...common,
  source_package: `${win32Package.name}@${win32Package.version}`,
  source_files: '{colorful,black,darkgray,hc}/tokens-aliases.json',
  state_policy: 'Retain authored state names including selected and brandHover/brandPressed/brandSelected. Absence is NOT a rest alias.',
  declared_aliases: 'Not encoded in the resolved package JSON; equal values do not prove source references.',
  omitted_noncolor_entries: ignoredFluent,
  colors: fluent,
});
write('flex-color-values.yaml', {
  ...common,
  source_commit: pin.commit,
  source_note: 'Direct CSS variable spelling to SemanticColors key; no cross-system mapping or coverage ledger used.',
  missing_state_policy: 'null means no literal in the pinned interaction-fallback file, not a computed or rest value.',
  usage_version_note:
    'flex-research.yaml uses component release flex-1.5.0-206c4996 / 334d3b82, not the token pin. Reconcile before promotion.',
  colors: flex,
});
write('specificity-analysis.yaml', {
  ...common,
  summary,
  source_manifest: manifest,
  forbidden_baselines_not_read: [
    'src/tokens/mappings/flex-token-map.yaml',
    'src/tokens/mappings/flex-from-theme.json',
    'src/tokens/mappings/theme-from-flex.json',
    'src/flex/adapters/fluentFallbackTokens.ts',
    'src/themes/fluent/legacyPalette.ts',
    'scripts/token-mappings/__fixtures__/x3/mappings.json',
    'scripts/flex-defaults/coverage.generated.json',
  ],
  office_observational_equal_value_classes: officeEquality,
  office_fields_absent_from_public_type: missingOfficeFields,
  fluent_observational_equal_full_state_classes: fluentEquality,
  scalar_candidate_collisions: scalarCollisions,
  pairing_specificity_probes: pairings,
  limits: [
    'No nearest-color ranking: numeric proximity cannot establish role equivalence.',
    'Pair probes are hypotheses supported by usage; a difference is a specificity witness, not an approved component binding.',
    'Alpha values preserve RGB and alpha. No backdrop-independent contrast or perceptual distance is claimed.',
    'High contrast is symbolic only; no OS palette, live Office host, native renderer or accessibility result is claimed.',
    'JSON has no declared cross-field alias graph. Office alias metadata supplies three alternate field names only.',
    'All 181 fields are cataloged, including 14 deprecated fields quarantined from new mappings.',
  ],
});
console.log(JSON.stringify({ result: process.argv.includes('--check') ? 'catalogs verified' : 'catalogs generated', ...summary }, null, 2));
