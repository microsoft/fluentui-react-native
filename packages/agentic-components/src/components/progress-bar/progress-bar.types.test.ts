/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { ProgressBarProps } from './progress-bar.types';
import { Icon } from '../../primitives/icon/icon';

const defaultProgressBarProps: ProgressBarProps = {
  label: 'Uploading photos',
  progress: 42,
  status: 'neutral',
  type: 'determinate',
};

const errorProgressBarProps: ProgressBarProps = {
  label: 'Uploading photos',
  progress: 80,
  showValidationIcon: true,
  status: 'error',
  type: 'determinate',
  validationIcon: {
    fontSource: { codepoint: 0x2716, fontFamily: 'Arial' },
    testID: 'progress-bar-error-icon',
  },
  valueText: 'Upload failed',
};

const validationIconSlot: SlotProp<typeof Icon> = {
  fontSource: { codepoint: 0x2713, fontFamily: 'Arial' },
  height: 16,
  width: 16,
};

// @ts-expect-error Icon sources remain mutually exclusive.
const invalidValidationIconSlot: SlotProp<typeof Icon> = {
  fontSource: { codepoint: 0x2713, fontFamily: 'Arial' },
  imageSource: { uri: 'icon.png' },
};

describe('ProgressBar types', () => {
  it('accepts the public ProgressBar contract and optional validation icon slot', () => {
    expect(defaultProgressBarProps).toBeDefined();
    expect(errorProgressBarProps).toBeDefined();
    expect(validationIconSlot).toBeDefined();
    expect(invalidValidationIconSlot).toBeDefined();
  });
});
