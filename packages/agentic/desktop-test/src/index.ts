export { claimDesktopWorkload, DesktopSupervisor, startNativeDesktopService } from './supervisor.js';
export type { DesktopSupervisorOptions } from './supervisor.js';
export { DesktopServiceScope, DesktopStopRequested } from './services.js';
export { defineDesktopConfig, loadDesktopConfig, resolveDesktopSpecs, validateDesktopConfig } from './config.js';
export type { DesktopConfig, DesktopTargetConfig, DesktopWdioSuite, ResolvedDesktopConfig, ResolvedDesktopTarget } from './config.js';
export type { DesktopIntegration } from './integration.js';
export { desktopStageCommands, resolveDesktopApplication } from './adapters.js';
