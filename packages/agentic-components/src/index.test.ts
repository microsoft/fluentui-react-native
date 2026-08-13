import * as components from './index';

const compositionHelpers = [
  components.useAccordion_unstable,
  components.useAccordionStyles_unstable,
  components.renderAccordion_unstable,
  components.useAvatar_unstable,
  components.useAvatarStyles_unstable,
  components.renderAvatar_unstable,
  components.useBadge_unstable,
  components.useBadgeStyles_unstable,
  components.renderBadge_unstable,
  components.useButton_unstable,
  components.useButtonStyles_unstable,
  components.renderButton_unstable,
  components.useCard_unstable,
  components.useCardStyles_unstable,
  components.renderCard_unstable,
  components.useCheckbox_unstable,
  components.useCheckboxStyles_unstable,
  components.renderCheckbox_unstable,
  components.useDivider_unstable,
  components.useDividerStyles_unstable,
  components.renderDivider_unstable,
  components.useInput_unstable,
  components.useInputStyles_unstable,
  components.renderInput_unstable,
  components.useListItem_unstable,
  components.useListItemStyles_unstable,
  components.renderListItem_unstable,
  components.useListboxItem_unstable,
  components.useListboxItemStyles_unstable,
  components.renderListboxItem_unstable,
  components.useMenuItem_unstable,
  components.useMenuItemStyles_unstable,
  components.renderMenuItem_unstable,
  components.useProgressBar_unstable,
  components.useProgressBarStyles_unstable,
  components.renderProgressBar_unstable,
  components.useRadio_unstable,
  components.useRadioStyles_unstable,
  components.renderRadio_unstable,
  components.useSkeleton_unstable,
  components.useSkeletonStyles_unstable,
  components.renderSkeleton_unstable,
  components.useSpinner_unstable,
  components.useSpinnerStyles_unstable,
  components.renderSpinner_unstable,
  components.useSwitch_unstable,
  components.useSwitchStyles_unstable,
  components.renderSwitch_unstable,
  components.useTab_unstable,
  components.useTabStyles_unstable,
  components.renderTab_unstable,
  components.useTag_unstable,
  components.useTagStyles_unstable,
  components.renderTag_unstable,
] as const;

describe('component composition exports', () => {
  it('exports each state, style, and render helper', () => {
    expect(compositionHelpers).toHaveLength(54);
    compositionHelpers.forEach((helper) => {
      expect(helper).toEqual(expect.any(Function));
    });
  });
});
