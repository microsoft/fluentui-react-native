/* eslint-disable @typescript-eslint/no-unused-vars */
import type { SlotProp } from '@fluentui-react-native/framework-base';

import type { TabProps } from './tab.types';
import { Tab } from './tab';

const RegularIcon: SlotProp<typeof Tab> = {
  controls: 'files-panel',
  content: 'Files',
  icon: { fontSource: { codepoint: 0x2606, fontFamily: 'Arial' }, testID: 'regular-icon' },
};

const SelectedIconTab: SlotProp<typeof Tab> = {
  controls: 'favorite-panel',
  content: 'Favorite',
  icon: { fontSource: { codepoint: 0x2606, fontFamily: 'Arial' } },
  selectedIcon: { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' } },
  selected: true,
};

const IconOnlyTab: SlotProp<typeof Tab> = {
  accessibilityLabel: 'Settings',
  controls: 'settings-panel',
  icon: { fontSource: { codepoint: 0x2699, fontFamily: 'Arial' }, testID: 'settings-icon' },
  layout: 'iconOnly',
};

const ReplacementTab = (_props: TabProps) => null;
const ReplacementTabSlot: SlotProp<typeof Tab> = {
  accessibilityLabel: 'Settings',
  as: ReplacementTab,
  controls: 'settings-panel',
  icon: { fontSource: { codepoint: 0x2699, fontFamily: 'Arial' } },
  layout: 'iconOnly',
};

// @ts-expect-error icon-only tabs require an accessibilityLabel.
const MissingIconOnlyLabel: SlotProp<typeof Tab> = {
  controls: 'settings-panel',
  icon: { fontSource: { codepoint: 0x2699, fontFamily: 'Arial' } },
  layout: 'iconOnly',
};

// @ts-expect-error icon-only tabs require an icon.
const MissingIconOnlyIcon: SlotProp<typeof Tab> = {
  accessibilityLabel: 'Settings',
  controls: 'settings-panel',
  layout: 'iconOnly',
};

// @ts-expect-error icon-only tabs cannot render text labels.
const IconOnlyWithContent: SlotProp<typeof Tab> = {
  accessibilityLabel: 'Settings',
  controls: 'settings-panel',
  content: 'Settings',
  icon: { fontSource: { codepoint: 0x2699, fontFamily: 'Arial' } },
  layout: 'iconOnly',
};

describe('Tab slot types', () => {
  it('accepts icon-and-text, selected icon, icon-only, and replacement tab slots', () => {
    expect(RegularIcon).toBeDefined();
    expect(SelectedIconTab).toBeDefined();
    expect(IconOnlyTab).toBeDefined();
    expect(ReplacementTabSlot).toBeDefined();
  });
});
