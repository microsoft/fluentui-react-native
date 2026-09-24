import { FSEntry } from '@rnx-kit/tools-filesystem';

export class CodegenFile {
  private fsEntry: FSEntry;
  private rampedConstants: Record<string, Record<string, string>> = {};
  private lines: string[] = [];
  header: string = `/** Generated file. Do not edit. */`;

  constructor(filePath: string) {
    this.fsEntry = new FSEntry(filePath);
  }

  rampConstant(prefix: string, value: string): string {
    const ramp = (this.rampedConstants[prefix] ??= {});
    return (ramp[value] ??= `${prefix}${Object.keys(ramp).length}`);
  }

  rampString(prefix: string, value: string): string {
    return this.rampConstant(prefix, `'${value}'`);
  }

  private writeRamp(ramp: Record<string, string>): string {
    return Object.entries(ramp)
      .map(([key, value]) => `const ${value} = ${key};`)
      .join('\n');
  }

  private writeAllRamps(): string {
    return Object.values(this.rampedConstants)
      .map((ramp) => this.writeRamp(ramp))
      .join('\n\n');
  }

  addExportConst(name: string, value: string) {
    this.lines.push(`export const ${name} = ${value};`);
  }

  addRaw(line: string) {
    this.lines.push(line);
  }

  finish(): string {
    let content = this.header;
    content += '\n\n' + this.writeAllRamps() + '\n\n';
    content += this.lines.join('\n') + '\n';
    this.fsEntry.content = content;
    this.fsEntry.writeContentsSync();
    return content;
  }
}
