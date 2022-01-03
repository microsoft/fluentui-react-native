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
  let input = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input.json');
  let output = path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/global');
  child_process.execSync('yarn transform-tokens --in ' + input + ' --out ' + output + ' --p reactnative');
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/global/reactnative/tokens-aliases.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/global/reactnative/tokens-controls.json'));

  console.log('Generating win32 global tokens...');
  input = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input.json');
  let input2 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-brand.win32.json');
  output = path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/global-win32');
  child_process.execSync('yarn transform-tokens --in ' + input + ' --in ' + input2 + ' --out ' + output + ' --p reactnative');
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/global-win32/reactnative/tokens-aliases.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/global-win32/reactnative/tokens-controls.json'));

  console.log('Generating macOS global tokens...');
  input = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input.json');
  input2 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input.macos.json');
  output = path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/global-macos');
  child_process.execSync('yarn transform-tokens --in ' + input + ' --in ' + input2 + ' --out ' + output + ' --p reactnative');
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/global-macos/reactnative/tokens-aliases.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/global-macos/reactnative/tokens-controls.json'));

  console.log('Generating macOS light mode tokens...');
  input = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input.json');
  input2 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input.macos.json');
  let input3 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-light.json');
  let input4 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-light.macos.json');
  output = path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/light-macos');
  child_process.execSync(
    'yarn transform-tokens --in ' +
      input +
      ' --in ' +
      input2 +
      ' --in ' +
      input3 +
      ' --in ' +
      input4 +
      ' --out ' +
      output +
      ' --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/light-macos/reactnative/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/light-macos/reactnative/tokens-controls.json'));

  console.log('Generating macOS dark mode tokens...');
  input = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input.json');
  input2 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input.macos.json');
  input3 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-dark.json');
  input4 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-dark.macos.json');
  output = path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/dark-macos');
  child_process.execSync(
    'yarn transform-tokens --in ' +
      input +
      ' --in ' +
      input2 +
      ' --in ' +
      input3 +
      ' --in ' +
      input4 +
      ' --out ' +
      output +
      ' --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/dark-macos/reactnative/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/dark-macos/reactnative/tokens-controls.json'));

  console.log('Generating android global tokens...');
  input = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input.json');
  input2 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-brand.android.json');
  output = path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/global-android');
  child_process.execSync('yarn transform-tokens --in ' + input + ' --in ' + input2 + ' --out ' + output + ' --p reactnative');
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/global-android/reactnative/tokens-aliases.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/global-android/reactnative/tokens-controls.json'));

  console.log('Generating light mode tokens...');
  input = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input.json');
  input2 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-light.json');
  output = path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/light');
  child_process.execSync('yarn transform-tokens --in ' + input + ' --in ' + input2 + ' --out ' + output + ' --p reactnative');
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/light/reactnative/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/light/reactnative/tokens-controls.json'));

  console.log('Generating android light mode tokens...');
  input = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input.json');
  input2 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-brand.win32.json');
  input3 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-light.android.json');
  output = path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/light-android');
  child_process.execSync(
    'yarn transform-tokens --in ' + input + ' --in ' + input2 + ' --in ' + input3 + ' --out ' + output + ' --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/light-android/reactnative/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/light-android/reactnative/tokens-controls.json'));

  console.log('Generating dark mode tokens...');
  input = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input.json');
  input2 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-dark.json');
  output = path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/dark');
  child_process.execSync('yarn transform-tokens --in ' + input + ' --in ' + input2 + ' --out ' + output + ' --p reactnative');
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/dark/reactnative/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/dark/reactnative/tokens-controls.json'));

  console.log('Generating colorful mode tokens...');
  input = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input.json');
  input2 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-brand.win32.json');
  input3 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-light.json');
  input4 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-colorful.json');
  output = path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/colorful');
  child_process.execSync(
    'yarn transform-tokens --in ' +
      input +
      ' --in ' +
      input2 +
      ' --in ' +
      input3 +
      ' --in ' +
      input4 +
      ' --out ' +
      output +
      ' --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/colorful/reactnative/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/colorful/reactnative/tokens-controls.json'));

  console.log('Generating dark gray mode tokens...');
  input = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input.json');
  input2 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-brand.win32.json');
  input3 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-darkgray.json');
  output = path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/darkGray');
  child_process.execSync(
    'yarn transform-tokens --in ' + input + ' --in ' + input2 + ' --in ' + input3 + ' --out ' + output + ' --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/darkGray/reactnative/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/darkGray/reactnative/tokens-controls.json'));

  console.log('Generating black mode tokens...');
  input = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input.json');
  input2 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-brand.win32.json');
  input3 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-dark.json');
  input4 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-black.json');
  output = path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/black');
  child_process.execSync(
    'yarn transform-tokens --in ' +
      input +
      ' --in ' +
      input2 +
      ' --in ' +
      input3 +
      ' --in ' +
      input4 +
      ' --out ' +
      output +
      ' --p reactnative',
  );
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/black/reactnative/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/black/reactnative/tokens-controls.json'));

  console.log('Generating high contrast mode tokens...');
  input = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input.json');
  input2 = path.join(process.cwd(), 'packages/theming/theme-tokens/src/pipeline-input/token-input-highContrast.json');
  output = path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/highContrast');
  child_process.execSync('yarn transform-tokens --in ' + input + ' --in ' + input2 + ' --out ' + output + ' --p reactnative');
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/highContrast/reactnative/tokens-global.json'));
  fs.unlinkSync(path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated/highContrast/reactnative/tokens-controls.json'));

  console.log('Running prettier...');
  input = path.join(process.cwd(), 'packages/theming/theme-tokens/src/generated');
  child_process.execSync('prettier --write ' + input);

  console.log('Done!');
}

run().catch((ex) => {
  console.error('Caught error:');
  console.error(ex);
  process.exit(1);
});
