#!/usr/bin/env node
'use strict';

/* eslint-disable @microsoft/sdl/no-insecure-url -- These endpoints are local development services. */
const DEFAULT_WS_URL = 'ws://127.0.0.1:7007/';
const DEFAULT_METRO_STATUS_URL = 'http://127.0.0.1:8081/status';
const INDEX_REQUEST = 'RN_GET_INDEX';
const INDEX_RESPONSE = 'RN_GET_INDEX_RESPONSE';
const source = `storybook-agent-${process.pid}`;

const [command = 'help', ...args] = process.argv.slice(2);
const wsUrl = process.env.STORYBOOK_WS_URL || DEFAULT_WS_URL;
const metroStatusUrl = process.env.STORYBOOK_METRO_STATUS_URL || DEFAULT_METRO_STATUS_URL;

function emit(ws, type, ...eventArgs) {
  ws.send(JSON.stringify({ type, args: eventArgs, from: source }));
}

function parseMessage(event) {
  try {
    return JSON.parse(String(event.data));
  } catch {
    return null;
  }
}

function openChannel() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error(`Timed out connecting to ${wsUrl}`));
    }, 5000);

    ws.addEventListener('open', () => {
      clearTimeout(timeout);
      resolve(ws);
    });
    ws.addEventListener('error', () => {
      clearTimeout(timeout);
      reject(new Error(`Unable to connect to ${wsUrl}; run yarn storybook-server`));
    });
  });
}

function requestIndex(ws) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      ws.removeEventListener('message', onMessage);
      reject(new Error('Timed out waiting for the Storybook runtime index'));
    }, 5000);

    function onMessage(event) {
      const message = parseMessage(event);
      if (message?.type !== INDEX_RESPONSE) {
        return;
      }

      clearTimeout(timeout);
      ws.removeEventListener('message', onMessage);
      resolve(message.args[0].index.entries);
    }

    ws.addEventListener('message', onMessage);
    emit(ws, INDEX_REQUEST);
  });
}

function storyIdFromMessage(message) {
  const payload = message?.args?.[0];
  return typeof payload === 'string' ? payload : payload?.storyId;
}

function selectStory(ws, storyId) {
  return new Promise((resolve) => {
    let settleTimer;
    let sawRender = false;

    const rerenderTimer = setTimeout(() => emit(ws, 'forceReRender'), 500);
    const timeout = setTimeout(() => finish({ storyId, status: 'timeout' }), 10000);

    function finish(result) {
      clearTimeout(rerenderTimer);
      clearTimeout(timeout);
      clearTimeout(settleTimer);
      ws.removeEventListener('message', onMessage);
      resolve(result);
    }

    function onMessage(event) {
      const message = parseMessage(event);
      if (!message) {
        return;
      }

      const eventStoryId = storyIdFromMessage(message);
      if (eventStoryId !== storyId) {
        return;
      }

      if (message.type === 'storyChanged' || message.type === 'storyRenderPhaseChanged') {
        sawRender = true;
        clearTimeout(rerenderTimer);
        clearTimeout(settleTimer);
      } else if (message.type === 'currentStoryWasSet') {
        clearTimeout(rerenderTimer);
        settleTimer = setTimeout(() => {
          if (!sawRender) {
            finish({ storyId, status: 'unchanged' });
          }
        }, 500);
      } else if (message.type === 'storyFinished') {
        finish(message.args[0]);
      } else if (['storyErrored', 'storyMissing', 'storyThrewException'].includes(message.type)) {
        finish({ storyId, status: 'error', event: message.type, detail: message.args[1] });
      }
    }

    ws.addEventListener('message', onMessage);
    emit(ws, 'setCurrentStory', { storyId });
  });
}

function matchingStories(entries, query = '') {
  const normalizedQuery = query.toLowerCase();
  return Object.entries(entries)
    .filter(([, entry]) => entry.type === 'story')
    .filter(([id, entry]) => {
      const searchable = `${id} ${entry.title || ''} ${entry.name || ''}`.toLowerCase();
      return searchable.includes(normalizedQuery);
    })
    .sort(([left], [right]) => left.localeCompare(right));
}

async function run() {
  if (command === 'help' || command === '--help' || command === '-h') {
    console.log(`Usage:
  yarn storybook-agent status
  yarn storybook-agent stories [query]
  yarn storybook-agent select <runtime-story-id>
  yarn storybook-agent sweep [query]`);
    return;
  }

  const ws = await openChannel();
  try {
    if (command === 'status') {
      const [metroResponse, entries] = await Promise.all([fetch(metroStatusUrl), requestIndex(ws)]);
      const stories = matchingStories(entries);
      console.log(`metro=${await metroResponse.text()} channel=connected stories=${stories.length}`);
      return;
    }

    const entries = await requestIndex(ws);

    if (command === 'stories') {
      const stories = matchingStories(entries, args.join(' '));
      for (const [id, entry] of stories) {
        console.log(`${id}\t${entry.title} / ${entry.name}`);
      }
      console.log(`stories=${stories.length}`);
      return;
    }

    if (command === 'select') {
      const storyId = args[0];
      if (!storyId) {
        throw new Error('select requires a runtime story ID');
      }
      if (!entries[storyId] || entries[storyId].type !== 'story') {
        throw new Error(`Unknown story ID: ${storyId}`);
      }

      const result = await selectStory(ws, storyId);
      console.log(`${result.storyId}\t${result.status}`);
      if (!['success', 'unchanged'].includes(result.status)) {
        process.exitCode = 1;
      }
      return;
    }

    if (command === 'sweep') {
      const stories = matchingStories(entries, args.join(' '));
      const failures = [];
      for (const [storyId] of stories) {
        const result = await selectStory(ws, storyId);
        if (!['success', 'unchanged'].includes(result.status)) {
          failures.push(result);
        }
      }

      console.log(`stories=${stories.length} failures=${failures.length}`);
      for (const failure of failures) {
        console.error(`${failure.storyId}\t${failure.status}\t${failure.event || ''}`);
      }
      if (failures.length > 0) {
        process.exitCode = 1;
      }
      return;
    }

    throw new Error(`Unknown command: ${command}`);
  } finally {
    ws.close();
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
