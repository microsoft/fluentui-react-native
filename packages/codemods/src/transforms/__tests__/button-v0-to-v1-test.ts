import { defineTest } from 'jscodeshift/dist/testUtils';

jest.autoMockOff();

describe('button-v0-to-v1', () => {
  defineTest(__dirname, 'button-v0-to-v1', null, 'button-v0-to-v1', { parser: 'tsx' });
});
