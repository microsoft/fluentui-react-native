import { execFile } from 'node:child_process';

import type { Rect } from '@fluentui-react-native/desktop-driver';
import type { DesktopSessionClient } from '@fluentui-react-native/desktop-driver/client';

const target = { width: 1024, height: 768 };
const edgeInset = 1;

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
    throw new Error(`The macOS visible-screen query returned invalid window bounds: ${JSON.stringify(frames)}.`);
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
  let chosen: { rect: Rect; area: number; overlap: number } | undefined;
  for (const screen of screens) {
    if (!isRect(screen)) {
      throw new Error(`The macOS visible-screen query returned invalid window bounds. Visible frames: ${JSON.stringify(screens)}.`);
    }
    const minX = Math.ceil(screen.x + edgeInset);
    const minY = Math.ceil(screen.y + edgeInset);
    const maxVisibleX = Math.floor(screen.x + screen.width - edgeInset);
    const maxVisibleY = Math.floor(screen.y + screen.height - edgeInset);
    const windowWidth = Math.min(target.width, maxVisibleX - minX);
    const windowHeight = Math.min(target.height, maxVisibleY - minY);
    if (windowWidth <= 0 || windowHeight <= 0) continue;
    const maxX = maxVisibleX - windowWidth;
    const maxY = maxVisibleY - windowHeight;
    const overlap =
      Math.max(0, Math.min(current.x + current.width, screen.x + screen.width) - Math.max(current.x, screen.x)) *
      Math.max(0, Math.min(current.y + current.height, screen.y + screen.height) - Math.max(current.y, screen.y));
    const area = windowWidth * windowHeight;
    if (!chosen || area > chosen.area || (area === chosen.area && overlap > chosen.overlap)) {
      chosen = {
        area,
        overlap,
        rect: {
          x: Math.min(maxX, Math.max(minX, Math.round(screen.x + (screen.width - windowWidth) / 2))),
          y: Math.min(maxY, Math.max(minY, Math.round(screen.y + (screen.height - windowHeight) / 2))),
          width: windowWidth,
          height: windowHeight,
        },
      };
    }
  }
  if (!chosen) {
    throw new Error(
      `No visible macOS screen can host a positive physical-lane window (target ${target.width}x${target.height}). Visible frames: ${JSON.stringify(screens)}.`,
    );
  }
  await session.command('POST', '/window/rect', chosen.rect, signal);
  const actual = await session.command<Rect>('GET', '/window/rect', undefined, signal);
  if (
    !isRect(actual) ||
    actual.x !== chosen.rect.x ||
    actual.y !== chosen.rect.y ||
    actual.width !== chosen.rect.width ||
    actual.height !== chosen.rect.height
  ) {
    throw new Error(
      `The macOS host did not establish the requested physical-lane window ${JSON.stringify(chosen.rect)}; received ${JSON.stringify(actual)}. Visible frames: ${JSON.stringify(screens)}.`,
    );
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
