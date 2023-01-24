export interface IAppearanceAdditions {
  readonly horizontalSizeClass: SizeClass;
  readonly userInterfaceLevel: UserInterfaceLevel;
}

export const HorizontalSizeClassKey = 'horizontalSizeClass';
export type SizeClass = 'compact' | 'regular';

export const UserInterfaceLevelKey = 'userInterfaceLevel';
export type UserInterfaceLevel = 'base' | 'elevated';
