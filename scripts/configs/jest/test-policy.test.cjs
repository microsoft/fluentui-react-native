const assert = require('node:assert/strict');
const { test } = require('node:test');
const { testBudget, testWorkerLimit } = require('./test-budget.cjs');

test('preserves local defaults and starts CI with one Jest worker', () => {
  assert.equal(testBudget(5_000, {}), 5_000);
  assert.equal(testWorkerLimit({ CI: 'false' }), undefined);
  assert.equal(testWorkerLimit({ CI: 'true' }), 1);
  assert.equal(testWorkerLimit({ TF_BUILD: 'True' }), 1);
  assert.equal(testWorkerLimit({ CI: 'true', FURN_JEST_MAX_WORKERS: '2' }), 2);
});

test('accepts explicit bounded test-only overrides', () => {
  assert.equal(testBudget(15_000, { FURN_TEST_TIMEOUT_SCALE: '2' }), 30_000);
  assert.throws(() => testBudget(15_000, { FURN_TEST_TIMEOUT_SCALE: '4' }), /FURN_TEST_TIMEOUT_SCALE/);
  assert.throws(() => testWorkerLimit({ FURN_JEST_MAX_WORKERS: '50%' }), /FURN_JEST_MAX_WORKERS/);
});
