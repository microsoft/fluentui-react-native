import { DesktopWorkloadError } from '@fluentui-react-native/desktop-test/control';
import type { DesktopWorkloadInput, DesktopWorkloadResponse } from '@fluentui-react-native/desktop-test/control';
import { DesktopWorkloadTransportError } from '@fluentui-react-native/desktop-test/supervisor-connection';
import type { DesktopSupervisorConnector } from '@fluentui-react-native/desktop-test/supervisor-connection';

import { AdapterError } from './controller.js';

const maxAdmissions = 128;
const unavailable = 'The desktop supervisor is unavailable. Verify its private descriptor and both services.';
const ambiguous = 'Workload admission may have succeeded. Query status with the same requestId; do not submit the run again.';

export function supervisorConnectionError(error: unknown): AdapterError {
  return error instanceof DesktopWorkloadError && error.code === 'capacity'
    ? new AdapterError(error.code, error.message)
    : new AdapterError('service-unavailable', unavailable);
}

/** Keeps one connection's admitted and ambiguous request IDs; neither is ever resubmitted. */
export class WorkloadController {
  private readonly admissions = new Set<string>();
  private readonly connector: DesktopSupervisorConnector;

  constructor(connector: DesktopSupervisorConnector) {
    this.connector = connector;
  }

  async request(input: DesktopWorkloadInput, signal?: AbortSignal): Promise<DesktopWorkloadResponse> {
    let connection;
    try {
      connection = await this.connector.connect();
    } catch (error) {
      console.error('desktop-mcp: workload connection failed; verify private discovery and the service identity.');
      throw supervisorConnectionError(error);
    }

    const requestId = input.action === 'run' ? input.requestId : undefined;
    if (input.action === 'run') {
      if (!requestId) throw new AdapterError('invalid-request', 'A workload run requires a requestId.');
      if (this.admissions.has(requestId)) throw new AdapterError('admission-unknown', ambiguous);
      if (this.admissions.size >= maxAdmissions)
        throw new AdapterError('capacity', 'The connection has reached its workload request limit.');
      this.admissions.add(requestId);
    }
    try {
      return await connection.request(input, signal);
    } catch (error) {
      if (
        requestId &&
        (error instanceof DesktopWorkloadError || (error instanceof DesktopWorkloadTransportError && error.code === 'unavailable'))
      ) {
        this.admissions.delete(requestId);
      }
      if (error instanceof DesktopWorkloadError) throw new AdapterError(error.code, error.message);
      if (error instanceof DesktopWorkloadTransportError && error.code === 'unavailable') {
        throw new AdapterError('service-unavailable', unavailable);
      }
      if (requestId) throw new AdapterError('admission-unknown', ambiguous);
      throw new AdapterError('service-unavailable', unavailable);
    }
  }
}
