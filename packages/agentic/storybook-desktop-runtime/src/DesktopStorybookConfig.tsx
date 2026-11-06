import * as React from 'react';

export type DesktopRuntimeSelection = {
  cancelled?: boolean;
  connectionEpoch: string;
  previewGeneration: number;
  requestId: string;
  runId: string;
  selectionSequence: number;
  storyId: string;
};

export type DesktopStorybookRuntimeInstance = {
  bridgeNonce?: string;
  endpoint?: 'macos' | 'windows' | 'win32';
  instanceId?: string;
  platformManifestDigest?: string;
  portablePlanDigest?: string;
  storybookPort?: number;
  targetId?: string;
  testIDPrefix?: string;
};

type DesktopStorybookConfig = {
  cancelStory(requestId?: string): void;
  connectBridge(epoch: string): void;
  isCurrentSelection(selection: DesktopRuntimeSelection): boolean;
  prepareStory(selection: Omit<DesktopRuntimeSelection, 'previewGeneration'>): void;
  runtimeInstance?: DesktopStorybookRuntimeInstance;
  selection?: DesktopRuntimeSelection;
  testIDPrefix: string;
};

const defaultConfig: DesktopStorybookConfig = {
  cancelStory: () => undefined,
  connectBridge: () => undefined,
  isCurrentSelection: () => false,
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
  const currentSelection = React.useRef<DesktopRuntimeSelection | undefined>(undefined);
  const connectionEpoch = React.useRef<string | undefined>(undefined);
  const connectBridge = React.useCallback((epoch: string) => {
    if (connectionEpoch.current !== epoch) {
      connectionEpoch.current = epoch;
      currentSelection.current = undefined;
      setSelection(undefined);
    }
  }, []);
  const prepareStory = React.useCallback((next: Omit<DesktopRuntimeSelection, 'previewGeneration'>) => {
    if (next.connectionEpoch !== connectionEpoch.current || next.selectionSequence <= (currentSelection.current?.selectionSequence ?? 0)) {
      return;
    }
    const current = { ...next, previewGeneration: (currentSelection.current?.previewGeneration ?? 0) + 1 };
    currentSelection.current = current;
    setSelection(current);
  }, []);
  const cancelStory = React.useCallback((requestId?: string) => {
    const current = currentSelection.current;
    if (current && (requestId === undefined || current.requestId === requestId)) {
      currentSelection.current = { ...current, cancelled: true };
      setSelection(currentSelection.current);
    }
  }, []);
  const isCurrentSelection = React.useCallback(
    (candidate: DesktopRuntimeSelection) => currentSelection.current === candidate && !candidate.cancelled,
    [],
  );
  const value = React.useMemo(
    () => ({ cancelStory, connectBridge, isCurrentSelection, prepareStory, runtimeInstance, selection, testIDPrefix }),
    [cancelStory, connectBridge, isCurrentSelection, prepareStory, runtimeInstance, selection, testIDPrefix],
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
