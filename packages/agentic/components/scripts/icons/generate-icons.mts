import { GeneratedFile, makeComment } from '@fluentui-react-native/scripts';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateIconModule, resolveSvgIconsDir } from './codegen/index.ts';
import { iconManifest } from './icon-manifest.mts';

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const file = new GeneratedFile(join(packageRoot, 'src', 'common', 'icons', 'fluentIcons.generated.tsx'));
file.header = makeComment([
  'WARNING: This file is auto-generated. Do not edit it manually.',
  'Fluent icon components generated from @fluentui/svg-icons by scripts/icons/generate-icons.mts.',
  'To add or change an icon, edit scripts/icons/icon-manifest.mts and run `yarn gen:icons`.',
]);
file.add(generateIconModule(iconManifest, { quote: "'", svgDir: resolveSvgIconsDir(packageRoot), utilPath: './fluentSvg' }));

const displayPath = relative(packageRoot, file.path).replaceAll('\\', '/');
if (process.argv.includes('--check')) {
  if (!file.isCurrent()) {
    console.error(`${displayPath} is out of date. Run \`yarn gen:icons\` in packages/agentic/components and commit the result.`);
    process.exitCode = 1;
  }
} else {
  console.log(file.commit() ? `Wrote ${displayPath}` : `${displayPath} is up to date`);
}
