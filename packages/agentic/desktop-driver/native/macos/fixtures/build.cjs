const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

if (process.platform !== 'darwin') throw new Error('The AppKit application fixture requires macOS.');
if (!process.argv[2]) throw new Error('Usage: node native/macos/fixtures/build.cjs <output-directory>');

const directory = path.resolve(process.argv[2]);
const bundle = path.join(directory, 'FurnOwnershipFixture.app');
const executable = path.join(bundle, 'Contents', 'MacOS', 'fixture');
const bundleIdentifier = 'com.microsoft.furn.application-ownership-fixture';
fs.mkdirSync(path.dirname(executable), { recursive: true });

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 120_000 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed: ${result.stderr || result.stdout}`);
}

run('xcrun', ['swiftc', '-parse-as-library', '-framework', 'AppKit', path.join(__dirname, 'ApplicationFixture.swift'), '-o', executable]);
fs.writeFileSync(
  path.join(bundle, 'Contents', 'Info.plist'),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0"><dict>',
    `<key>CFBundleIdentifier</key><string>${bundleIdentifier}</string>`,
    '<key>CFBundleName</key><string>FurnOwnershipFixture</string>',
    '<key>CFBundleExecutable</key><string>fixture</string>',
    '<key>CFBundlePackageType</key><string>APPL</string>',
    '<key>CFBundleVersion</key><string>1</string>',
    '<key>NSPrincipalClass</key><string>NSApplication</string>',
    '</dict></plist>',
    '',
  ].join('\n'),
);
run('codesign', ['--force', '--sign', process.env.FURN_DESKTOP_DRIVER_MACOS_SIGNING_IDENTITY || '-', '--timestamp=none', bundle]);
run('codesign', ['--verify', '--strict', bundle]);
process.stdout.write(`${JSON.stringify({ bundle, executable, bundleIdentifier, windowTitle: 'FURN Application Ownership Fixture' })}\n`);
