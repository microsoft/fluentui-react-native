export { claimDesktopWorkload, DesktopSupervisor, startNativeDesktopService } from './supervisor.js';
export type { DesktopServiceOptions, DesktopSupervisorOptions } from './supervisor.js';
export { createNativeAgentPublisher, defaultAgentDescriptor } from './agentConnection.js';
export type {
  DesktopAgentConnection,
  DesktopAgentConnectionOptions,
  DesktopAgentTarget,
  PublishDesktopAgentConnection,
} from './agentConnection.js';
export { DesktopServiceScope, DesktopStopRequested } from './services.js';
export { defineDesktopConfig, loadDesktopConfig, resolveDesktopSpecs, validateDesktopConfig } from './config.js';
export type { DesktopConfig, DesktopTargetConfig, DesktopWdioSuite, ResolvedDesktopConfig, ResolvedDesktopTarget } from './config.js';
export type { DesktopIntegration } from './integration.js';
export { desktopStageCommands, resolveDesktopApplication } from './adapters.js';
export type { ResolveDesktopApplicationOptions } from './adapters.js';
