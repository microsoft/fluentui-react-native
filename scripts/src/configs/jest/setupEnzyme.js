// setup-tests.js
import 'react-native';
import 'jest-enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Enzyme from 'enzyme';

/**
 * Set up DOM in node.js environment for Enzyme to mount to
 */
const { JSDOM } = require('jsdom');

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
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
