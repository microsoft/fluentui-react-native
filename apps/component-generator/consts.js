const NAME_CAMEL_CASE = 'ComponentName';
const getRegExp = (name) => new RegExp(name, 'g');

exports.COMPONENT_PATH = '../../packages/components/';
exports.COMPONENT_TEMPLATE_PATH = './component-templates/ComponentTemplate/';
exports.TESTER_PATH = '../../apps/fluent-tester/src/FluentTester/TestComponents/';
exports.TESTER_TEMPLATE_PATH = './component-templates/TesterComponentTemplate/*';
exports.NAME_CAMEL_CASE = NAME_CAMEL_CASE;
exports.NAME_CAMEL_CASE_REGEXP = getRegExp(NAME_CAMEL_CASE);
exports.NAME_LOWER_CAMEL_CASE_REGEXP = getRegExp('componentName');
exports.NAME_KEBAB_CASE_REGEXP = getRegExp('component-name');
exports.NAME_COBOL_CASE_REGEXP = getRegExp('COMPONENT_NAME');

exports.TEST_PAGES_WIN32_PATH = '../../apps/fluent-tester/src/FluentTester/';
exports.TEST_PAGE_IMPORT_TO_INSERT = `import { ComponentNameTest, HOMEPAGE_COMPONENT_NAME_BUTTON } from './TestComponents/ComponentName';\n// --> testPage import insert`;
exports.TEST_PAGE_COMPONENT_TO_INSERT = `{
    name: 'ComponentName Test',
    component: ComponentNameTest,
    testPage: HOMEPAGE_COMPONENT_NAME_BUTTON,
  },
  // --> testPage component insert,`;
exports.IMPORT_INSERT_TMPL = '// --> testPage import insert';
exports.COMPONENT_INSERT_TMPL = '// --> testPage component insert';
