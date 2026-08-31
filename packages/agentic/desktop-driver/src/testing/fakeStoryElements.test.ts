import type { DesktopStoryManifest } from '../storybook.js';
import { createFakeStoryWindows } from './fakeStoryElements.js';

describe('createFakeStoryWindows', () => {
  test('derives initial semantic state without pre-applying post-action assertions', () => {
    const manifest: DesktopStoryManifest = {
      endpoint: 'windows',
      entries: [
        {
          id: 'components-checkbox--default',
          name: 'Default',
          packageName: '@fluentui-react-native/components',
          sourcePath: 'src/components/checkbox/checkbox.stories.tsx',
          tags: ['desktop-e2e'],
          tests: {
            version: 1,
            tests: [
              {
                id: 'toggle',
                steps: [
                  { expect: { state: 'role', target: { testId: 'checkbox' }, value: 'checkbox' } },
                  { expect: { state: 'checked', target: { testId: 'checkbox' }, value: false } },
                  { action: 'click', target: { testId: 'checkbox' } },
                  { expect: { state: 'checked', target: { testId: 'checkbox' }, value: true } },
                ],
              },
            ],
          },
          title: 'Components/Checkbox',
        },
      ],
      platformManifestDigest: 'platform',
      portablePlanDigest: 'portable',
      schemaVersion: 1,
    };

    const checkbox = createFakeStoryWindows(manifest)[0].elements.find(({ automationId }) => automationId === 'checkbox');
    expect(checkbox).toMatchObject({ checked: false, role: 'checkbox' });
  });
});
