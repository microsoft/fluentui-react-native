import { FSEntry } from '@rnx-kit/tools-filesystem';

const defaultHeader = `/**
 * WARNING: This file is auto-generated. Do not edit it manually.
 */
`;

export type FileGenOptions = {
  tabWidth?: number;
  lineWidth?: number;
};

export class FileGenerator {
  private _content: string = '';
  private _tab: string;
  private _lineWidth: number;
  private _entry: FSEntry;

  constructor(filePath: string, header: string | undefined = defaultHeader, options: FileGenOptions = {}) {
    this._entry = new FSEntry(filePath);
    this._tab = ' '.repeat(options.tabWidth ?? 2);
    this._lineWidth = options.lineWidth ?? 140;
    if (header) {
      this._content += header + '\n';
    }
  }

  addLine(content: string) {
    this._content += content;
    if (!content.endsWith('\n')) {
      this._content += '\n';
    }
  }

  addEmptyLine() {
    if (!this._content.endsWith('\n')) {
      this._content += '\n';
    }
    this._content += '\n';
  }

  addExportConstant(name: string, value: string | number | boolean) {
    if (typeof value === 'string') {
      this.addLine(`export const ${name} = '${value}';`);
    } else if (typeof value === 'number') {
      this.addLine(`export const ${name} = ${value};`);
    } else {
      this.addLine(`export const ${name} = ${value ? 'true' : 'false'};`);
    }
  }

  addExportFrom(exports: string[], from: string, exportType?: boolean) {
    // try single-line first
    let line = `export ${exportType ? 'type ' : ''}{ ${exports.join(', ')} } from '${from}';`;
    if (line.length > this._lineWidth) {
      // multi-line
      line = `export ${exportType ? 'type ' : ''}{\n`;
      for (const exp of exports) {
        line += `${this._tab}${exp},\n`;
      }
      line += `} from '${from}';`;
    }
    this.addLine(line);
  }

  addImportFrom(imports: string[], from: string, importType?: boolean) {
    // try single-line first
    let line = `import ${importType ? 'type ' : ''}{ ${imports.join(', ')} } from '${from}';`;
    if (line.length > this._lineWidth) {
      // multi-line
      line = `import ${importType ? 'type ' : ''}{\n`;
      for (const imp of imports) {
        line += `${this._tab}${imp},\n`;
      }
      line += `} from '${from}';`;
    }
    this.addLine(line);
  }

  finish() {
    if (this._content && this._content.length > 0) {
      if (!this._content.endsWith('\n')) {
        this._content += '\n';
      }
      this._entry.content = this._content;
      this._entry.writeContentsSync();
    }
  }
}
