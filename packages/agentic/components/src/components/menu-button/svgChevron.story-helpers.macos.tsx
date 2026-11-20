import { View } from 'react-native';
import type { ButtonSize } from '../button/button.types';
import { MenuItem } from '../menu-item/menu-item';
import { svgChevronAssets } from './chevronAssets.svg';
import { createMenuButtonTokenDefinition } from './menu-button.styles';
import type { MenuButtonProps } from './menu-button.types';
import { renderMenuButton_unstable } from './renderMenuButton';
import { useMenuButtonWithTokens } from './useMenuButton';
import { useMenuButtonStyles_unstable } from './useMenuButtonStyles';

const tokens = createMenuButtonTokenDefinition(svgChevronAssets);

function SvgMenuButton(props: MenuButtonProps) {
  const state = useMenuButtonWithTokens(props, tokens);
  useMenuButtonStyles_unstable(state);
  return renderMenuButton_unstable(state);
}

export function SvgChevronScene() {
  const sizes: readonly ButtonSize[] = ['small', 'medium', 'large'];
  return (
    <View>
      {sizes.map((size) => (
        <SvgMenuButton key={size} size={size} content={size}>
          <MenuItem content="Action" />
        </SvgMenuButton>
      ))}
    </View>
  );
}
