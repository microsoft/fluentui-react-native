import fs from 'node:fs';
import CopilotSessionProvider from '@rnx-kit/agent-evals/provider';

const [sessionId, output] = process.argv.slice(2);
if (!sessionId || !output) throw new Error('The audit worker requires an explicit session ID and output.');
const provider = new CopilotSessionProvider({ config: { repository: 'furn-eval/synthetic-consumer' } });
const replay = await provider.callApi('', { vars: { copilotSession: sessionId }, test: { metadata: { requires: 'session' } } });
if ('error' in replay || replay.metadata.copilotSession !== sessionId || replay.metadata.missingLog) {
  throw new Error('The explicit local session could not be fully audited.');
}
fs.writeFileSync(output, `${JSON.stringify(replay, null, 2)}\n`, { mode: 0o600 });
