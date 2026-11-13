async function main() {
  const [operation, ...args] = process.argv.slice(2);
  let update;
  if (operation === 'remove' && args.length === 1) {
    update = { operation, digest: args[0] };
  } else if (operation === 'publish' && args.length % 2 === 0) {
    const fields = new Map();
    const allowed = ['--process-id', '--process-started-at', '--window-title', '--aumid', '--executable-path', '--previous-digest'];
    for (let index = 0; index < args.length; index += 2) {
      const key = args[index];
      if (!allowed.includes(key) || fields.has(key)) throw new Error('Invalid application lease arguments.');
      fields.set(key, args[index + 1]);
    }
    update = {
      operation,
      application: {
        processId: Number(fields.get('--process-id')),
        processStartedAt: fields.get('--process-started-at'),
        windowTitle: fields.get('--window-title'),
        ...(fields.has('--aumid') ? { aumid: fields.get('--aumid') } : {}),
        ...(fields.has('--executable-path') ? { executablePath: fields.get('--executable-path') } : {}),
      },
      ...(fields.has('--previous-digest') ? { previousDigest: fields.get('--previous-digest') } : {}),
    };
  } else {
    throw new Error('Invalid application lease operation.');
  }
  const { STORYBOOK_DRIVER_MANIFEST: manifest, STORYBOOK_DRIVER_HANDOFF: handoff } = process.env;
  if (!manifest || !handoff) throw new Error('Application leases require the trusted parent handoff.');
  const { updateWindowsApplicationLease } = await import('../lib/driver/applicationLease.js');
  const digest = await updateWindowsApplicationLease(manifest, handoff, update);
  if (digest !== undefined) process.stdout.write(`${digest}\n`);
}

main().catch(() => {
  // Credentials can be malformed; never echo their bytes through a JSON parsing diagnostic.
  process.stderr.write('Application lease update failed; verify the parent handoff, private storage, and application identity.\n');
  process.exitCode = 1;
});
