import type { StorybookChannelServer } from '../src/driver/StorybookChannelOrchestrator.js';

export function createControlledChannelServer(options: {
  host: string;
  port: number;
  configPath: string;
  buildIndex(options: { configPath: string }): Promise<unknown>;
  onFailure(error: Error): void;
}): Promise<{
  channel: StorybookChannelServer & { address(): { port: number } };
  close(): Promise<void>;
}>;
