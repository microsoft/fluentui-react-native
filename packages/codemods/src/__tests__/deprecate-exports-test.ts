import { defineTest } from 'jscodeshift/dist/testUtils';

jest.autoMockOff();

describe('deprecate-exports', () => {
  defineTest(__dirname, 'deprecate-exports', null, 'deprecate-exports', { parser: 'tsx' });
});
