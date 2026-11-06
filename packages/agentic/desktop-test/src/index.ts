export { claimDesktopWorkload, DesktopSupervisor } from './supervisor.js';
export type { DesktopSupervisorOptions } from './supervisor.js';
export { startNativeDesktopService } from './driverService.js';
export type { DesktopServiceOptions } from './driverService.js';
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
