const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function main() {
  const moduleUrl = pathToFileURL(path.resolve(__dirname, '..', '..', 'lib', 'agent', 'index.js')).href;
  const { connectDesktopAgent } = await import(moduleUrl);
  const [url, targetId, artifactsRoot] = process.argv.slice(2);
  const agent = await connectDesktopAgent({
    artifactsRoot,
    platformName: 'windows',
    targetId,
    url,
  });
  try {
    const stories = await agent.listStories();
    const story = await agent.explainStory('components-button--default');
    await agent.openStory(story.id);
    const tree = await agent.describe({ depth: 2, maxNodes: 10, scope: 'story' });
    await agent.click({ testId: 'button-primary' });
    const check = await agent.check({ state: 'focused', target: { testId: 'button-primary' }, value: true });
    const screenshot = await agent.screenshot('agent-button');
    const run = await agent.runStoryTest(story.id, 'agent-plan');
    process.stdout.write(JSON.stringify({ check, run, screenshot, stories: stories.length, tree: tree.length }));
  } finally {
    await agent.delete();
  }
}

main().catch((error) => {
  process.stderr.write(error.stack ?? error.message);
  process.exitCode = 1;
});
