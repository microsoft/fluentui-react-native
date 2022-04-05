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

  console.log('Generating light mode tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-light.json --out ./packages/theming/theme-tokens/src/generated/light --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/light/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/light/tokens-controls.json'));

  console.log('Generating dark mode tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-dark.json --out ./packages/theming/theme-tokens/src/generated/dark --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/dark/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/dark/tokens-controls.json'));

  console.log('Running prettier...');
  child_process.execSync('prettier --write ./packages/theming/theme-tokens/src/generated');
  child_process.execSync('prettier --write ./packages/theming/apple-theme/src/generated');
  child_process.execSync('prettier --write ./packages/theming/android-theme/src/generated');
  child_process.execSync('prettier --write ./packages/theming/win32-theme/src/generated');

  console.log('Done!');
}

run().catch((ex) => {
  console.error('Caught error:');
  console.error(ex);
  process.exit(1);
});
