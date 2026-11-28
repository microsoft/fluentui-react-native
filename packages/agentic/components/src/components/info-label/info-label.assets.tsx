/** @jsxImportSource @fluentui-react-native/framework-base */
import { directComponent } from '@fluentui-react-native/framework-base';
import { Info20Regular } from '../../common/generated/fluent-icons/Info20Regular.generated';
import type { IconElementProps } from '../../primitives/icon/icon.types';

const InfoLabelGlyph = directComponent(({ color, ...props }: IconElementProps) => (
  <Info20Regular {...props} primaryFill={color} pointerEvents="none" />
));

export const infoLabelAssets = { Info20Regular: () => InfoLabelGlyph };
