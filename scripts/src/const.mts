// env variable to signal the current platform for scripts that need to know (like jest)
export const PLATFORM_ENV_VAR = 'FURN_RN_PLATFORM' as const;
// env variable to signal that we're in fix mode for scripts that support it
export const FIX_ENV_VAR = 'FURN_FIX_MODE' as const;

export const REACT_PLATFORM = 'react' as const;
export const NATIVE_PLATFORMS = ['ios', 'android', 'windows', 'macos', 'win32'] as const;
export const DEFULT_WIN_PLATFORM = 'win32' as const;
export const ALL_PLATFORMS = [...NATIVE_PLATFORMS, REACT_PLATFORM] as const;
