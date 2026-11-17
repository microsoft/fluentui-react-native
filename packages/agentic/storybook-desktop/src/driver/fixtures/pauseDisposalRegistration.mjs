import fs from 'node:fs';

const {
  FURN_TEST_REGISTRATION_MARKER: marker,
  FURN_TEST_REGISTRATION_RELEASE: release,
  FURN_TEST_REGISTRATION_STOPPED: stopped,
} = process.env;
const control = globalThis[Symbol.for('furn.desktop.process-control')];
if (!marker || !release || !control) throw new Error('The disposal registration gate requires an owned process.');

const register = control.register.bind(control);
control.register = async (dispose) => {
  const unregister = await register(async () => {
    if (stopped) fs.writeFileSync(stopped, 'stopping');
    await dispose();
  });
  fs.writeFileSync(marker, 'registered');
  while (!fs.existsSync(release)) await new Promise((resolve) => setTimeout(resolve, 20));
  return unregister;
};
