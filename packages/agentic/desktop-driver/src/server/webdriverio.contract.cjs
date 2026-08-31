const { remote } = require('webdriverio');

async function main() {
  const url = new URL(process.argv[2]);
  const target = process.argv[3];
  const capabilities = Object.assign(
    {
      browserName: 'furn-native-desktop',
      platformName: 'windows',
    },
    { 'furn:target': target },
  );
  const browser = await remote({
    logLevel: 'silent',
    hostname: url.hostname,
    port: Number(url.port),
    path: '/',
    capabilities,
  });

  try {
    const button = await browser.$('~button-primary');
    const result = {
      enabled: await button.isEnabled(),
      screenshot: await browser.takeScreenshot(),
      tagName: await button.getTagName(),
    };
    await button.click();
    process.stdout.write(JSON.stringify(result));
  } finally {
    await browser.deleteSession();
  }
}

main().catch((error) => {
  process.stderr.write(error.stack ?? error.message);
  process.exitCode = 1;
});
