// @ts-check

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

async function run() {
  if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
    console.error('Please run this script from the root of the Git repo');
    process.exit(1);
  }

  if (
    !fs.existsSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input.json')) ||
    !fs.existsSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-light.json')) ||
    !fs.existsSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-dark.json'))
  ) {
    console.error('Token input file missing');
    process.exit(1);
  }

  console.log('Generating global tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --out ./packages/theming/theme-tokens/src/generated/global --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/global/tokens-aliases.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/global/tokens-controls.json'));

  console.log('Generating win32 global tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-brand.win32.json --out ./packages/theming/theme-tokens/src/generated/global-win32 --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/global-win32/tokens-aliases.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/global-win32/tokens-controls.json'));

  console.log('Generating macOS light mode global and alias  tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-global.macos.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-brand-light.macos.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-light.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-light.macos.json --out ./packages/theming/theme-tokens/src/generated/light-macos --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/light-macos/tokens-controls.json'));

  console.log('Generating macOS light high contrast mode global and alias tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-global.macos.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-brand-light.macos.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-light.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-light.macos.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-light-hc.macos.json --out ./packages/theming/theme-tokens/src/generated/light-high-contrast-macos --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/light-high-contrast-macos/tokens-controls.json'));

  console.log('Generating macOS dark mode global and alias tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-global.macos.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-brand-dark.macos.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-dark.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-dark.macos.json --out ./packages/theming/theme-tokens/src/generated/dark-macos --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/dark-macos/tokens-controls.json'));

  console.log('Generating macOS dark high contrast mode global and alias tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-global.macos.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-brand-dark.macos.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-dark.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-dark.macos.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-dark-hc.macos.json --out ./packages/theming/theme-tokens/src/generated/dark-high-contrast-macos --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/dark-high-contrast-macos/tokens-controls.json'));

  console.log('Generating android global tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-brand.android.json --out ./packages/theming/theme-tokens/src/generated/global-android --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/global-android/tokens-aliases.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/global-android/tokens-controls.json'));

  console.log('Generating light mode tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-light.json --out ./packages/theming/theme-tokens/src/generated/light --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/light/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/light/tokens-controls.json'));

  console.log('Generating android light mode tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-brand.win32.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-light.android.json --out ./packages/theming/theme-tokens/src/generated/light-android --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/light-android/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/light-android/tokens-controls.json'));

  console.log('Generating dark mode tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-dark.json --out ./packages/theming/theme-tokens/src/generated/dark --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/dark/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/dark/tokens-controls.json'));

  console.log('Generating colorful mode tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-brand.win32.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-light.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-colorful.json --out ./packages/theming/win32-theme/src/generated/colorful --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/win32-theme/src/generated/colorful/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/win32-theme/src/generated/colorful/tokens-controls.json'));

  console.log('Generating dark gray mode tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-brand.win32.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-darkgray.json --out ./packages/theming/win32-theme/src/generated/darkGray --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/win32-theme/src/generated/darkGray/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/win32-theme/src/generated/darkGray/tokens-controls.json'));

  console.log('Generating black mode tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-brand.win32.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-dark.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-black.json --out ./packages/theming/win32-theme/src/generated/black --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/win32-theme/src/generated/black/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/win32-theme/src/generated/black/tokens-controls.json'));

  console.log('Generating high contrast mode tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-highContrast.json --out ./packages/theming/theme-tokens/src/generated/highContrast --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/highContrast/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/highContrast/tokens-controls.json'));

  console.log('Generating win32 high contrast mode tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-highContrast.json --out ./packages/theming/win32-theme/src/generated/highContrast --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/win32-theme/src/generated/highContrast/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/win32-theme/src/generated/highContrast/tokens-controls.json'));

  console.log('Running prettier...');
  child_process.execSync('prettier --write ./packages/theming/theme-tokens/src/generated');
  child_process.execSync('prettier --write ./packages/theming/win32-theme/src/generated');

  console.log('Done!');
}

run().catch((ex) => {
  console.error('Caught error:');
  console.error(ex);
  process.exit(1);
});
