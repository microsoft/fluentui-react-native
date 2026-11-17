export { DesktopSupervisor } from './supervisor.js';
export type { DesktopSupervisorOptions } from './supervisor.js';
export { createDesktopWorkloadClaim, inspectDesktopWorkloadClaim } from './ownership.js';
export type {
  DesktopWorkloadClaim,
  DesktopWorkloadClaimInspection,
  DesktopWorkloadOwnerIdentity,
  DesktopWorkloadOwnerProbe,
  DesktopWorkloadOwnershipRecord,
  DesktopUnresolvedEffect,
} from './ownership.js';
export { orderDesktopResourceContributions, validateDesktopResourcePlan } from './resources.js';
export type {
  DesktopResourceContext,
  DesktopResourceContribution,
  DesktopResourceDisposal,
  DesktopResourceOwnership,
  DesktopResourcePlan,
  DesktopResourceReadiness,
  DesktopResourceRecord,
  DesktopResourceServiceReadyRecord,
} from './resources.js';
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
export { createDesktopRunContext } from './runContext.js';
export type { DesktopRunContext } from './runContext.js';
export { acquireHostedDesktopDriver, desktopHostReady, formatDesktopHostReady, publishDesktopHostManagement } from './hostedDriver.js';
export type { DesktopHostReady } from './hostedDriver.js';
export { handleDesktopInterrupts } from './signals.js';
export type { DesktopInterruptHandlers } from './signals.js';
export { defineDesktopConfig, loadDesktopConfig, resolveDesktopSpecs, resolveDesktopTestScope, validateDesktopConfig } from './config.js';
export type { DesktopConfig, DesktopTargetConfig, DesktopWdioSuite, ResolvedDesktopConfig, ResolvedDesktopTarget } from './config.js';
export type {
  DesktopIntegration,
  DesktopIntegrationAction,
  DesktopIntegrationPlan,
  DesktopIntegrationRequest,
  DesktopIntegrationWorkloadContext,
  DesktopHostedDriverReady,
  DesktopHostedDriverContribution,
  DesktopIntegrationReadinessValue,
  DesktopIntegrationManagedWorkloadContext,
  DesktopIntegrationAttachedWorkloadContext,
} from './integration.js';
export { desktopStageCommands, resolveDesktopApplication } from './adapters.js';
export type { ResolveDesktopApplicationOptions } from './adapters.js';
