import * as React from 'react';

export type DesktopRuntimeSelection = {
  previewGeneration: number;
  requestId: string;
  runId: string;
  storyId: string;
};

export type DesktopStorybookRuntimeInstance = {
  bridgeNonce?: string;
  catalogSetDigest?: string;
  endpoint?: 'macos' | 'windows' | 'win32';
  instanceId?: string;
  platformManifestDigest?: string;
  portablePlanDigest?: string;
  storybookPort?: number;
  targetId?: string;
  testIDPrefix?: string;
};

type DesktopStorybookConfig = {
  prepareStory(selection: Omit<DesktopRuntimeSelection, 'previewGeneration'>): void;
  runtimeInstance?: DesktopStorybookRuntimeInstance;
  selection?: DesktopRuntimeSelection;
  testIDPrefix: string;
};

const defaultConfig: DesktopStorybookConfig = {
  prepareStory: () => undefined,
  testIDPrefix: 'storybook-desktop',
};

const DesktopStorybookConfigContext = React.createContext<DesktopStorybookConfig>(defaultConfig);

export function DesktopStorybookConfigProvider({
  children,
  runtimeInstance,
  testIDPrefix,
}: React.PropsWithChildren<Pick<DesktopStorybookConfig, 'runtimeInstance' | 'testIDPrefix'>>) {
  const [selection, setSelection] = React.useState<DesktopRuntimeSelection>();
  const prepareStory = React.useCallback((next: Omit<DesktopRuntimeSelection, 'previewGeneration'>) => {
    setSelection((current) => ({ ...next, previewGeneration: (current?.previewGeneration ?? 0) + 1 }));
  }, []);
  const value = React.useMemo(
    () => ({ prepareStory, runtimeInstance, selection, testIDPrefix }),
    [prepareStory, runtimeInstance, selection, testIDPrefix],
  );
  return <DesktopStorybookConfigContext.Provider value={value}>{children}</DesktopStorybookConfigContext.Provider>;
}

export function useDesktopStorybookConfig(): DesktopStorybookConfig {
  return React.useContext(DesktopStorybookConfigContext);
}

export function useDesktopStorybookTestID(suffix: string): string {
  const { testIDPrefix } = useDesktopStorybookConfig();
  return `${testIDPrefix}-${suffix}`;
}
