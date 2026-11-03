/**
 * Text from an application is untrusted: names, values, and help strings reach an agent verbatim. These helpers keep
 * that text from changing the shape of what the agent reads or hiding instructions from the person reviewing it.
 */

/** UTF-16 units that are invisible or break lines in some readers. Tab, line feed, and carriage return stay. */
function isUnsafeUnit(code: number): boolean {
  return (
    code <= 0x08 ||
    code === 0x0b ||
    code === 0x0c ||
    (code >= 0x0e && code <= 0x1f) ||
    (code >= 0x7f && code <= 0x9f) ||
    code === 0x061c ||
    code === 0x200b ||
    code === 0x200e ||
    code === 0x200f ||
    (code >= 0x2028 && code <= 0x202e) ||
    (code >= 0x2060 && code <= 0x2064) ||
    (code >= 0x2066 && code <= 0x206f) ||
    code === 0xfeff ||
    (code >= 0xfff9 && code <= 0xfffb)
  );
}

/** The high surrogate shared by every Unicode tag character (U+E0000 to U+E007F), which render as nothing. */
const tagHighSurrogate = 0xdb40;

function escapeUnit(code: number): string {
  return `\\u${code.toString(16).padStart(4, '0')}`;
}

/**
 * Replaces characters a reader cannot see, and Unicode tag characters that encode hidden text, with visible `\uXXXX`
 * escapes. Zero-width joiners stay because emoji and several scripts need them. The scan is a single pass.
 */
export function neutralizeText(text: string): string {
  let result = '';
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    const next = index + 1 < text.length ? text.charCodeAt(index + 1) : 0;
    const isTag = code === tagHighSurrogate && next >= 0xdc00 && next <= 0xdc7f;
    if (!isTag && !isUnsafeUnit(code)) {
      continue;
    }
    result += text.slice(start, index) + escapeUnit(code);
    if (isTag) {
      index += 1;
      result += escapeUnit(next);
    }
    start = index + 1;
  }
  return start === 0 ? text : result + text.slice(start);
}

/**
 * Renders text as a JSON string literal after neutralizing it. A string that was cut to its budget ends in an ellipsis
 * inside the quotes, so a reader can tell it is partial.
 */
export function quoteText(text: string, clipped = false): string {
  const quoted = JSON.stringify(neutralizeText(text));
  return clipped ? `${quoted.slice(0, -1)}…"` : quoted;
}

function isTokenCode(code: number): boolean {
  return (
    (code >= 0x30 && code <= 0x39) ||
    (code >= 0x41 && code <= 0x5a) ||
    (code >= 0x61 && code <= 0x7a) ||
    code === 0x2d ||
    code === 0x2e ||
    code === 0x3a ||
    code === 0x5f
  );
}

/** Reduces a provider string, such as a role or action name, to a bare token that cannot break a line's grammar. */
export function safeToken(text: string, maxLength = 48): string {
  let token = '';
  for (let index = 0; index < text.length && token.length < maxLength; index += 1) {
    token += isTokenCode(text.charCodeAt(index)) ? text[index] : '_';
  }
  return token.length > 0 ? token : '_';
}

/** True when `text` is a bare token, such as an automation id, that needs no quoting in an outline. */
export function isBareToken(text: string): boolean {
  if (text.length === 0 || text.length > 128) {
    return false;
  }
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (!isTokenCode(code) && code !== 0x2f) {
      return false;
    }
  }
  return true;
}

export function utf8Length(text: string): number {
  return Buffer.byteLength(text, 'utf8');
}
