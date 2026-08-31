export type DesktopEndpoint = 'macos' | 'windows' | 'win32';
export type DesktopPlatformName = 'macos' | 'windows';
export type DesktopRenderer = 'fabric' | 'paper';
export type DesktopClickMode = 'physical' | 'accessibility' | 'auto';

export type WebDriverTimeouts = {
  implicit: number;
  pageLoad: number;
  script: number;
};

export type DesktopTimeouts = {
  appLaunch: number;
  nativeCommand: number;
  stableLayout: number;
  storyRender: number;
};

export type NewSessionCapabilities = {
  alwaysMatch?: Record<string, unknown>;
  firstMatch?: Record<string, unknown>[];
};

export type NewSessionRequest = {
  capabilities: NewSessionCapabilities;
};

export type WebDriverElement = {
  'element-6066-11e4-a52e-4f735466cecf': string;
};

export type WebDriverResponse<T = unknown> = {
  value: T;
};

export type WebDriverErrorValue = {
  error: string;
  message: string;
  stacktrace: string;
  data?: Record<string, unknown>;
};

export type WebDriverErrorResponse = WebDriverResponse<WebDriverErrorValue>;

export type WebDriverAction = {
  type: string;
  [key: string]: unknown;
};

export type WebDriverActionSequence = {
  id: string;
  type: 'key' | 'none' | 'pointer' | 'wheel';
  parameters?: Record<string, unknown>;
  actions: WebDriverAction[];
};
