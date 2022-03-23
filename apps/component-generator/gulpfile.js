const { src, dest } = require('gulp');
const rename = require('gulp-rename');
const process = require('process');
const through2 = require('through2');
const {
  COMPONENT_PATH,
  COMPONENT_TEMPLATE_PATH,
  TESTER_PATH,
  TESTER_TEMPLATE_PATH,
  NAME_CAMEL_CASE,
  NAME_CAMEL_CASE_REGEXP,
  NAME_LOWER_CAMEL_CASE_REGEXP,
  NAME_KEBAB_CASE_REGEXP,
} = require('./consts');

function addComponent(callback) {
  const componentName = getComponentName();
  moveAndRenameTemplates(
    [`${COMPONENT_TEMPLATE_PATH}**/*`, `${COMPONENT_TEMPLATE_PATH}.eslintrc.js`],
    `${COMPONENT_PATH}${formatName(componentName).camelCase}`,
    componentName,
  );
  moveAndRenameTemplates([TESTER_TEMPLATE_PATH], `${TESTER_PATH}${formatName(componentName).camelCase}`, componentName);
  callback();
}

function moveAndRenameTemplates(from, to, name) {
  const compNameCamelCase = formatName(name).camelCase;
  const compNameLowerCamelCase = formatName(name).lowerCamelCase;
  const compNameKebabCase = formatName(name).kebabCase;

  src(from)
    .pipe(
      rename(function (path) {
        path.basename = path.basename.replace(NAME_CAMEL_CASE, compNameCamelCase);
      }),
    )
    .pipe(
      through2.obj(function (file, _, callback) {
        if (!(file.isDirectory() || file.isNull()) && file.isBuffer()) {
          const code = file.contents && file.contents.toString();
          const updatedCode = code
            .replace(NAME_CAMEL_CASE_REGEXP, compNameCamelCase)
            .replace(NAME_LOWER_CAMEL_CASE_REGEXP, compNameLowerCamelCase)
            .replace(NAME_KEBAB_CASE_REGEXP, compNameKebabCase);
          file.contents = Buffer.from(updatedCode);
        }
        callback(null, file);
      }),
    )
    .pipe(dest(to));
}

function formatName(name) {
  let newName = name
    .split('-')
    .map((word) => word.replace(word[0], word[0].toUpperCase()))
    .join('');
  return {
    kebabCase: name,
    camelCase: newName,
    lowerCamelCase: newName.replace(newName[0], newName[0].toLowerCase()),
  };
}

function getComponentName() {
  const tasks = process.argv;
  let name = '';
  for (let i in tasks) {
    if (tasks[i] === '--new') {
      name = tasks[parseInt(i) + 1];
      break;
    }
  }
  return name;
}

exports.add = addComponent;
exports.default = addComponent;
