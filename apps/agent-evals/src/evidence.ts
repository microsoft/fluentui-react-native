import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

type Event = { type: string; timestamp?: string; data: Record<string, unknown> };
export type ToolEvidence = {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  server?: string;
  serverTool?: string;
  start: number;
  end?: number;
  success?: boolean;
  result?: unknown;
};
export type SessionEvidence = {
  tools: ToolEvidence[];
  skills: string[];
  finalMessage: string;
  problems: string[];
};

function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function readEvidence(file: string, expected: { sessionId: string; workspace: string; baseCommit: string }): SessionEvidence {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.endsWith('\n')) throw new Error('The session event log is truncated.');
  const events = text
    .trimEnd()
    .split('\n')
    .map((line): Event => {
      const event: unknown = JSON.parse(line);
      if (!object(event) || typeof event.type !== 'string' || !object(event.data)) throw new Error('Malformed session event.');
      return event as Event;
    });
  const start = events[0];
  const context = start?.data.context;
  if (
    start?.type !== 'session.start' ||
    start.data.sessionId !== expected.sessionId ||
    !object(context) ||
    context.headCommit !== expected.baseCommit ||
    context.branch !== 'eval' ||
    typeof context.cwd !== 'string' ||
    fs.realpathSync(context.cwd) !== fs.realpathSync(expected.workspace) ||
    typeof context.gitRoot !== 'string' ||
    fs.realpathSync(context.gitRoot) !== fs.realpathSync(expected.workspace)
  )
    throw new Error('Session identity, checkout or start commit does not match the trial.');
  const tools = new Map<string, ToolEvidence>();
  const invoked = new Map<string, string>();
  const delivered = new Set<string>();
  const problems: string[] = [];
  let finalMessage = '';
  for (const [index, event] of events.entries()) {
    const data = event.data;
    if (event.type === 'session.resume') problems.push('A controlled trial resumed an existing session.');
    if (event.type === 'session.error') problems.push('The CLI recorded a session error.');
    if (event.type === 'assistant.message' && typeof data.content === 'string') finalMessage = data.content;
    if ((event.type === 'skill.invoked_ref' || event.type === 'skill.invoked') && typeof data.name === 'string') {
      const contentId =
        typeof data.contentId === 'string'
          ? data.contentId
          : typeof data.content === 'string'
            ? `sha256:${createHash('sha256').update(data.content).digest('hex')}`
            : undefined;
      const expectedPath = path.join(expected.workspace, '.agents/skills', data.name, 'SKILL.md');
      if (!contentId) {
        problems.push('Skill invocation has no verifiable context identity.');
      } else if (typeof data.path !== 'string' || path.resolve(data.path) !== expectedPath) {
        problems.push('Skill context came from outside the fixture installation.');
      } else {
        invoked.set(contentId, data.name);
      }
    }
    if (event.type === 'skill.context_delivered_ref' && typeof data.contentId === 'string') delivered.add(data.contentId);
    if (event.type === 'tool.execution_start') {
      if (typeof data.toolCallId !== 'string' || typeof data.toolName !== 'string' || tools.has(data.toolCallId)) {
        problems.push('A tool start has a missing or duplicate identity.');
        continue;
      }
      tools.set(data.toolCallId, {
        id: data.toolCallId,
        name: data.toolName,
        arguments: object(data.arguments) ? data.arguments : {},
        start: index,
        ...(typeof data.mcpServerName === 'string' ? { server: data.mcpServerName } : {}),
        ...(typeof data.mcpToolName === 'string' ? { serverTool: data.mcpToolName } : {}),
      });
    }
    if (event.type === 'tool.execution_complete') {
      const tool = typeof data.toolCallId === 'string' ? tools.get(data.toolCallId) : undefined;
      if (!tool || tool.end !== undefined || typeof data.success !== 'boolean') {
        problems.push('A tool completion has no unique start or outcome.');
      } else {
        tool.end = index;
        tool.success = data.success;
        tool.result = data.result;
      }
    }
  }
  if ([...tools.values()].some((tool) => tool.end === undefined)) problems.push('A tool call never completed.');
  if (!finalMessage.trim()) problems.push('The session has no final response.');
  return {
    tools: [...tools.values()],
    skills: [...invoked].filter(([id]) => delivered.has(id)).map(([, name]) => name),
    finalMessage,
    problems,
  };
}

export function successfulRead(evidence: SessionEvidence, workspace: string, relative: string): boolean {
  const expected = path.resolve(workspace, relative);
  const lines = fs
    .readFileSync(expected, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length >= 20);
  return evidence.tools.some((tool) => {
    if (
      tool.name !== 'view' ||
      tool.success !== true ||
      typeof tool.arguments.path !== 'string' ||
      path.resolve(workspace, tool.arguments.path) !== expected ||
      !object(tool.result)
    )
      return false;
    const contents = [tool.result.content, tool.result.detailedContent].filter((value): value is string => typeof value === 'string');
    return lines.some((line) => contents.some((content) => content.includes(line)));
  });
}
