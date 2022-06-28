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
  NAME_COBOL_CASE_REGEXP,
  NAME_LOWER_CAMEL_CASE_REGEXP,
  NAME_KEBAB_CASE_REGEXP,
  TEST_PAGES_WIN32_PATH,
  TEST_PAGE_IMPORT_TO_INSERT,
  TEST_PAGE_COMPONENT_TO_INSERT,
  IMPORT_INSERT_TMPL,
  COMPONENT_INSERT_TMPL,
} = require('./consts');

function addComponent(callback) {
  const componentName = getComponentName();
  moveAndRenameTemplates(
    [`${COMPONENT_TEMPLATE_PATH}**/*`, `${COMPONENT_TEMPLATE_PATH}.eslintrc.js`],
    `${COMPONENT_PATH}${formatName(componentName).camelCase}`,
    componentName,
  );
  moveAndRenameTemplates([TESTER_TEMPLATE_PATH], `${TESTER_PATH}${formatName(componentName).camelCase}`, componentName);
  insertCode(componentName);
  callback();
}

function moveAndRenameTemplates(from, to, name) {
  const compNameCamelCase = formatName(name).camelCase;

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
          const updatedCode = renameComponent(code, name);
          file.contents = Buffer.from(updatedCode);
        }
        callback(null, file);
      }),
    )
    .pipe(dest(to));
}

function insertCode(name) {
  src(`${TEST_PAGES_WIN32_PATH}testPages.win32.ts`)
    .pipe(
      through2.obj(function (file, _, callback) {
        if (!(file.isDirectory() || file.isNull()) && file.isBuffer()) {
          const code = file.contents && file.contents.toString();
          const importToInsert = renameComponent(TEST_PAGE_IMPORT_TO_INSERT, name);
          const componentToInsert = renameComponent(TEST_PAGE_COMPONENT_TO_INSERT, name);
          if (code.indexOf(importToInsert) === -1 && code.indexOf(componentToInsert) === -1) {
            const updatedCode = code.replace(IMPORT_INSERT_TMPL, importToInsert).replace(COMPONENT_INSERT_TMPL, componentToInsert);
            file.contents = Buffer.from(updatedCode);
          }
        }
        callback(null, file);
      }),
    )
    .pipe(dest(TEST_PAGES_WIN32_PATH));
}

function renameComponent(content, componentName) {
  const compNameCamelCase = formatName(componentName).camelCase;
  const compNameLowerCamelCase = formatName(componentName).lowerCamelCase;
  const compNameKebabCase = formatName(componentName).kebabCase;
  const compNameCobolCase = formatName(componentName).cobolCase;
  return content
    .replace(NAME_CAMEL_CASE_REGEXP, compNameCamelCase)
    .replace(NAME_LOWER_CAMEL_CASE_REGEXP, compNameLowerCamelCase)
    .replace(NAME_KEBAB_CASE_REGEXP, compNameKebabCase)
    .replace(NAME_COBOL_CASE_REGEXP, compNameCobolCase);
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
    cobolCase: name.replace('-', '_').toUpperCase(),
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
