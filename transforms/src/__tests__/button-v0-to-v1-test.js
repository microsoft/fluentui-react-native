'use strict';

jest.autoMockOff();
const defineTest = require('jscodeshift/dist/testUtils').defineTest;

defineTest(__dirname, 'button-v0-to-v1', null, 'button-v0-to-v1', { parser: 'tsx' });
