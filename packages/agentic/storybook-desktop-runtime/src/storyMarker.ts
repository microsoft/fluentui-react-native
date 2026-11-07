/** Data-only version 1 contract, verified by desktop-driver without an on-device driver dependency. */
export type DesktopStoryMarker = {
  connectionEpoch: string;
  markerVersion: 1;
  previewGeneration: number;
  requestId: string;
  runId: string;
  storyId: string;
};

export function createStoryMarker(selection: Omit<DesktopStoryMarker, 'markerVersion'>): DesktopStoryMarker {
  return {
    connectionEpoch: selection.connectionEpoch,
    markerVersion: 1,
    previewGeneration: selection.previewGeneration,
    requestId: selection.requestId,
    runId: selection.runId,
    storyId: selection.storyId,
  };
}
