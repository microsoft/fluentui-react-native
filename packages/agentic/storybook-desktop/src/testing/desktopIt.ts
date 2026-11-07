import type { WdioDescriptor, WdioStoryCase, WdioStoryTest } from './types.js';

export function desktopIt(name: string, run: WdioStoryTest): WdioStoryCase;
export function desktopIt(name: string, options: Omit<WdioDescriptor, 'run'>, run: WdioStoryTest): WdioStoryCase;
export function desktopIt(name: string, optionsOrRun: Omit<WdioDescriptor, 'run'> | WdioStoryTest, run?: WdioStoryTest): WdioStoryCase {
  if (!name.trim()) throw new TypeError('A desktop story test requires a non-empty name.');
  const options = typeof optionsOrRun === 'function' ? {} : optionsOrRun;
  const callback = typeof optionsOrRun === 'function' ? optionsOrRun : run;
  if (typeof callback !== 'function') throw new TypeError('A desktop story test requires a callback.');
  return { name, ...options, run: callback };
}
