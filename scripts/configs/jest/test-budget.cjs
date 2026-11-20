function readInteger(env, name, min, max, fallback) {
  const raw = env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!/^[1-9][0-9]*$/.test(raw) || !Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer from ${min} to ${max}.`);
  }
  return value;
}

function testBudget(baseMs, env = process.env) {
  return baseMs * readInteger(env, 'FURN_TEST_TIMEOUT_SCALE', 1, 3, 1);
}

function testWorkerLimit(env = process.env) {
  return readInteger(env, 'FURN_JEST_MAX_WORKERS', 1, 8, env.CI === 'true' || env.TF_BUILD ? 1 : undefined);
}

module.exports = { testBudget, testWorkerLimit };
