import type { Chunk, Output } from './file.ts';
import { serialize } from './file.ts';

type RampEntry = Chunk & {
  raw: Output;
  count: number;
  name?: string;
};

/**
 * A ramp is a collection of categorized values that track their usage and combines them into named entries when they meet a
 * usage threshold
 */
export class Ramp implements Chunk {
  private _exported: boolean;
  private _useThreshold: number;
  private _ramps: Record<string, Record<string, RampEntry>>;
  private _resolved?: Record<string, RampEntry[] | undefined>;

  constructor(exported: boolean = false, useThreshold: number = 2) {
    this._exported = exported;
    this._useThreshold = useThreshold;
    this._ramps = {};
  }

  /**
   * Add a value to the ramp
   * @param rampCategory The category of the ramp (e.g., 'color').
   * @param rawValue The raw value to add to the ramp.
   * @returns The created or updated ramp entry.
   */
  add(rampCategory: string, rawValue: Output): Chunk {
    const ramp = (this._ramps[rampCategory] ??= {});
    const valueKey = serialize(rawValue);
    const entry = (ramp[valueKey] ??= createRampEntry(rawValue));
    entry.count++;
    return entry;
  }

  resolveEntries() {
    if (this._resolved) return;
    this._resolved = {};
    for (const rampKey in this._ramps) {
      let index = 1;
      for (const entry of Object.values(this._ramps[rampKey])) {
        if (entry.count >= this._useThreshold) {
          entry.name = createEntryName(entry, rampKey, index++);
        }
      }
      this._resolved[rampKey] = Object.values(this._ramps[rampKey])
        .filter((entry) => entry.name)
        .sort((a, b) => a.name!.localeCompare(b.name!));
    }
  }

  output(): string {
    const prefix = this._exported ? 'export const ' : 'const ';
    let output = '';
    for (const rampKey in this._ramps) {
      const entries = Object.values(this._ramps[rampKey]).filter((entry) => entry.name);
      if (rampKey === 'color') {
        entries.sort((a, b) => a.name!.localeCompare(b.name!));
      }
      if (entries.length > 0) {
        output += entries.map((entry) => `${prefix}${entry.name} = ${serialize(entry.raw)};`).join('\n') + '\n\n';
      }
    }
    return output;
  }
}

function createRampEntry(raw: Output): RampEntry {
  const entry = { raw, count: 0, name: undefined };
  return Object.assign(entry, { output: () => entry.name ?? serialize(entry.raw) });
}

// hex color strings will come in quoted with either ' or "
const HEX_COLOR = /^['"]#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})['"]$/;

function createEntryName(entry: RampEntry, rampCategory: string, lastIndex: number): string {
  if (rampCategory === 'color') {
    // if the color entry has a hex value, use the full hex value as the name (without the #)
    const rawText = serialize(entry.raw);
    if (HEX_COLOR.test(rawText)) {
      return 'rgb' + rawText.slice(2, -1);
    }
  }
  // otherwise use the prefix with a number
  return `${rampCategory}${lastIndex}`;
}
