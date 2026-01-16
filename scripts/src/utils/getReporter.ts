import { createReporter, type Reporter } from '@rnx-kit/reporter';

const reporter = createReporter({
  name: 'fluentui-scripts reporter',
  packageName: '@fluentui-react-native/scripts',
});

/**
 * Get the reporter instance for logging.
 */
export function getReporter(): Reporter {
  return reporter;
}
