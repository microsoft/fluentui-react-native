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
