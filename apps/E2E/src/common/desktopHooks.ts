import path from 'node:path';
import { createHash } from 'node:crypto';
import { createDesktopDriverClient, DesktopSessionClient } from '@fluentui-react-native/desktop-driver';
import { ArtifactManager, captureDesktopFailureEvidence } from '@fluentui-react-native/desktop-driver/artifacts';
import { createDesktopReportSession } from '@fluentui-react-native/desktop-test/reporting';
import type { DesktopReportSession } from '@fluentui-react-native/desktop-test/reporting';
import { installLegacyDesktopAttributes } from './nativeDesktop';

let reporting: DesktopReportSession | undefined;

export default {
  // The page objects were written for WebdriverIO 9, where `$` takes the first match, and a native tree can expose
  // several elements for one testID. Keep that behavior instead of throwing a StrictSelectorError.
  beforeSession(config: { strictSelectors?: boolean }) {
    config.strictSelectors = false;
  },
  async before() {
    reporting = await createDesktopReportSession({ artifactsRoot: path.resolve('artifacts', 'desktop'), kind: 'lifecycle' });
    installLegacyDesktopAttributes();
    // Native cohorts use the app's initial bounds and native scrolling, not an emulated maximize command.
    const { width, height } = await browser.getWindowRect();
    if (width <= 0 || height <= 0) throw new Error('The native tester window has no usable bounds.');
  },
  async afterTest(test: { fullTitle?: string; title: string }, _context: unknown, outcome: { passed: boolean }) {
    if (outcome.passed || !reporting) return;
    const reporter = reporting.reporter;
    const name = createHash('sha256')
      .update(JSON.stringify([test.fullTitle ?? test.title, Date.now()]))
      .digest('hex')
      .slice(0, 24);
    const root = reporter.artifactPath(path.join('evidence', name));
    const url = `${browser.options.protocol}://${browser.options.hostname}:${browser.options.port}${browser.options.path}`;
    const session = new DesktopSessionClient(
      createDesktopDriverClient({ url }),
      browser.sessionId,
      Object.fromEntries(Object.entries(browser.capabilities)),
    );
    const evidence = await captureDesktopFailureEvidence(session, new ArtifactManager(root), 'failure');
    for (const artifact of evidence.artifacts)
      reporter.emit({
        kind: 'artifact',
        payload: { path: path.relative(reporter.root, path.join(root, artifact.path)), description: artifact.kind },
      });
    for (const error of evidence.errors) reporter.fail(new Error(error), 'evidence');
  },
  async afterSession() {
    await reporting?.close();
  },
};
