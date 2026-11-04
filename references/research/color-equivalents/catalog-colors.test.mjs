import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..', '..');
const require = createRequire(path.join(root, 'packages', 'agentic', 'design', 'package.json'));
const YAML = require('yaml');
const read = (file) => fs.readFileSync(file, 'utf8');
const load = (name) => YAML.parse(read(path.join(here, name)));
const office = load('office-color-values.yaml');
const fluent = load('fluent2-win32-color-values.yaml');
const flex = load('flex-color-values.yaml');
const analysis = load('specificity-analysis.yaml');
const usage = YAML.parse(read(path.join(here, '..', 'office-swatch-set-usage.yaml')));
const base = JSON.parse(read(path.join(here, '..', 'office_colors.json')));
const apps = JSON.parse(read(path.join(here, '..', 'office_app_overrides.json')));

function row(entry, context, kind = 'value_sets') {
  const rows = entry[kind].filter((value) => value.contexts.includes(context));
  assert.equal(rows.length, 1, `${kind}: ${context} must appear exactly once`);
  return rows[0].values;
}

test('every context reconstructs all Office fields from the original sparse inputs exactly once', () => {
  for (const [id, context] of Object.entries(office.contexts)) {
    const observed = {};
    for (const entry of Object.values(office.colors)) {
      const values = row(entry, id);
      assert.equal(values.length, entry.state_order.length);
      entry.state_order.forEach((state, index) => {
        const field = entry.source_fields[state];
        if (field === 'transparent') return;
        assert(!Object.hasOwn(observed, field), `Duplicate field ${field}`);
        observed[field] = values[index];
      });
    }
    for (const [field, entry] of Object.entries(office.deprecated_fields)) {
      assert(!Object.hasOwn(observed, field));
      observed[field] = row(entry, id);
    }
    const app = apps[context.app]?.[context.theme];
    assert.deepEqual(observed, {
      ...base[context.theme].Shared,
      ...base[context.theme][context.region],
      ...app?.Shared,
      ...app?.[context.region],
    });
  }
});

test('application and region overrides keep their provenance and high contrast remains symbolic', () => {
  const brand = office.colors.BkgCtlEmphasis;
  const word = 'Word.Colorful.TaskPaneCard';
  assert.equal(row(brand, word)[0], apps.Word.Colorful.Shared.BkgCtlEmphasis);
  assert.equal(row(brand, word, 'origin_sets')[0], 'app.Shared');
  const control = office.colors.BkgCtl;
  assert.equal(row(control, word)[0], base.Colorful.TaskPaneCard.BkgCtl);
  assert.equal(row(control, word, 'origin_sets')[0], 'base.TaskPaneCard');
  assert.equal(row(brand, 'Word.HighContrast.TaskPaneCard')[0], 'ButtonFace');
  assert.equal(office.contexts['Word.HighContrast.TaskPaneCard'].application_overrides, 'none_in_snapshot');
});

test('static, interactive and text-selection identities are not deduplicated by matching hex values', () => {
  const text = office.colors.Text;
  const hc = row(text, 'Mso.HighContrast.TaskPane');
  assert.equal(hc[text.state_order.indexOf('static')], 'WindowText');
  assert.equal(hc[text.state_order.indexOf('rest')], 'ButtonText');
  assert.equal(text.source_fields.selectionHighlight, 'TextSelectionHighlight');
  for (const entry of Object.values(office.colors)) {
    for (const [field, aliases] of Object.entries(entry.declared_aliases)) {
      assert.deepEqual(aliases, usage.fields[field].aliases);
    }
  }
  assert.deepEqual(office.colors.TextCtl.declared_aliases, {});
});

test('synthetic absent borders are distinguished from authored transparent states', () => {
  const entry = office.colors.StrokeOnly;
  for (const context of Object.keys(office.contexts)) {
    assert.equal(row(entry, context)[0], '#00000000');
    assert.equal(row(entry, context, 'origin_sets')[0], 'template.synthetic_absent_rest');
  }
  assert.equal(office.colors.StrokeOver.source_fields.rest, 'StrokeOverRest');
});

test('Fluent groups preserve every raw state and do not invent missing interactions', () => {
  const packageRoot = path.dirname(require.resolve('@fluentui-react-native/design-tokens-win32/package.json'));
  for (const appearance of ['colorful', 'black', 'darkgray', 'hc']) {
    const input = JSON.parse(read(path.join(packageRoot, appearance, 'tokens-aliases.json')));
    const colors = Object.fromEntries(Object.entries(input).filter(([, value]) => Object.hasOwn(value, 'rest')));
    assert.deepEqual(Object.keys(fluent.colors).sort(), Object.keys(colors).sort());
    for (const [name, states] of Object.entries(colors)) assert.deepEqual(fluent.colors[name].values[appearance], states);
  }
  assert(!Object.hasOwn(fluent.colors.brandForeground1.values.colorful, 'hover'));
  assert(Object.hasOwn(fluent.colors.neutralForeground2.values.colorful, 'brandHover'));
  assert.equal(fluent.colors.brandBackground.values.hc.rest, 'PlatformColor(ButtonFace)');
});

test('Flex catalog preserves material colors, alpha channels and missing fallback states', () => {
  assert.equal(flex.colors.materialBackgroundThick.source_variable, '--gnrc-material-background-thick');
  assert.equal(flex.colors.backgroundNeutralTransparent.values['cool.light'].rest, '#24242400');
  assert.equal(flex.colors.fixedWhite.values['cool.light'].hover, null);
  assert.notEqual(flex.colors.backgroundNeutralTransparent.values['cool.light'].hover, null);
});

test('parent-state witnesses hold the parent fixed through child hover and press', () => {
  const probe = analysis.pairing_specificity_probes.find((value) => value.id === 'brand-foreground-parent-context');
  for (const witness of probe.witnesses) {
    for (const [background] of witness.vectors_bg_fg_rest_hover_pressed) {
      assert.equal(new Set(background).size, 1);
    }
  }
  const unsupported = analysis.pairing_specificity_probes.find((value) => value.id === 'checked-switch-versus-selected-control');
  assert.deepEqual(unsupported.witnesses, []);
});
