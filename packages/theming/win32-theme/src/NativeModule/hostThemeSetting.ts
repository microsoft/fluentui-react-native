// The ThemingModule currently only stores its initial host theme state
// This state is never updated (it's a constant on the native module)
// This can cause issues if the host theme has changed and you want to
// query for the current state of the host theme. (i.e. you're spinning up
// a new instance of a theme and don't have something already keeping track
// of changes to the theme).
// Unfortunately, native changes take a long time to roundtrip,
// so as a workaround we store a copy of that information instead to last the
// entire lifetime of the instance.
export interface CurrentHostThemeState {
  hostThemeSetting: string;
  colorScheme?: 'light' | 'dark';
  isHighContrast?: boolean;
}

let currentHostThemeState: CurrentHostThemeState = { hostThemeSetting: '' };

export const getCurrentHostThemeSetting = () => currentHostThemeState.hostThemeSetting;

export const getCurrentHostThemeState = () => currentHostThemeState;

export const setCurrentHostThemeSetting = (hostThemeSetting: string) => {
  currentHostThemeState = { hostThemeSetting };
};

export const setCurrentHostThemeState = (state: CurrentHostThemeState) => {
  currentHostThemeState = state;
};
