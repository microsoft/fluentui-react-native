/** @jsxImportSource @fluentui-react-native/framework-base */
import { Pressable, View } from 'react-native';

import { Icon } from '../../primitives/icon/icon';
import { getListboxItemCheckmarkSize, getListboxItemIconSize, listboxItemStyles } from './listbox-item.styles';
import type { ListboxItemState } from './listbox-item.types';

const checkmarkIcon = { fontSource: { codepoint: 0x2713, fontFamily: 'Arial' } } as const;
const chevronIcon = { fontSource: { codepoint: 0x203a, fontFamily: 'Arial' } } as const;

export function renderListboxItem_unstable(state: ListboxItemState) {
  if (state.variant === 'sectionHeader' && state.loading) {
    return (
      <View {...state.headerProps}>
        <View style={listboxItemStyles.loadingRow}>
          <View
            style={[
              listboxItemStyles.loadingIcon,
              {
                backgroundColor: state.tokens.color.backgroundNeutralSubtle,
                height: getListboxItemIconSize(),
                width: getListboxItemIconSize(),
              },
            ]}
          />
          <View
            style={[
              listboxItemStyles.loadingLabel,
              {
                backgroundColor: state.tokens.color.backgroundNeutralSubtle,
                height: 24,
                maxWidth: 320,
                width: '100%',
              },
            ]}
          />
        </View>
      </View>
    );
  }

  if (state.variant === 'sectionHeader') {
    return (
      <View {...state.headerProps}>
        <View style={listboxItemStyles.leading}>{state.content && <state.content />}</View>
      </View>
    );
  }

  const ActiveIcon = state.selected ? state.selectedIcon ?? state.icon : state.icon;

  return (
    <Pressable {...state.rootProps}>
      <View style={[listboxItemStyles.leading, state.secondaryContentPosition === 'under' && listboxItemStyles.leadingUnder]}>
        {state.avatar && <state.avatar />}
        {!state.avatar && ActiveIcon && <ActiveIcon />}
        <View style={state.secondaryContentPosition === 'under' ? listboxItemStyles.contentColumn : listboxItemStyles.contentRow}>
          <View style={listboxItemStyles.labelContainer}>
            {state.contentHidden && <state.contentHidden />}
            {state.content && <state.content />}
          </View>
          {state.secondaryContentPosition === 'right' && state.secondaryContent && <state.secondaryContent />}
          {state.secondaryContentPosition === 'under' && state.secondaryContent && <state.secondaryContent />}
        </View>
      </View>

      <View style={listboxItemStyles.trailing}>
        {state.chevron && (
          <Icon
            {...chevronIcon}
            accessible={false}
            color={state.tokens.color.foregroundNeutralPrimary}
            height={getListboxItemIconSize()}
            width={getListboxItemIconSize()}
          />
        )}
        {state.checkmark && state.selected && (
          <Icon
            {...checkmarkIcon}
            accessible={false}
            color={state.tokens.color.foregroundNeutralPrimary}
            height={getListboxItemCheckmarkSize()}
            width={getListboxItemCheckmarkSize()}
          />
        )}
        {state.multiselect && (
          <View
            accessible={false}
            style={[
              listboxItemStyles.checkboxBox,
              {
                backgroundColor: state.selected ? state.tokens.color.backgroundBrandHeavy : state.tokens.color.backgroundNeutralTransparent,
                borderColor: state.selected ? state.tokens.color.backgroundBrandHeavy : state.tokens.color.foregroundNeutralSecondary,
                height: getListboxItemCheckmarkSize(),
                width: getListboxItemCheckmarkSize(),
              },
            ]}
          >
            {state.selected && <Icon {...checkmarkIcon} accessible={false} color={state.tokens.color.foregroundNeutralOnloud} height={12} width={12} />}
          </View>
        )}
      </View>
    </Pressable>
  );
}
