const { getIndex, selectStory, updateArgs } = require('./storybook-client.cjs');

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const [command = 'list', ...args] = process.argv.slice(2);

  if (command === 'list') {
    const index = await getIndex();
    const entries = Object.values(index.entries || {}).map(({ id, name, title, type }) => ({ id, name, title, type }));
    print(entries);
    return;
  }

  if (command === 'select') {
    const [storyId] = args;
    if (!storyId) {
      throw new Error('Usage: yarn storybook:control select <story-id>');
    }
    print(await selectStory(storyId));
    return;
  }

  if (command === 'args') {
    const [storyId, json] = args;
    if (!storyId || !json) {
      throw new Error('Usage: yarn storybook:control args <story-id> <json>');
    }
    print(await updateArgs(storyId, JSON.parse(json)));
    return;
  }

  if (command === 'smoke') {
    const index = await getIndex();
    const entries = Object.values(index.entries || {}).filter(({ type }) => type === 'story');
    const failures = [];
    const settleMilliseconds = Number(process.env.STORYBOOK_SMOKE_SETTLE_MS) || 0;
    const failFast = process.env.STORYBOOK_SMOKE_FAIL_FAST === '1';

    for (const { id } of entries) {
      try {
        await selectStory(id);
        if (settleMilliseconds > 0) {
          await new Promise((resolve) => setTimeout(resolve, settleMilliseconds));
        }
        process.stdout.write(`rendered ${id}\n`);
      } catch (error) {
        failures.push({ id, error: error.message });
        process.stderr.write(`failed ${id}: ${error.message}\n`);
        if (failFast) {
          break;
        }
      }
    }

    if (failures.length > 0) {
      throw new Error(`${failures.length} of ${entries.length} stories failed to render`);
    }

    print({ success: true, stories: entries.length });
    return;
  }

  throw new Error(`Unknown command "${command}"`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
