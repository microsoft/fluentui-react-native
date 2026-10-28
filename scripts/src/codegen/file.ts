import { FSEntry } from '@rnx-kit/tools-filesystem';

export type Chunk = {
  /**
   * Returns the output of the chunk as a string.
   */
  output(): string;
};

export type OutputFragment = string | Chunk;
export type Output = OutputFragment | Output[];

export type Comment = Chunk & {
  text: string | string[];
  type?: 'block' | 'line';
};

export function makeComment(text: string | string[], type: 'block' | 'line' = 'block'): Comment {
  const payload = { text, type };
  return { ...payload, output: () => writeComment(payload.text, payload.type) };
}

/**
 * A generated file is just a collection of chunks serialized to a file. It has a header comment that can be
 * modified if desired.
 * - Chunks will be written in order.
 * - The file will not be touched if no changes need to be written
 */
export class GeneratedFile {
  private _content: Output[] = [];
  private _entry: FSEntry;

  /** initialize the codegen file with the given path */
  constructor(path: string) {
    this._entry = new FSEntry(path);
  }

  /** public header comment */
  header = makeComment(`WARNING: This file is auto-generated. Do not edit it manually.`);

  /** path of the generated file */
  get path() {
    return this._entry.path;
  }

  /** add content to the generated file */
  add(...content: Output[]) {
    this._content.push(...content);
  }

  /** write the generated file to disk */
  commit() {
    let content = this.header.output();
    if (this._content.length > 0) {
      content += '\n' + serialize(this._content);
    }
    if (!content.endsWith('\n')) {
      content += '\n';
    }
    this._entry.content = content;
    this._entry.writeContentsSync();
  }
}

/**
 * get the output text for one or more strings or chunks
 */
export function serialize(content: Output): string {
  if (Array.isArray(content)) {
    return content.map(serialize).join('');
  }
  return typeof content === 'string' ? content : content.output();
}

function writeComment(text: string | string[], type: 'block' | 'line'): string {
  const lines = Array.isArray(text) ? text : text.split('\n');
  if (type === 'line') {
    return lines.map((line) => `// ${line}`).join('\n');
  }
  return `/**\n${lines.map((line) => ` * ${line}`).join('\n')}\n */`;
}
