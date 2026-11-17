import path from 'node:path';

import { formatDesktopReporterValue } from '@fluentui-react-native/desktop-driver/cli/reporter';
import type { ResolvedDesktopReporterMode } from '@fluentui-react-native/desktop-driver/cli/reporter';
import { defaultAgentDescriptor } from './agentConnection.js';
import type { DesktopAgentConnectionOptions } from './agentConnection.js';
import type { ResolvedDesktopConfig, ResolvedDesktopTarget } from './config.js';
import type {
  DesktopHostedDriverContribution,
  DesktopHostedDriverReady,
  DesktopIntegrationManagedWorkloadContext,
  DesktopIntegrationReadinessValue,
  DesktopIntegrationRequest,
} from './integration.js';
import { validateDesktopResourceServiceReady } from './resources.js';
import type { DesktopSupervisor } from './supervisor.js';

export type DesktopHostReady = Readonly<{
  type: 'ready';
  url: string;
  targetId: string;
  instanceId: string;
  endpoint: ResolvedDesktopTarget['endpoint'];
  renderer?: ResolvedDesktopTarget['host']['renderer'];
  runId: string;
  agentDescriptor?: string;
  runnerDescriptor?: string;
  supervisorDescriptor?: string;
  integration?: { name: string; details: DesktopIntegrationReadinessValue };
}>;

/** Acquires an integration-hosted driver, then publishes management after independently verifying its descriptor. */
export async function acquireHostedDesktopDriver(options: {
  supervisor: DesktopSupervisor;
  request: DesktopIntegrationRequest;
  driver: DesktopHostedDriverContribution;
  supervisorDescriptor?: string;
  managedWorkload?: (context: DesktopIntegrationManagedWorkloadContext) => Promise<void>;
}): Promise<DesktopHostReady> {
  const { supervisor, request } = options;
  const { target, agent } = request;
  let ready: DesktopHostedDriverReady | undefined;
  await supervisor.services.contribute(
    [
      {
        id: 'hosted-driver',
        ownership: 'owned',
        prepare: () => ({
          identity: `hosted-driver:${target.id}:${target.instanceId}`,
          async acquire() {
            ready = await options.driver.acquire({ ...request, supervisor });
            validateHostedDriver(ready, target, agent);
            return ready.serviceReady;
          },
          async dispose() {
            // The driver's constituent services are registered in the same scope and settle independently.
          },
        }),
      },
    ],
    { targetId: target.id, targetInstanceId: target.instanceId },
  );
  if (!ready) throw new Error('The hosted desktop driver did not publish readiness.');
  const driver: DesktopHostedDriverReady = ready;
  let supervisorDescriptor: string | undefined;
  if (agent) {
    supervisorDescriptor = await publishDesktopHostManagement({
      supervisor,
      config: request.config,
      target,
      input: request.input,
      driver: {
        record: driver.agentDescriptor!,
        url: driver.url,
        ...(driver.runnerDescriptor ? { runnerRecord: driver.runnerDescriptor } : {}),
      },
      root: driver.root,
      descriptor: options.supervisorDescriptor,
      managedWorkload: options.managedWorkload,
    });
  }
  supervisor.services.controller.signal.throwIfAborted();
  return desktopHostReady({
    supervisor,
    url: driver.url,
    agentDescriptor: driver.agentDescriptor,
    runnerDescriptor: driver.runnerDescriptor,
    supervisorDescriptor,
    integration: driver.integration,
  });
}

export async function publishDesktopHostManagement(options: {
  supervisor: DesktopSupervisor;
  config: ResolvedDesktopConfig;
  target: ResolvedDesktopTarget;
  input?: DesktopIntegrationRequest['input'];
  driver: { record: string; url: string; runnerRecord?: string };
  root?: string;
  descriptor?: string;
  managedWorkload?: (context: DesktopIntegrationManagedWorkloadContext) => Promise<void>;
}): Promise<string> {
  const { supervisor, target } = options;
  const { createManagedDesktopHostResource } = await import('./managedHost.js');
  const manager = createManagedDesktopHostResource({
    config: options.config,
    target,
    hostLane: options.input ?? 'physical',
    driver: options.driver,
    root: options.root,
    descriptor: options.descriptor,
    ...(options.managedWorkload ? { managedWorkload: options.managedWorkload } : {}),
    addSecret: (secret) => supervisor.reporter.addSecret(secret),
    onFailure: (error) => supervisor.services.fail(error),
  });
  await supervisor.services.contribute([manager.resource], { targetId: target.id, targetInstanceId: target.instanceId });
  if (!manager.descriptor) throw new Error('The desktop supervisor management descriptor was not published.');
  return manager.descriptor;
}

export function desktopHostReady(options: {
  supervisor: DesktopSupervisor;
  url: string;
  agentDescriptor?: string;
  runnerDescriptor?: string;
  supervisorDescriptor?: string;
  integration?: DesktopHostReady['integration'];
}): DesktopHostReady {
  const { supervisor } = options;
  return {
    type: 'ready',
    url: options.url,
    targetId: supervisor.target.id,
    instanceId: supervisor.target.instanceId,
    endpoint: supervisor.target.endpoint,
    ...(supervisor.target.host.renderer ? { renderer: supervisor.target.host.renderer } : {}),
    runId: supervisor.reporter.runId,
    ...(options.agentDescriptor ? { agentDescriptor: options.agentDescriptor } : {}),
    ...(options.runnerDescriptor ? { runnerDescriptor: options.runnerDescriptor } : {}),
    ...(options.supervisorDescriptor ? { supervisorDescriptor: options.supervisorDescriptor } : {}),
    ...(options.integration ? { integration: options.integration } : {}),
  };
}

export function formatDesktopHostReady(mode: ResolvedDesktopReporterMode, ready: DesktopHostReady): string {
  if (mode === 'json' || mode === 'ndjson') return formatDesktopReporterValue(mode, ready);
  return (
    `Desktop driver ready: ${ready.url}; target ${ready.targetId}` +
    `${ready.agentDescriptor ? `; agent=${ready.agentDescriptor}` : ''}` +
    `${ready.runnerDescriptor ? `; runner=${ready.runnerDescriptor}` : ''}` +
    `${ready.supervisorDescriptor ? `; supervisor=${ready.supervisorDescriptor}` : ''}\n`
  );
}

function validateHostedDriver(
  driver: DesktopHostedDriverReady,
  target: ResolvedDesktopTarget,
  agent: DesktopAgentConnectionOptions | undefined,
): void {
  if (!driver || driver.targetId !== target.id) throw new Error('The hosted driver did not publish the configured target.');
  let url: URL;
  try {
    url = new URL(driver.url);
  } catch {
    throw new Error('The hosted driver did not publish a loopback URL.');
  }
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || !url.port || url.origin !== driver.url) {
    throw new Error('The hosted driver did not publish a loopback URL.');
  }
  validateDesktopResourceServiceReady(driver.serviceReady);
  if (
    agent &&
    (driver.agentDescriptor !== (agent.descriptor ?? defaultAgentDescriptor) ||
      driver.serviceReady?.descriptor !== driver.agentDescriptor ||
      (agent.root === undefined
        ? driver.root !== undefined
        : driver.root === undefined || path.resolve(driver.root) !== path.resolve(agent.root)) ||
      (agent.runner === false && driver.runnerDescriptor !== undefined) ||
      (agent.runner && agent.runner.descriptor !== undefined && driver.runnerDescriptor !== agent.runner.descriptor))
  ) {
    throw new Error('The hosted driver did not publish the configured protected target.');
  }
}
