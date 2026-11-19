import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const args = process.argv.slice(2);
const value = (flag: string): string => {
  const index = args.indexOf(flag);
  const result = args[index + 1];
  if (index < 0 || !result) throw new Error(`Missing test option ${flag}.`);
  return result;
};
if (args.includes('--trust-folder') && args.includes('--session-id')) {
  throw new Error('--trust-folder cannot be combined with --session-id.');
}
if (args.includes('--version')) {
  console.log('Controlled test CLI 1.0.113');
} else if (args.includes('--help')) {
  console.log('--max-ai-credits --usage-output-file --no-custom-instructions --disallow-temp-dir --sync-session');
} else if (args.includes('--fixture-mode') && value('--fixture-mode') === 'hang') {
  process.on('SIGTERM', () => undefined);
  setInterval(() => undefined, 1000);
} else {
  const sessionId = value('--session-id');
  const cwd = process.cwd();
  const mode = args.includes('--fixture-mode') ? value('--fixture-mode') : 'normal';
  const events: { type: string; timestamp: string; data: Record<string, unknown> }[] = [];
  const event = (type: string, data: Record<string, unknown>) => events.push({ type, timestamp: new Date().toISOString(), data });
  const tool = async (name: string, arguments_: Record<string, unknown>, work: () => Promise<Record<string, unknown>>, mcp = false) => {
    const toolCallId = `call-${events.length}`;
    event('tool.execution_start', {
      toolCallId,
      toolName: name,
      arguments: arguments_,
      ...(mcp ? { mcpServerName: 'furn_eval', mcpToolName: 'desktop_workload' } : {}),
    });
    const result = await work();
    event('tool.execution_complete', {
      toolCallId,
      success: !result.isError,
      result: { content: mcp ? JSON.stringify(result) : result.text },
    });
    return result;
  };
  event('session.start', {
    sessionId,
    context: {
      cwd,
      gitRoot: cwd,
      branch: 'eval',
      headCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' }).trim(),
    },
  });
  event('user.message', { content: value('--prompt') });
  const home = process.env.COPILOT_HOME;
  if (!home) throw new Error('The controlled test requires an isolated home.');
  const config = JSON.parse(fs.readFileSync(path.join(home, 'config.json'), 'utf8')) as { trustedFolders: string[] };
  if (!config.trustedFolders.includes(cwd)) throw new Error('Only the generated consumer must be trusted in its isolated profile.');
  const settings = JSON.parse(fs.readFileSync(path.join(home, 'settings.json'), 'utf8'));
  if (!settings.disabledSkills.includes('furn-desktop-testing')) {
    const skill = path.join(cwd, '.agents/skills/furn-desktop-testing/SKILL.md');
    event('skill.invoked_ref', { name: 'furn-desktop-testing', path: skill, contentId: 'test-skill-content' });
    event('skill.context_delivered_ref', { contentId: 'test-skill-content' });
  }
  const mcpFile = args.includes('--additional-mcp-config') ? value('--additional-mcp-config').slice(1) : undefined;
  const reads = mcpFile
    ? [
        'node_modules/@fluentui-react-native/desktop-mcp/references/connection.md',
        'node_modules/@fluentui-react-native/desktop-mcp/references/tools.md',
        'node_modules/@fluentui-react-native/desktop-test/references/management.md',
      ]
    : [
        'README.md',
        'package.json',
        'node_modules/@fluentui-react-native/desktop-test/references/configuration.md',
        'node_modules/@fluentui-react-native/desktop-test/references/platforms.md',
      ];
  for (const relative of reads) {
    const file = path.join(cwd, relative);
    await tool('view', { path: file }, async () => ({ text: fs.readFileSync(file, 'utf8').slice(0, 100) }));
  }
  let status = 'planned';
  let cleanup = 'not-applicable';
  if (mcpFile) {
    const config = JSON.parse(fs.readFileSync(mcpFile, 'utf8')).mcpServers.furn_eval;
    const client = new Client({ name: 'controlled-eval-test', version: '1' });
    try {
      await client.connect(new StreamableHTTPClientTransport(new URL(config.url), { requestInit: { headers: config.headers } }));
      const call = (input: Record<string, unknown>) =>
        tool('furn_eval-desktop_workload', input, () => client.callTool({ name: 'desktop_workload', arguments: input }), true);
      const catalog = await call({ action: 'catalog' });
      if (catalog.isError) {
        status = 'blocked';
      } else {
        await call({ action: 'run', workload: 'smoke', lane: 'accessible', requestId: 'test-request' });
        await call({ action: 'status', requestId: 'test-request' });
        status = 'incomplete';
        cleanup = 'settled';
      }
    } finally {
      await client.close();
    }
  }
  event('assistant.message', {
    content: JSON.stringify({
      status: mode === 'wrong-status' ? 'passed' : status,
      cleanup,
      summary: 'Synthetic test evidence, not a model or native result.',
    }),
  });
  const directory = path.join(home, 'session-state', sessionId);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'events.jsonl'), `${events.map((entry) => JSON.stringify(entry)).join('\n')}\n`);
  fs.writeFileSync(value('--usage-output-file'), JSON.stringify({ synthetic: true, modelCalls: 0 }));
  console.log(JSON.stringify({ type: 'test-only', modelCalls: 0 }));
}
