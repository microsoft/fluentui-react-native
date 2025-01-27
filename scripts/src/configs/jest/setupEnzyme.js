// setup-tests.js
import 'react-native';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import Enzyme from 'enzyme';

/**
 * Set up DOM in node.js environment for Enzyme to mount to
 */
const { JSDOM } = require('jsdom');

const jsdom = new JSDOM('<!doctype html><html><body></body></html>', {
  // Fixes "SecurityError: localStorage is not available for opaque origins".
  // See https://github.com/jsdom/jsdom/issues/2304#issuecomment-408320484
  url: 'https://localhost',
});
const { window } = jsdom;

function copyProps(src, target) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target),
  });
}

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
};
copyProps(window, global);

/**
 * Hook console warnings because enzyme with react-native will generate some bogus warnings such as:
 *   Warning: <View /> is using incorrect casing. Use PascalCase for React components, or lowercase for HTML elements.
 *   Warning: The tag <View> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter
 */
const consoleErrorHandler = console.error;
console.error = (message, ...args) => {
  const blockExpr = /.*(react-dom.development.js|Use PascalCase for React|is unrecognized in this browser)/i;
  if (!blockExpr.test(message)) {
    consoleErrorHandler(message, ...args);
  }
};

/**
 * Set up Enzyme to mount to DOM, simulate events,
 * and inspect the DOM in tests.
 */
Enzyme.configure({ adapter: new Adapter() });
