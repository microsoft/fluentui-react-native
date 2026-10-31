export { DesktopRunReporter } from './collector.js';
export type { DesktopReportWriter, DesktopRunReporterOptions, ReportOutput } from './collector.js';
export { createDesktopReportSession } from './session.js';
export type { DesktopReportSession } from './session.js';
export { createEventEmitter, DesktopReportedError, serializeReportError, validateDesktopEvent } from './protocol.js';
export type {
  DesktopEvent,
  EventContext,
  EventData,
  EventEmitter,
  FailureKind,
  ReportError,
  ReportFailure,
  TestStatus,
} from './protocol.js';
export { desktopRunExitCode, renderJUnit, renderRunSummary, summarizeDesktopRun } from './results.js';
export type { DesktopRunResult, DesktopTestAttempt, DesktopTestResult } from './results.js';
export { connectReportProducer, DESKTOP_REPORT_CONTEXT, startReportTransport } from './transport.js';
export type { ReportProducer, ReportTransport, ReportTransportContext } from './transport.js';
