import type { BreadcrumbSize } from './Breadcrumb.types';

export interface BreadcrumbSizeTokens {
  buttonHeight: number;
  dividerSize: number;
  fontSize: number;
  iconSize: number;
  lineHeight: number;
  paddingHorizontal: number;
}

export interface BreadcrumbTokens {
  gap: number;
  sizes: Record<BreadcrumbSize, BreadcrumbSizeTokens>;
}

export const breadcrumbTokens: BreadcrumbTokens = {
  gap: 0,
  sizes: {
    small: {
      buttonHeight: 24,
      dividerSize: 12,
      fontSize: 12,
      iconSize: 12,
      lineHeight: 16,
      paddingHorizontal: 6,
    },
    medium: {
      buttonHeight: 32,
      dividerSize: 16,
      fontSize: 14,
      iconSize: 16,
      lineHeight: 20,
      paddingHorizontal: 6,
    },
    large: {
      buttonHeight: 40,
      dividerSize: 20,
      fontSize: 16,
      iconSize: 20,
      lineHeight: 22,
      paddingHorizontal: 8,
    },
  },
};
