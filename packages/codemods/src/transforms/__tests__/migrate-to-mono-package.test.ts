import { defineTest } from 'jscodeshift/dist/testUtils';

jest.autoMockOff();

describe('migrate-to-mono-package', () => {
  defineTest(__dirname, 'migrate-to-mono-package', null, 'migrate-to-mono-package', { parser: 'tsx' });
});
