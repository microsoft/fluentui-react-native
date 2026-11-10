export { DesktopRunReporter } from './collector.js';
export type { DesktopReportWriter, DesktopRunReporterOptions, ReportOutput } from './collector.js';
export { createDesktopReportSession } from './session.js';
export type { DesktopReportSession } from './session.js';
export { runDesktopOperation } from './operation.js';
export type { DesktopOperation, DesktopOperationOptions } from './operation.js';
export {
  createEventEmitter,
  DesktopIncompleteError,
  DesktopReportedError,
  isDesktopIncompleteError,
  serializeReportError,
  validateDesktopEvent,
} from './protocol.js';
export type {
  DesktopEvent,
  EventContext,
  EventData,
  EventEmitter,
  FailureKind,
  ReportError,
  ReportFailure,
  SelectionExclusions,
  TestGap,
  TestInputReport,
  TestStatus,
} from './protocol.js';
export type { DesktopEventRecord } from './structured.js';
export type { DesktopEventLevel } from '@fluentui-react-native/desktop-driver/cli/reporter';
export { createDesktopInputLane, desktopInputEnvironment, parseDesktopInputLane, requestedDesktopInputLane } from './lane.js';
export type { DesktopInputLaneName, RequestedDesktopInputLane } from './lane.js';
export {
  decideDesktopTestStatus,
  decisiveDesktopAttempt,
  describeDesktopInputLane,
  describeDesktopIncompleteRun,
  describeDesktopSelection,
  describeDesktopUnsupported,
  desktopInputLaneSources,
  desktopRunExitCode,
  projectDesktopRunSummary,
  renderJUnit,
  renderRunSummary,
  summarizeDesktopRun,
} from './results.js';
export type {
  DesktopInputLaneMasking,
  DesktopInputLaneReport,
  DesktopInputLaneSource,
  DesktopRunResult,
  DesktopRunSummary,
  DesktopSelectionReport,
  DesktopTestAttempt,
  DesktopTestResult,
} from './results.js';
export { connectReportProducer, DESKTOP_REPORT_CONTEXT, startReportTransport } from './transport.js';
export type { ReportProducer, ReportTransport, ReportTransportContext } from './transport.js';
