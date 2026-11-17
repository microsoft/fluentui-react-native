import { createHash } from 'node:crypto';

import {
  createMacOSPrivateStorage,
  createMacOSServiceVerifier,
  createWindowsPrivateStorage,
  createWindowsServiceVerifier,
  describeMacOSService,
  describeWindowsService,
  readConnectionDescriptor,
} from '@fluentui-react-native/desktop-driver/authority';
import type { DesktopServiceIdentity, PrivateStorage, VerifyDesktopService } from '@fluentui-react-native/desktop-driver/authority';
import { resolveNativeDesktopDriver } from '@fluentui-react-native/desktop-driver/native';

import type { ResolvedDesktopConfig, ResolvedDesktopTarget } from './config.js';
import type { DesktopWorkloadLane, DesktopWorkloadService } from './control.js';
import { createManagedDesktopWdioService } from './managedWdio.js';
import type { DesktopResourceContribution } from './resources.js';
import { publishDesktopSupervisor } from './supervisorConnection.js';
import type { DesktopSupervisorPublication } from './supervisorConnection.js';
import { connectVerifiedDesktopRunner } from './wdio/runnerConnection.js';
import type { DesktopIntegrationManagedWorkloadContext } from './integration.js';

type ManagedHostEnvironment = {
  storage: PrivateStorage;
  verifyService: VerifyDesktopService;
  identity: Omit<DesktopServiceIdentity, 'incarnation'>;
  driver: { record: string; digest: string; incarnation: string; targetId: string; url: string };
};

export type ManagedDesktopHostOptions = {
  config: ResolvedDesktopConfig;
  target: ResolvedDesktopTarget;
  hostLane: DesktopWorkloadLane;
  driver: { record: string; url: string; runnerRecord?: string };
  root?: string;
  descriptor?: string;
  addSecret(secret: string): void;
  onFailure(error: Error): void;
  managedWorkload?: (context: DesktopIntegrationManagedWorkloadContext) => Promise<void>;
  /** Trusted test or integration adapter; production resolves private storage and the native verifier. */
  openEnvironment?(signal: AbortSignal): Promise<ManagedHostEnvironment>;
};

/** Publishes management after the driver and disposes it first as an owned supervisor resource. */
export function createManagedDesktopHostResource(options: ManagedDesktopHostOptions): {
  resource: DesktopResourceContribution;
  readonly descriptor: string | undefined;
} {
  let publication: DesktopSupervisorPublication | undefined;
  let workload: DesktopWorkloadService | undefined;
  let uncertain = false;
  let prepared = false;
  return {
    get descriptor() {
      return publication?.descriptor;
    },
    resource: {
      id: 'workload-management',
      ownership: 'owned',
      prepare: () => {
        if (prepared) throw new Error('A managed desktop host resource cannot be acquired twice.');
        prepared = true;
        return {
          identity: `workload-management:${options.target.id}:${options.target.instanceId}`,
          async acquire(signal) {
            const environment = await (options.openEnvironment?.(signal) ?? openNativeEnvironment(options, signal));
            signal.throwIfAborted();
            if (
              environment.driver.record !== options.driver.record ||
              environment.driver.url !== options.driver.url ||
              environment.driver.targetId !== options.target.id
            ) {
              throw new Error('The managed desktop driver does not match the host.');
            }
            const { storage, verifyService, identity, driver } = environment;
            workload = createManagedDesktopWdioService({
              config: options.config,
              target: options.target,
              hostSignal: signal,
              hostLane: options.hostLane,
              addSecret: options.addSecret,
              ...(options.managedWorkload ? { managedWorkload: options.managedWorkload } : {}),
              ...(options.driver.runnerRecord
                ? {
                    connectRunner: (addSecret: (secret: string) => void) =>
                      connectVerifiedDesktopRunner({
                        storage,
                        verifyService,
                        descriptor: options.driver.runnerRecord,
                        binding: { url: driver.url, incarnation: driver.incarnation, targetId: driver.targetId },
                        addSecret,
                      }),
                  }
                : {}),
            });
            try {
              publication = await publishDesktopSupervisor({
                service: workload,
                storage,
                verifyService,
                identity,
                driver,
                descriptor: options.descriptor,
                onFailure: options.onFailure,
              });
            } catch (error) {
              if (error instanceof AggregateError) uncertain = true;
              throw error;
            }
            signal.throwIfAborted();
          },
          async dispose() {
            if (publication) await publication.close();
            else await workload?.close();
            if (uncertain) throw new Error('Desktop supervisor publication or listener cleanup remains unconfirmed.');
          },
        };
      },
    },
  };
}

async function openNativeEnvironment(options: ManagedDesktopHostOptions, signal: AbortSignal): Promise<ManagedHostEnvironment> {
  try {
    const { target } = options;
    const artifact = await resolveNativeDesktopDriver({ ...target.nativeDriver, platform: target.endpoint, buildPolicy: 'never', signal });
    signal.throwIfAborted();
    const storage =
      target.endpoint === 'macos'
        ? await createMacOSPrivateStorage(options.root)
        : await createWindowsPrivateStorage({ artifact, ...(options.root === undefined ? {} : { root: options.root }) });
    const verifyService =
      target.endpoint === 'macos' ? createMacOSServiceVerifier({ artifact }) : createWindowsServiceVerifier({ artifact });
    signal.throwIfAborted();
    const contents = await storage.read(options.driver.record);
    if (contents === undefined) throw new Error();
    const value: unknown = JSON.parse(contents);
    const incarnation =
      typeof value === 'object' && value !== null && 'service' in value && typeof value.service === 'object' && value.service !== null
        ? (value.service as { incarnation?: unknown }).incarnation
        : undefined;
    if (typeof incarnation !== 'string') throw new Error();
    const binding = {
      digest: createHash('sha256').update(contents, 'utf8').digest('hex'),
      incarnation,
      targetId: target.id,
      url: options.driver.url,
    };
    const verified = await readConnectionDescriptor(storage, options.driver.record, verifyService, binding, options.addSecret);
    signal.throwIfAborted();
    const identity =
      target.endpoint === 'macos'
        ? await describeMacOSService({ artifact, pid: process.pid })
        : await describeWindowsService({ artifact, pid: process.pid });
    signal.throwIfAborted();
    return {
      storage,
      verifyService,
      identity,
      driver: { record: options.driver.record, ...binding, url: verified.url },
    };
  } catch {
    if (signal.aborted) throw signal.reason;
    throw new Error('Desktop supervisor driver discovery failed; verify private storage and the native service identity.');
  }
}
