const { src, dest } = require('gulp');
const process = require('process');

const COMPONENT_PATH = '../../packages/components/ComponentTemplate/';
const COMPONENT_TEMPLATE_PATH = './component-templates/ComponentTemplate/';

const TESTER_PATH = '../../apps/fluent-tester/src/FluentTester/TestComponents/TesterComponentTemplate';
const TESTER_TEMPLATE_PATH = './component-templates/TesterComponentTemplate/*';
function copy(from, to) {
  src(from).pipe(dest(to));
}

function parseTask() {
  const tasksArray = process.argv;
  console.log(tasksArray)
}
function add(cb) {
  // console.log(process.argv)
  parseTask();
  // copy([`${COMPONENT_TEMPLATE_PATH}**/*`, `${COMPONENT_TEMPLATE_PATH}.eslintrc.js`], COMPONENT_PATH);
  // copy([TESTER_TEMPLATE_PATH], TESTER_PATH);
  cb();
}

exports.default = add;
exports.add = add;

// TODO
// 1. Copy files to destination point - partially done
// 2. lonsole.log what was copied
// 3. Rename files
// 4. Rename component name to the name from cmd
// 5. Install deps with gulp
// 6. Bundle your new component
// 7. Run can be add as an option, e.g. gulp add --new component-name --run