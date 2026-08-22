function baseUrl() {
  // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- the agent channel is loopback-only and intentionally has no TLS setup
  return 'http://127.0.0.1:7007';
}

async function request(pathname, options) {
  const response = await fetch(`${baseUrl()}${pathname}`, options);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error || `Storybook server returned ${response.status}`);
  }

  return body;
}

async function getIndex() {
  return request('/index.json');
}

async function sendEvent(type, ...args) {
  return request('/send-event', {
    body: JSON.stringify({ type, args }),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  });
}

async function selectStory(storyId, attempts = 45) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await request(`/select-story-sync/${encodeURIComponent(storyId)}`, { method: 'POST' });
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  throw lastError;
}

async function updateArgs(storyId, updatedArgs) {
  return sendEvent('updateStoryArgs', { storyId, updatedArgs });
}

module.exports = {
  getIndex,
  selectStory,
  sendEvent,
  updateArgs,
};
