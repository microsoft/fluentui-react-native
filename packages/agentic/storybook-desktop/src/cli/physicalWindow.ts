import { execFile } from 'node:child_process';

import type { Rect } from '@fluentui-react-native/desktop-driver';
import type { DesktopSessionClient } from '@fluentui-react-native/desktop-driver/client';

const width = 1024;
const height = 768;

const visibleScreensScript = [
  "ObjC.import('AppKit');",
  'function run() {',
  '  const screens = $.NSScreen.screens;',
  '  if (screens.count === 0) return "[]";',
  '  const primary = screens.objectAtIndex(0).frame;',
  '  const top = primary.origin.y + primary.size.height;',
  '  const result = [];',
  '  for (let index = 0; index < screens.count; index += 1) {',
  '    const frame = screens.objectAtIndex(index).visibleFrame;',
  '    result.push({',
  '      x: frame.origin.x,',
  // AX and WebDriver use a top-left origin; AppKit uses a bottom-left origin.
  '      y: top - frame.origin.y - frame.size.height,',
  '      width: frame.size.width,',
  '      height: frame.size.height,',
  '    });',
  '  }',
  '  return JSON.stringify(result);',
  '}',
].join('\n');

export async function readMacOSVisibleScreenFrames(signal: AbortSignal): Promise<readonly Rect[]> {
  if (process.platform !== 'darwin') throw new Error('macOS physical-lane window setup requires a local macOS display.');
  const output = await new Promise<string>((resolve, reject) => {
    execFile(
      '/usr/bin/osascript',
      ['-l', 'JavaScript', '-e', visibleScreensScript],
      { encoding: 'utf8', signal, timeout: 5000, maxBuffer: 65_536 },
      (error, stdout) => {
        if (error) reject(new Error('Could not read macOS visible screen bounds for physical-lane window setup.', { cause: error }));
        else resolve(stdout);
      },
    );
  });
  const frames: unknown = JSON.parse(output);
  if (!Array.isArray(frames) || frames.length > 64 || !frames.every(isRect)) {
    throw new Error('The macOS visible-screen query returned invalid window bounds.');
  }
  return frames;
}

export async function preparePhysicalWindow(
  session: DesktopSessionClient,
  signal: AbortSignal,
  visibleScreenFrames: typeof readMacOSVisibleScreenFrames = readMacOSVisibleScreenFrames,
): Promise<void> {
  const current = await session.command<Rect>('GET', '/window/rect', undefined, signal);
  if (!isRect(current)) throw new Error('The macOS host returned an invalid window rectangle.');
  const screens = await visibleScreenFrames(signal);
  let chosen: { rect: Rect; overlap: number } | undefined;
  for (const screen of screens) {
    if (!isRect(screen)) throw new Error('The macOS visible-screen query returned invalid window bounds.');
    const minX = Math.ceil(screen.x);
    const minY = Math.ceil(screen.y);
    const maxX = Math.floor(screen.x + screen.width - width);
    const maxY = Math.floor(screen.y + screen.height - height);
    if (maxX < minX || maxY < minY) continue;
    const overlap =
      Math.max(0, Math.min(current.x + current.width, screen.x + screen.width) - Math.max(current.x, screen.x)) *
      Math.max(0, Math.min(current.y + current.height, screen.y + screen.height) - Math.max(current.y, screen.y));
    if (!chosen || overlap > chosen.overlap) {
      chosen = {
        overlap,
        rect: {
          // Avoid screen-edge constraints changing the requested size during the native resize.
          x: Math.min(maxX, Math.max(minX, Math.round(screen.x + (screen.width - width) / 2))),
          y: Math.min(maxY, Math.max(minY, Math.round(screen.y + (screen.height - height) / 2))),
          width,
          height,
        },
      };
    }
  }
  if (!chosen) throw new Error('No visible macOS screen can fit the physical-lane 1024x768 window.');
  await session.command('POST', '/window/rect', chosen.rect, signal);
  const actual = await session.command<Rect>('GET', '/window/rect', undefined, signal);
  if (!isRect(actual) || actual.x !== chosen.rect.x || actual.y !== chosen.rect.y || actual.width !== width || actual.height !== height) {
    throw new Error('The macOS host did not establish the physical-lane 1024x768 window inside visible screen bounds.');
  }
}

function isRect(value: unknown): value is Rect {
  if (!value || typeof value !== 'object') return false;
  const rect = value as Partial<Rect>;
  return (
    typeof rect.x === 'number' &&
    typeof rect.y === 'number' &&
    typeof rect.width === 'number' &&
    typeof rect.height === 'number' &&
    Number.isFinite(rect.x) &&
    Number.isFinite(rect.y) &&
    Number.isFinite(rect.width) &&
    Number.isFinite(rect.height) &&
    Number.isFinite(rect.x + rect.width) &&
    Number.isFinite(rect.y + rect.height) &&
    rect.width > 0 &&
    rect.height > 0
  );
}
