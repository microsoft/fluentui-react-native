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
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --out ./packages/theming/theme-tokens/src/global --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/global/reactnative/tokens-aliases.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/global/reactnative/tokens-controls.json'));

  console.log('Generating light mode tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-light.json --out ./packages/theming/theme-tokens/src/light --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/light/reactnative/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/light/reactnative/tokens-controls.json'));

  console.log('Generating dark mode tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-dark.json --out ./packages/theming/theme-tokens/src/dark --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/dark/reactnative/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/dark/reactnative/tokens-controls.json'));

  console.log('Generating high contrast mode tokens...');
  child_process.execSync(
    'yarn transform-tokens --in ./packages/theming/theme-tokens/src/pipeline-input/token-input.json --in ./packages/theming/theme-tokens/src/pipeline-input/token-input-highContrast.json --out ./packages/theming/theme-tokens/src/highContrast --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/highContrast/reactnative/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/highContrast/reactnative/tokens-controls.json'));
  console.log('Done!');
}

run().catch((ex) => {
  console.error('Caught error:');
  console.error(ex);
  process.exit(1);
});
