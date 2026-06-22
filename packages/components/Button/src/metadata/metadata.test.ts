import { validateMetadata } from '@fluentui-react-native/analyzer';

import * as metadataModule from './index';

describe('metadata', () => {
  for (const [exportName, value] of Object.entries(metadataModule)) {
    if (!exportName.endsWith('Metadata')) {
      continue;
    }
    it(`${exportName} validates against the ComponentMetadata schema`, () => {
      const result = validateMetadata(value);
      const errors = result.issues.filter((issue) => issue.severity === 'error');
      const warnings = result.issues.filter((issue) => issue.severity === 'warning');
      expect({ errors, warnings }).toEqual({ errors: [], warnings: [] });
    });
  }
});
