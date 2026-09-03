import AppKit
import ApplicationServices
import Foundation

// NSRunningApplication launch dates do not guarantee the microsecond precision of proc_pidinfo.
private let externalLeaseStartTimeTolerance: TimeInterval = 1

final class ApplicationLeaseRecord {
  let id: String
  let ownership: String
  let endpoint: String
  let storyRootTestId: String?
  let processID: pid_t
  let processStartedAt: Date
  let bundleIdentifier: String?
  let executablePath: String?
  let windowTitle: String
  var primaryWindowID: String?

  init(
    ownership: String,
    endpoint: String,
    storyRootTestId: String?,
    processID: pid_t,
    processStartedAt: Date,
    bundleIdentifier: String?,
    executablePath: String?,
    windowTitle: String
  ) {
    id = IdentifierGenerator.shared.next("lease")
    self.ownership = ownership
    self.endpoint = endpoint
    self.storyRootTestId = storyRootTestId
    self.processID = processID
    self.processStartedAt = processStartedAt
    self.bundleIdentifier = bundleIdentifier
    self.executablePath = executablePath
    self.windowTitle = windowTitle
  }

  func json() -> JSONObject {
    [
      "id": id,
      "ownership": ownership,
      "processId": Int(processID),
      "processStartedAt": formatDate(processStartedAt),
    ]
  }
}

final class WindowRecord {
  let id: String
  let processID: pid_t
  var leaseID: String
  var primary: Bool
  var element: AXUIElement
  var lastKnownFrame: CGRect?
  var title: String

  init(processID: pid_t, leaseID: String, primary: Bool, element: AXUIElement, frame: CGRect? = nil, title: String) {
    id = IdentifierGenerator.shared.next("window")
    self.processID = processID
    self.leaseID = leaseID
    self.primary = primary
    self.element = element
    lastKnownFrame = frame
    self.title = title
  }

  func currentFrame() throws -> CGRect {
    do {
      let frame = try axFrame(element)
      if frame.width > 0, frame.height > 0 {
        lastKnownFrame = frame
        return frame
      }
    } catch let error as HelperError where error.code == ErrorCode.automationFailed {
      if let lastKnownFrame {
        return lastKnownFrame
      }
      throw error
    }
    return lastKnownFrame ?? .zero
  }
}

private final class LaunchResultBox: @unchecked Sendable {
  let lock = NSLock()
  var application: NSRunningApplication?
  var error: Error?
}

struct AXWindowAttributeDiagnostic {
  let attribute: String
  let error: AXError
  let returnedType: String
  let elementCount: Int
  let elements: [AXUIElement]
  let valueValid: Bool

  func json() -> JSONObject {
    let elementEvidence = elements.prefix(16).map(windowElementDiagnostic)
    return [
      "attribute": attribute,
      "elementCount": elementCount,
      "elements": elementEvidence,
      "error": axErrorJSON(error),
      "returnedType": returnedType,
      "truncated": elementCount > elementEvidence.count,
      "valueValid": valueValid,
    ]
  }
}

struct AXWindowRoleDiagnostic {
  let error: AXError
  let role: String?
  let valueValid: Bool

  func json() -> JSONObject {
    [
      "error": axErrorJSON(error),
      "role": role.map { bounded($0, bytes: 128) } ?? NSNull(),
      "valueValid": valueValid,
    ]
  }
}

private func windowElementDiagnostic(_ element: AXUIElement) -> JSONObject {
  var roleValue: CFTypeRef?
  let roleError = AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &roleValue)
  var titleValue: CFTypeRef?
  let titleError = AXUIElementCopyAttributeValue(element, kAXTitleAttribute as CFString, &titleValue)
  var names: CFArray?
  let namesError = AXUIElementCopyAttributeNames(element, &names)
  let allNames = (names as? [String] ?? []).sorted()
  let boundedNames = allNames.prefix(32).map { bounded($0, bytes: 128) }
  var value: JSONObject = [
    "attributeNameCount": allNames.count,
    "attributeNames": boundedNames,
    "attributeNamesError": axErrorJSON(namesError),
    "attributeNamesTruncated": allNames.count > boundedNames.count,
    "roleError": axErrorJSON(roleError),
    "titleError": axErrorJSON(titleError),
  ]
  if let role = axString(roleValue) {
    value["role"] = bounded(role, bytes: 128)
  } else {
    value["role"] = NSNull()
  }
  if let title = axString(titleValue) {
    value["title"] = bounded(title, bytes: 512)
  }
  return value
}

struct AXWindowQueryOutcome {
  let processID: pid_t
  let trusted: Bool
  let queries: [AXWindowAttributeDiagnostic]
  let roleQueries: [AXWindowRoleDiagnostic]
  let realWindows: [AXUIElement]
  let placeholderCount: Int
  let otherRoleCount: Int

  func diagnostic(reason: String, exactTitle: String? = nil, matchCount: Int? = nil) -> JSONObject {
    var value: JSONObject = [
      "otherRoleCount": otherRoleCount,
      "placeholderCount": placeholderCount,
      "processId": Int(processID),
      "queries": queries.map { $0.json() },
      "realWindowCount": realWindows.count,
      "reason": reason,
      "roleQueries": roleQueries.prefix(16).map { $0.json() },
      "roleQueriesTruncated": roleQueries.count > 16,
      "trusted": trusted,
    ]
    if let exactTitle {
      value["exactTitle"] = bounded(exactTitle, bytes: 512)
    }
    if let matchCount {
      value["matchingTitleCount"] = matchCount
    }
    return value
  }
}

func classifyAXWindowQuery(
  queries: [AXWindowAttributeDiagnostic],
  realWindowCount: Int,
  placeholderCount: Int,
  otherRoleCount: Int,
  matchingTitleCount: Int?,
  roleErrors: [AXError] = []
) -> String {
  let errors = queries.map(\.error) + roleErrors
  let softErrors: Set<AXError> = [.success, .attributeUnsupported, .noValue]
  if errors.contains(.apiDisabled) {
    return "api-disabled"
  }
  if realWindowCount == 0, errors.contains(.cannotComplete) {
    return "target-non-response"
  }
  if realWindowCount == 0, errors.contains(.invalidUIElement) {
    return "invalid-element"
  }
  if realWindowCount == 0 {
    if errors.contains(where: { !softErrors.contains($0) }) {
      return "window-query-failed"
    }
    if placeholderCount > 0, otherRoleCount == 0 {
      return "placeholder-only"
    }
    if otherRoleCount > 0 {
      return "no-real-window"
    }
    if errors.allSatisfy({ softErrors.contains($0) }) {
      return "no-value-or-unsupported"
    }
    return "window-query-failed"
  }
  if matchingTitleCount == 0 {
    return "no-matching-title"
  }
  return "matched"
}

func incompleteAXCandidateDiscovery(
  queries: [AXWindowAttributeDiagnostic],
  roleQueries: [AXWindowRoleDiagnostic],
  titleErrorCount: Int
) -> Bool {
  let windowQueryIncomplete = queries.contains {
    $0.attribute == kAXWindowsAttribute && ($0.error != .success || !$0.valueValid)
  }
  let roleQueryIncomplete = roleQueries.contains {
    $0.error != .success
      || !$0.valueValid
      || ($0.role != kAXWindowRole && $0.role != kAXSheetRole)
  }
  if titleErrorCount > 0 || windowQueryIncomplete || roleQueryIncomplete {
    return true
  }
  guard let authoritative = queries.first(where: { $0.attribute == kAXWindowsAttribute }) else {
    return true
  }
  let fallbackElements = queries
    .filter { $0.attribute != kAXWindowsAttribute }
    .flatMap(\.elements)
  return fallbackElements.contains { fallback in
    !authoritative.elements.contains { sameAXElement($0, fallback) }
  }
}

func completeAXWindowTitle(error: AXError, title: String?) -> Bool {
  error == .success && title != nil
}

func incompleteAXMultiProcessDiscovery(
  queriesByCandidate: [[AXWindowAttributeDiagnostic]],
  roleQueriesByCandidate: [[AXWindowRoleDiagnostic]],
  titleErrorCount: Int
) -> Bool {
  guard queriesByCandidate.count == roleQueriesByCandidate.count else {
    return true
  }
  if titleErrorCount > 0 {
    return true
  }
  return zip(queriesByCandidate, roleQueriesByCandidate).contains { queries, roleQueries in
    incompleteAXCandidateDiscovery(queries: queries, roleQueries: roleQueries, titleErrorCount: 0)
  }
}

func classifyAXAttachment(matchCount: Int, discoveryIncomplete: Bool) -> String {
  if matchCount > 1 {
    return "ambiguous"
  }
  if discoveryIncomplete {
    return "incomplete"
  }
  return matchCount == 1 ? "matched" : "missing"
}

final class ApplicationManager {
  private var leases: [String: ApplicationLeaseRecord] = [:]
  private var leaseOrder: [String] = []
  private var windows: [String: WindowRecord] = [:]
  private var windowIDsByHash: [CFHashCode: [String]] = [:]

  func launch(_ params: JSONObject, token: CancellationToken) throws -> ApplicationLeaseRecord {
    let application = try requireObject(params["application"], "The launch request is missing its application descriptor.")
    let bundleIdentifier = optionalString(application, "bundleIdentifier")
    let executablePath = optionalString(application, "executablePath")
    let windowTitle = optionalString(application, "windowTitle")
    guard bundleIdentifier != nil || executablePath != nil else {
      try fail(
        ErrorCode.invalidParams,
        "The application descriptor needs a \"bundleIdentifier\" or an \"executablePath\"."
      )
    }
    guard let windowTitle else {
      try fail(ErrorCode.invalidParams, "The application descriptor needs an exact \"windowTitle\" to identify its window.")
    }
    let arguments = try parseArguments(application["arguments"])
    let preexisting = Set(
      NSWorkspace.shared.runningApplications
        .filter { bundleIdentifier == nil || $0.bundleIdentifier == bundleIdentifier }
        .map(\.processIdentifier)
    )

    let running: NSRunningApplication
    if let appURL = try resolveApplicationURL(bundleIdentifier: bundleIdentifier, executablePath: executablePath) {
      let bundle = Bundle(url: appURL)
      if let bundleIdentifier, bundle?.bundleIdentifier != bundleIdentifier {
        try fail(
          ErrorCode.launchFailed,
          "The selected application bundle does not have the expected bundle identifier \"\(bundleIdentifier)\"."
        )
      }
      running = try launchApplication(at: appURL, arguments: arguments, token: token)
      if preexisting.contains(running.processIdentifier) {
        try fail(
          ErrorCode.launchFailed,
          "Launch Services reused an application process that existed before this request, so the helper refused to claim ownership."
        )
      }
    } else if let executablePath {
      let process = Process()
      process.executableURL = URL(fileURLWithPath: executablePath)
      process.arguments = arguments
      do {
        try process.run()
      } catch {
        try fail(ErrorCode.launchFailed, "Starting the application failed: \(error.localizedDescription)")
      }
      guard let application = NSRunningApplication(processIdentifier: process.processIdentifier) else {
        process.terminate()
        try fail(ErrorCode.launchFailed, "The launched process did not become a macOS running application.")
      }
      running = application
    } else {
      try fail(ErrorCode.launchFailed, "The application could not be resolved for launch.")
    }

    do {
      try validateApplication(
        running,
        expectedBundleIdentifier: bundleIdentifier,
        expectedExecutablePath: executablePath,
        code: ErrorCode.launchFailed
      )
      _ = try waitForUniqueWindow(
        processID: running.processIdentifier,
        exactTitle: windowTitle,
        timeoutMilliseconds: 90_000,
        token: token,
        code: ErrorCode.launchFailed
      )
      return try createLease(
        ownership: "launched",
        running: running,
        windowTitle: windowTitle,
        params: params
      )
    } catch {
      running.terminate()
      throw error
    }
  }

  func attach(_ params: JSONObject, token: CancellationToken) throws -> ApplicationLeaseRecord {
    let application = try requireObject(params["application"], "The attach request is missing its application descriptor.")
    let endpoint = optionalString(params, "endpoint") ?? "macos"
    let configuredBundleIdentifier = optionalString(application, "bundleIdentifier")
    let configuredExecutablePath = optionalString(application, "executablePath")
    let configuredWindowTitle = optionalString(application, "windowTitle")

    if let leasePath = optionalString(application, "leasePath") {
      let lease = try readLease(path: leasePath, token: token)
      guard integer(lease, "schemaVersion") == 1 else {
        try fail(ErrorCode.leaseInvalid, "The application lease does not use schema version 1.")
      }
      guard let expectedNonce = optionalString(application, "leaseNonce") else {
        try fail(ErrorCode.leaseInvalid, "The application descriptor does not carry the expected lease nonce.")
      }
      guard optionalString(lease, "nonce") == expectedNonce else {
        try fail(ErrorCode.leaseInvalid, "The application lease nonce does not match this session.")
      }
      guard optionalString(lease, "endpoint") == endpoint else {
        try fail(ErrorCode.leaseInvalid, "The application lease was written for a different endpoint.")
      }
      guard
        let processNumber = lease["processId"] as? NSNumber,
        !isBoolean(processNumber),
        processNumber.doubleValue == Double(processNumber.int32Value),
        processNumber.int32Value > 0
      else {
        try fail(ErrorCode.leaseInvalid, "The application lease does not name a valid process.")
      }
      let pid = pid_t(processNumber.int32Value)
      guard processIsAlive(pid), let running = NSRunningApplication(processIdentifier: pid) else {
        try fail(ErrorCode.leaseInvalid, "The leased application process is no longer running.")
      }
      guard
        let actualStart = processStartTime(pid),
        let expectedStartText = optionalString(lease, "processStartedAt"),
        let expectedStart = parseDate(expectedStartText)
      else {
        try fail(ErrorCode.leaseInvalid, "The application lease does not carry a valid process start time.")
      }
      guard abs(actualStart.timeIntervalSince(expectedStart)) <= externalLeaseStartTimeTolerance else {
        try fail(ErrorCode.leaseInvalid, "The leased process identifier was reused by a different process.")
      }

      guard let leaseBundleIdentifier = optionalString(lease, "bundleIdentifier") else {
        try fail(ErrorCode.leaseInvalid, "The application lease does not carry the target bundle identifier.")
      }
      if
        let configuredBundleIdentifier,
        configuredBundleIdentifier != leaseBundleIdentifier
      {
        try fail(ErrorCode.leaseInvalid, "The application lease names a different bundle identifier than the target.")
      }
      let expectedBundleIdentifier = leaseBundleIdentifier

      guard let leaseExecutablePath = optionalString(lease, "executablePath") else {
        try fail(ErrorCode.leaseInvalid, "The application lease does not carry the target executable path.")
      }
      if
        let configuredExecutablePath,
        canonicalPath(configuredExecutablePath) != canonicalPath(leaseExecutablePath)
      {
        try fail(ErrorCode.leaseInvalid, "The application lease names a different executable than the target.")
      }
      let expectedExecutablePath = leaseExecutablePath

      let leaseWindowTitle = optionalString(lease, "windowTitle")
      if let configuredWindowTitle, let leaseWindowTitle, configuredWindowTitle != leaseWindowTitle {
        try fail(ErrorCode.leaseInvalid, "The application lease names a different window title than the target.")
      }
      guard let windowTitle = leaseWindowTitle ?? configuredWindowTitle else {
        try fail(ErrorCode.leaseInvalid, "The application lease does not name the application window.")
      }

      try validateApplication(
        running,
        expectedBundleIdentifier: expectedBundleIdentifier,
        expectedExecutablePath: expectedExecutablePath,
        code: ErrorCode.leaseInvalid
      )
      _ = try waitForUniqueWindow(
        processID: pid,
        exactTitle: windowTitle,
        timeoutMilliseconds: 10_000,
        token: token,
        code: ErrorCode.attachFailed
      )
      return try createLease(ownership: "attached", running: running, windowTitle: windowTitle, params: params)
    }

    guard let windowTitle = configuredWindowTitle else {
      try fail(
        ErrorCode.invalidParams,
        "Attaching without a lease requires an exact \"windowTitle\" in the application descriptor."
      )
    }
    let candidates = NSWorkspace.shared.runningApplications.filter { application in
      guard !application.isTerminated else {
        return false
      }
      if let configuredBundleIdentifier, application.bundleIdentifier != configuredBundleIdentifier {
        return false
      }
      if let configuredExecutablePath, !matchesExecutable(application, expected: configuredExecutablePath) {
        return false
      }
      return true
    }
    var matches: [(NSRunningApplication, AXUIElement)] = []
    var queryOutcomes: [AXWindowQueryOutcome] = []
    var titleErrorCount = 0
    var titleErrors: [JSONObject] = []
    for candidate in candidates {
      try token.throwIfCancelled()
      let outcome = queryAccessibilityWindows(processID: candidate.processIdentifier)
      queryOutcomes.append(outcome)
      let reason = classifyAXWindowQuery(
        queries: outcome.queries,
        realWindowCount: outcome.realWindows.count,
        placeholderCount: outcome.placeholderCount,
        otherRoleCount: outcome.otherRoleCount,
        matchingTitleCount: nil,
        roleErrors: outcome.roleQueries.map(\.error)
      )
      if reason == "api-disabled" {
        try throwCriticalWindowQueryFailure(outcome, code: ErrorCode.attachFailed)
      }
      let candidateWindows = outcome.realWindows
      for window in candidateWindows {
        var titleValue: CFTypeRef?
        let titleError = AXUIElementCopyAttributeValue(window, kAXTitleAttribute as CFString, &titleValue)
        let candidateTitle = titleError == .success ? axString(titleValue) : nil
        if titleError == .apiDisabled {
          try throwAX(titleError, operation: "Reading \(kAXTitleAttribute)")
        }
        guard completeAXWindowTitle(error: titleError, title: candidateTitle) else {
          titleErrorCount += 1
          if titleErrors.count < 16 {
            titleErrors.append([
              "error": axErrorJSON(titleError),
              "processId": Int(candidate.processIdentifier),
              "returnedType": cfTypeName(titleValue),
            ])
          }
          continue
        }
        if candidateTitle == windowTitle {
          matches.append((candidate, window))
        }
      }
    }
    let realWindowCount = queryOutcomes.reduce(0) { $0 + $1.realWindows.count }
    let placeholderCount = queryOutcomes.reduce(0) { $0 + $1.placeholderCount }
    let otherRoleCount = queryOutcomes.reduce(0) { $0 + $1.otherRoleCount }
    let queries = queryOutcomes.flatMap(\.queries)
    let roleErrors = queryOutcomes.flatMap { $0.roleQueries.map(\.error) }
    let discoveryIncomplete = incompleteAXMultiProcessDiscovery(
      queriesByCandidate: queryOutcomes.map(\.queries),
      roleQueriesByCandidate: queryOutcomes.map(\.roleQueries),
      titleErrorCount: titleErrorCount
    )
    let attachmentResolution = classifyAXAttachment(
      matchCount: matches.count,
      discoveryIncomplete: discoveryIncomplete
    )
    if attachmentResolution == "ambiguous" {
      try fail(
        ErrorCode.ambiguousTarget,
        "\(matches.count) windows are titled \"\(windowTitle)\", so the target is ambiguous."
      )
    }
    if attachmentResolution == "incomplete", !matches.isEmpty {
      let queryEvidence = queryOutcomes.prefix(16).map { $0.diagnostic(reason: "candidate-query") }
      try fail(
        ErrorCode.ambiguousTarget,
        "A window titled \"\(windowTitle)\" was found, but Accessibility could not inspect every candidate process to prove it is unique.",
        data: [
          "candidateApplicationCount": candidates.count,
          "candidateQueries": queryEvidence,
          "confirmedMatchCount": matches.count,
          "exactTitle": bounded(windowTitle, bytes: 512),
          "reason": "incomplete-candidate-discovery",
          "titleErrorCount": titleErrorCount,
          "titleErrors": titleErrors,
          "titleErrorsTruncated": titleErrorCount > titleErrors.count,
          "truncated": candidates.count > queryEvidence.count,
        ]
      )
    }
    if matches.isEmpty {
      let reason: String
      if candidates.isEmpty {
        reason = "no-matching-application"
      } else if discoveryIncomplete {
        reason = "incomplete-candidate-discovery"
      } else {
        reason = classifyAXWindowQuery(
          queries: queries,
          realWindowCount: realWindowCount,
          placeholderCount: placeholderCount,
          otherRoleCount: otherRoleCount,
          matchingTitleCount: 0,
          roleErrors: roleErrors
        )
      }
      let queryEvidence = queryOutcomes.prefix(16).map { $0.diagnostic(reason: "candidate-query") }
      let message: String
      switch reason {
      case "placeholder-only":
        message = "The candidate application returned only AXApplication placeholders instead of a real AXWindow or AXSheet."
      case "no-value-or-unsupported":
        message = "The candidate applications returned no values for AXWindows, AXMainWindow, or AXFocusedWindow."
      case "no-real-window":
        message = "The candidate applications returned accessibility elements, but none are AXWindow or AXSheet."
      case "target-non-response":
        message = "The candidate applications did not complete their accessibility window queries."
      case "invalid-element":
        message = "The candidate application accessibility objects became invalid during window discovery."
      case "window-query-failed":
        message = "Accessibility window discovery failed before any candidate returned a usable window."
      case "incomplete-candidate-discovery":
        message = "Accessibility could not inspect every candidate window, so the requested title could not be ruled out."
      default:
        message = "No window titled \"\(windowTitle)\" is currently open."
      }
      try fail(
        ErrorCode.attachFailed,
        message,
        data: [
          "candidateApplicationCount": candidates.count,
          "candidateQueries": queryEvidence,
          "exactTitle": bounded(windowTitle, bytes: 512),
          "reason": reason,
          "titleErrorCount": titleErrorCount,
          "titleErrors": titleErrors,
          "titleErrorsTruncated": titleErrorCount > titleErrors.count,
          "truncated": candidates.count > queryEvidence.count,
        ]
      )
    }
    let running = matches[0].0
    try validateApplication(
      running,
      expectedBundleIdentifier: configuredBundleIdentifier,
      expectedExecutablePath: configuredExecutablePath,
      code: ErrorCode.attachFailed
    )
    return try createLease(ownership: "attached", running: running, windowTitle: windowTitle, params: params)
  }

  func closeApplication(_ leaseID: String, token: CancellationToken) throws -> [String] {
    guard let lease = leases[leaseID] else {
      return []
    }
    let windowIDs = windows.values.filter { $0.leaseID == leaseID }.map(\.id)
    if lease.ownership == "launched", let running = NSRunningApplication(processIdentifier: lease.processID) {
      guard
        processIsAlive(lease.processID),
        let start = processStartTime(lease.processID),
        abs(start.timeIntervalSince(lease.processStartedAt)) <= 0.01
      else {
        try fail(ErrorCode.noSuchLease, "The launched application process identity no longer matches its lease.")
      }
      _ = running.terminate()
      let deadline = DispatchTime.now() + .seconds(5)
      while processIsAlive(lease.processID), DispatchTime.now() < deadline {
        try token.wait(milliseconds: 50)
      }
      if processIsAlive(lease.processID) {
        _ = running.forceTerminate()
      }
    }
    removeLease(leaseID)
    return windowIDs
  }

  func listWindows(_ leaseID: String, token: CancellationToken) throws -> [WindowRecord] {
    guard let lease = leases[leaseID] else {
      try fail(ErrorCode.noSuchLease, "The requested application lease is not held by this helper.")
    }
    guard
      processIsAlive(lease.processID),
      let start = processStartTime(lease.processID),
      abs(start.timeIntervalSince(lease.processStartedAt)) <= 0.01
    else {
      try fail(ErrorCode.noSuchLease, "The leased application process has exited or changed identity.")
    }
    let geometryDeadline = DispatchTime.now() + .seconds(1)
    var results: [WindowRecord] = []
    var candidateCount = 0
    var zeroGeometryCount = 0
    var geometryDiagnostics: [JSONObject] = []
    while results.isEmpty {
      let trackedElements = windows.values.filter { $0.leaseID == leaseID }.map(\.element)
      let elements = uniqueAXElements(trackedElements + (try accessibilityWindows(processID: lease.processID)))
      candidateCount = elements.count
      zeroGeometryCount = 0
      for element in elements {
        try token.throwIfCancelled()
        do {
          let title = try windowTitleOf(element)
          let axGeometry = try axFrame(element)
          let frame: CGRect
          if axGeometry.width > 0, axGeometry.height > 0 {
            frame = axGeometry
          } else {
            let fallback = coreGraphicsWindowFrame(
              processID: lease.processID,
              title: title,
              authoritativeWindowCount: elements.count
            )
            frame = fallback.frame ?? .zero
            if geometryDiagnostics.count < 16 {
              var diagnostic = fallback.diagnostics
              diagnostic["accessibilityTitle"] = bounded(title, bytes: 256)
              geometryDiagnostics.append(diagnostic)
            }
          }
          guard frame.width > 0, frame.height > 0 else {
            zeroGeometryCount += 1
            continue
          }
          let primary = title == lease.windowTitle
          results.append(registerWindow(element, lease: lease, primary: primary, frame: frame, title: title))
        } catch let error as HelperError
          where (error.code == ErrorCode.automationFailed || error.code == ErrorCode.staleElement)
            && DispatchTime.now() < geometryDeadline
        {
          continue
        }
      }
      if !results.isEmpty || DispatchTime.now() >= geometryDeadline {
        break
      }
      try token.wait(milliseconds: 50)
    }
    if results.isEmpty, candidateCount > 0 {
      try fail(
        ErrorCode.automationFailed,
        "The application exposes \(candidateCount) live accessibility window candidate(s), but \(zeroGeometryCount) have empty geometry.",
        data: [
          "candidateCount": candidateCount,
          "coreGraphicsQueries": geometryDiagnostics,
          "reason": "empty-window-geometry",
          "screenCaptureAccess": CGPreflightScreenCaptureAccess(),
          "zeroGeometryCount": zeroGeometryCount,
        ]
      )
    }
    results.sort {
      if $0.primary != $1.primary {
        return $0.primary
      }
      return $0.id < $1.id
    }
    if lease.primaryWindowID == nil, let first = results.first {
      first.primary = true
      lease.primaryWindowID = first.id
    }
    return results
  }

  func requireWindow(_ windowID: String) throws -> WindowRecord {
    guard let record = windows[windowID] else {
      try fail(ErrorCode.noSuchWindow, "Window \"\(windowID)\" is not tracked by this helper.")
    }
    guard processIsAlive(record.processID) else {
      try fail(ErrorCode.noSuchWindow, "Window \"\(windowID)\" has been closed or changed ownership.")
    }
    var needsRefresh = pidForAXElement(record.element) != record.processID
    if !needsRefresh {
      do {
        let role = try requiredAXRole(record.element, staleMessage: "Window \"\(windowID)\" is no longer available.")
        needsRefresh = role != kAXWindowRole && role != kAXSheetRole
      } catch let error as HelperError where error.code == ErrorCode.staleElement {
        needsRefresh = true
      }
    }
    if needsRefresh {
      let refreshed = try uniqueWindow(processID: record.processID, exactTitle: record.title, missingCode: ErrorCode.noSuchWindow)
      replaceWindowElement(record, with: refreshed)
    }
    return record
  }

  func lease(for window: WindowRecord) -> ApplicationLeaseRecord? {
    leases[window.leaseID]
  }

  func primaryLease() -> ApplicationLeaseRecord? {
    leaseOrder.lazy.compactMap { self.leases[$0] }.first
  }

  func forgetWindow(_ windowID: String) {
    guard let record = windows.removeValue(forKey: windowID) else {
      return
    }
    let hash = CFHash(record.element)
    windowIDsByHash[hash]?.removeAll { $0 == windowID }
    if windowIDsByHash[hash]?.isEmpty == true {
      windowIDsByHash.removeValue(forKey: hash)
    }
    leases[record.leaseID]?.primaryWindowID = leases[record.leaseID]?.primaryWindowID == windowID
      ? nil
      : leases[record.leaseID]?.primaryWindowID
  }

  func windowIDs(for leaseID: String) -> [String] {
    windows.values.filter { $0.leaseID == leaseID }.map(\.id)
  }

  func dispose(token: CancellationToken) {
    for leaseID in leaseOrder.reversed() {
      try? _ = closeApplication(leaseID, token: token)
    }
  }

  private func createLease(
    ownership: String,
    running: NSRunningApplication,
    windowTitle: String,
    params: JSONObject
  ) throws -> ApplicationLeaseRecord {
    guard let start = processStartTime(running.processIdentifier) else {
      try fail(
        ownership == "launched" ? ErrorCode.launchFailed : ErrorCode.attachFailed,
        "The application process start identity could not be read."
      )
    }
    let lease = ApplicationLeaseRecord(
      ownership: ownership,
      endpoint: optionalString(params, "endpoint") ?? "macos",
      storyRootTestId: optionalString(params, "storyRootTestId"),
      processID: running.processIdentifier,
      processStartedAt: start,
      bundleIdentifier: running.bundleIdentifier,
      executablePath: processExecutablePath(running.processIdentifier),
      windowTitle: windowTitle
    )
    leases[lease.id] = lease
    leaseOrder.append(lease.id)
    let primary = try uniqueWindow(
      processID: running.processIdentifier,
      exactTitle: windowTitle,
      missingCode: ownership == "launched" ? ErrorCode.launchFailed : ErrorCode.attachFailed
    )
    let record = registerWindow(primary, lease: lease, primary: true, title: windowTitle)
    lease.primaryWindowID = record.id
    return lease
  }

  private func registerWindow(
    _ element: AXUIElement,
    lease: ApplicationLeaseRecord,
    primary: Bool,
    frame: CGRect? = nil,
    title: String
  ) -> WindowRecord {
    let hash = CFHash(element)
    for id in windowIDsByHash[hash] ?? [] {
      if let existing = windows[id], sameAXElement(existing.element, element) {
        existing.element = element
        existing.leaseID = lease.id
        existing.primary = existing.primary || primary
        existing.title = title
        if let frame {
          existing.lastKnownFrame = frame
        }
        if existing.primary {
          lease.primaryWindowID = id
        }
        return existing
      }
    }
    let record = WindowRecord(
      processID: lease.processID,
      leaseID: lease.id,
      primary: primary,
      element: element,
      frame: frame,
      title: title
    )
    windows[record.id] = record
    windowIDsByHash[hash, default: []].append(record.id)
    if primary {
      lease.primaryWindowID = record.id
    }
    return record
  }

  private func replaceWindowElement(_ record: WindowRecord, with element: AXUIElement) {
    let previousHash = CFHash(record.element)
    windowIDsByHash[previousHash]?.removeAll { $0 == record.id }
    if windowIDsByHash[previousHash]?.isEmpty == true {
      windowIDsByHash.removeValue(forKey: previousHash)
    }
    record.element = element
    windowIDsByHash[CFHash(element), default: []].append(record.id)
  }

  private func removeLease(_ leaseID: String) {
    for id in windowIDs(for: leaseID) {
      forgetWindow(id)
    }
    leases.removeValue(forKey: leaseID)
    leaseOrder.removeAll { $0 == leaseID }
  }

  private func readLease(path: String, token: CancellationToken) throws -> JSONObject {
    try token.throwIfCancelled()
    let url = URL(fileURLWithPath: path)
    let data: Data
    do {
      data = try Data(contentsOf: url, options: [.mappedIfSafe])
    } catch {
      try fail(ErrorCode.leaseInvalid, "Opening the application lease file failed: \(error.localizedDescription)")
    }
    guard !data.isEmpty else {
      try fail(ErrorCode.leaseInvalid, "The application lease file is empty.")
    }
    guard data.count <= 1024 * 1024 else {
      try fail(ErrorCode.leaseInvalid, "The application lease file exceeds the 1 MiB limit.")
    }
    return try requireObject(try parseJSON(data), "The application lease must be a JSON object.")
  }

  private func parseArguments(_ value: Any?) throws -> [String] {
    guard let value else {
      return []
    }
    guard let list = value as? [Any] else {
      try fail(ErrorCode.invalidParams, "The application descriptor \"arguments\" field must be an array.")
    }
    var arguments: [String] = []
    for entry in list {
      guard let entry = entry as? String else {
        try fail(ErrorCode.invalidParams, "Every application launch argument must be a string.")
      }
      arguments.append(entry)
    }
    return arguments
  }

  private func resolveApplicationURL(
    bundleIdentifier: String?,
    executablePath: String?
  ) throws -> URL? {
    var byIdentifier: URL?
    if let bundleIdentifier {
      byIdentifier = NSWorkspace.shared.urlForApplication(withBundleIdentifier: bundleIdentifier)
      if byIdentifier == nil {
        try fail(ErrorCode.launchFailed, "No installed application has bundle identifier \"\(bundleIdentifier)\".")
      }
    }
    var byExecutable: URL?
    if let executablePath {
      var candidate = URL(fileURLWithPath: executablePath).standardizedFileURL
      while candidate.path != "/" {
        if candidate.pathExtension.lowercased() == "app" {
          byExecutable = candidate
          break
        }
        candidate.deleteLastPathComponent()
      }
    }
    if let byIdentifier, let byExecutable {
      guard canonicalPath(byIdentifier.path) == canonicalPath(byExecutable.path) else {
        try fail(ErrorCode.launchFailed, "The configured bundle identifier and executable resolve to different applications.")
      }
    }
    return byIdentifier ?? byExecutable
  }

  private func launchApplication(
    at url: URL,
    arguments: [String],
    token: CancellationToken
  ) throws -> NSRunningApplication {
    let configuration = NSWorkspace.OpenConfiguration()
    configuration.arguments = arguments
    configuration.activates = false
    configuration.addsToRecentItems = false
    configuration.createsNewApplicationInstance = true
    let result = LaunchResultBox()
    let semaphore = DispatchSemaphore(value: 0)
    NSWorkspace.shared.openApplication(at: url, configuration: configuration) { application, error in
      result.lock.lock()
      result.application = application
      result.error = error
      result.lock.unlock()
      semaphore.signal()
    }
    while semaphore.wait(timeout: .now() + .milliseconds(50)) == .timedOut {
      try token.throwIfCancelled()
    }
    result.lock.lock()
    let application = result.application
    let error = result.error
    result.lock.unlock()
    if let error {
      try fail(ErrorCode.launchFailed, "Launch Services could not start the application: \(error.localizedDescription)")
    }
    guard let application else {
      try fail(ErrorCode.launchFailed, "Launch Services did not return the launched application.")
    }
    return application
  }

  private func validateApplication(
    _ application: NSRunningApplication,
    expectedBundleIdentifier: String?,
    expectedExecutablePath: String?,
    code: String
  ) throws {
    guard processIsAlive(application.processIdentifier) else {
      try fail(code, "The target application process is not running.")
    }
    if let expectedBundleIdentifier, application.bundleIdentifier != expectedBundleIdentifier {
      try fail(code, "The target process does not have the expected bundle identifier \"\(expectedBundleIdentifier)\".")
    }
    if let expectedExecutablePath, !matchesExecutable(application, expected: expectedExecutablePath) {
      try fail(code, "The target process does not run the expected executable.")
    }
  }

  private func matchesExecutable(_ application: NSRunningApplication, expected: String) -> Bool {
    let expectedURL = URL(fileURLWithPath: expected).standardizedFileURL
    if expectedURL.pathExtension.lowercased() == "app", let bundleURL = application.bundleURL {
      return canonicalPath(expectedURL.path) == canonicalPath(bundleURL.path)
    }
    guard let actual = processExecutablePath(application.processIdentifier) else {
      return false
    }
    return canonicalPath(expected) == actual
  }

  private func waitForUniqueWindow(
    processID: pid_t,
    exactTitle: String,
    timeoutMilliseconds: Int,
    token: CancellationToken,
    code: String
  ) throws -> AXUIElement {
    let deadline = DispatchTime.now() + .milliseconds(timeoutMilliseconds)
    while true {
      try token.throwIfCancelled()
      do {
        return try uniqueWindow(processID: processID, exactTitle: exactTitle, missingCode: code)
      } catch let error as HelperError where error.code == code {
        if !processIsAlive(processID) {
          try fail(code, "The application exited before it showed its expected window.")
        }
        if DispatchTime.now() >= deadline {
          throw error
        }
      }
      try token.wait(milliseconds: 100)
    }
  }

  private func uniqueWindow(
    processID: pid_t,
    exactTitle: String,
    missingCode: String
  ) throws -> AXUIElement {
    let outcome = queryAccessibilityWindows(processID: processID)
    try throwCriticalWindowQueryFailure(outcome, code: missingCode)
    var matches: [AXUIElement] = []
    var titleErrorCount = 0
    var titleErrors: [JSONObject] = []
    for window in outcome.realWindows {
      var titleValue: CFTypeRef?
      let titleError = AXUIElementCopyAttributeValue(window, kAXTitleAttribute as CFString, &titleValue)
      let candidateTitle = titleError == .success ? axString(titleValue) : nil
      if titleError == .apiDisabled {
        try throwAX(titleError, operation: "Reading \(kAXTitleAttribute)")
      }
      guard completeAXWindowTitle(error: titleError, title: candidateTitle) else {
        titleErrorCount += 1
        if titleErrors.count < 16 {
          titleErrors.append([
            "error": axErrorJSON(titleError),
            "returnedType": cfTypeName(titleValue),
          ])
        }
        continue
      }
      if candidateTitle == exactTitle {
        matches.append(window)
      }
    }
    let discoveryIncomplete = incompleteAXCandidateDiscovery(
      queries: outcome.queries,
      roleQueries: outcome.roleQueries,
      titleErrorCount: titleErrorCount
    )
    let attachmentResolution = classifyAXAttachment(
      matchCount: matches.count,
      discoveryIncomplete: discoveryIncomplete
    )
    if attachmentResolution == "ambiguous" || (attachmentResolution == "incomplete" && !matches.isEmpty) {
      var data = outcome.diagnostic(
        reason: discoveryIncomplete ? "incomplete-candidate-discovery" : "ambiguous-title",
        exactTitle: exactTitle,
        matchCount: matches.count
      )
      data["titleErrorCount"] = titleErrorCount
      data["titleErrors"] = titleErrors
      data["titleErrorsTruncated"] = titleErrorCount > titleErrors.count
      let message = discoveryIncomplete
        ? "A window titled \"\(exactTitle)\" was found, but Accessibility could not inspect every window to prove it is unique."
        : "The application shows \(matches.count) windows titled \"\(exactTitle)\"."
      try fail(ErrorCode.ambiguousTarget, message, data: data)
    }
    if matches.isEmpty {
      let reason = discoveryIncomplete
        ? "incomplete-candidate-discovery"
        : classifyAXWindowQuery(
          queries: outcome.queries,
          realWindowCount: outcome.realWindows.count,
          placeholderCount: outcome.placeholderCount,
          otherRoleCount: outcome.otherRoleCount,
          matchingTitleCount: 0,
          roleErrors: outcome.roleQueries.map(\.error)
        )
      let message: String
      switch reason {
      case "placeholder-only":
        message =
          "The application returned only AXApplication placeholders instead of a real AXWindow or AXSheet while looking for \"\(exactTitle)\"."
      case "no-real-window":
        message =
          "The application returned accessibility elements, but none are AXWindow or AXSheet while looking for \"\(exactTitle)\"."
      case "no-value-or-unsupported":
        message =
          "AXWindows, AXMainWindow, and AXFocusedWindow returned no window values while looking for \"\(exactTitle)\"."
      case "incomplete-candidate-discovery":
        message =
          "Accessibility could not inspect every application window, so the requested title \"\(exactTitle)\" could not be ruled out."
      default:
        message = "The application does not currently show a window titled \"\(exactTitle)\"."
      }
      var data = outcome.diagnostic(reason: reason, exactTitle: exactTitle, matchCount: 0)
      data["titleErrorCount"] = titleErrorCount
      data["titleErrors"] = titleErrors
      data["titleErrorsTruncated"] = titleErrorCount > titleErrors.count
      try fail(
        missingCode,
        message,
        data: data
      )
    }
    return matches[0]
  }

  private func accessibilityWindows(processID: pid_t) throws -> [AXUIElement] {
    let outcome = queryAccessibilityWindows(processID: processID)
    try throwCriticalWindowQueryFailure(outcome, code: ErrorCode.automationFailed)
    return outcome.realWindows
  }

  private func queryAccessibilityWindows(processID: pid_t) -> AXWindowQueryOutcome {
    let application = AXUIElementCreateApplication(processID)
    let attributes = [kAXWindowsAttribute, kAXMainWindowAttribute, kAXFocusedWindowAttribute]
    let queries = attributes.map { queryWindowAttribute(application, attribute: $0) }
    let elements = uniqueAXElements(queries.flatMap(\.elements))
    var roleQueries: [AXWindowRoleDiagnostic] = []
    var realWindows: [AXUIElement] = []
    var placeholderCount = 0
    var otherRoleCount = 0
    for element in elements {
      var roleValue: CFTypeRef?
      let roleError = AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &roleValue)
      let role = roleError == .success ? axString(roleValue) : nil
      let roleValueValid = roleError == .success && role != nil
      roleQueries.append(AXWindowRoleDiagnostic(error: roleError, role: role, valueValid: roleValueValid))
      if role == kAXWindowRole || role == kAXSheetRole {
        realWindows.append(element)
      } else if role == kAXApplicationRole {
        placeholderCount += 1
      } else if roleValueValid {
        otherRoleCount += 1
      }
    }
    return AXWindowQueryOutcome(
      processID: processID,
      trusted: AXIsProcessTrusted(),
      queries: queries,
      roleQueries: roleQueries,
      realWindows: realWindows,
      placeholderCount: placeholderCount,
      otherRoleCount: otherRoleCount
    )
  }

  private func throwCriticalWindowQueryFailure(_ outcome: AXWindowQueryOutcome, code: String) throws {
    let reason = classifyAXWindowQuery(
      queries: outcome.queries,
      realWindowCount: outcome.realWindows.count,
      placeholderCount: outcome.placeholderCount,
      otherRoleCount: outcome.otherRoleCount,
      matchingTitleCount: nil,
      roleErrors: outcome.roleQueries.map(\.error)
    )
    if reason == "api-disabled" {
      try fail(
        ErrorCode.inputUnavailable,
        "Application window discovery failed because the Accessibility API is disabled for the helper, even if the trust preflight appears granted. Re-enable Accessibility access and restart the helper.",
        data: outcome.diagnostic(reason: reason)
      )
    }
    if reason == "target-non-response" {
      try fail(
        code,
        "The target application did not complete one or more accessibility window queries.",
        data: outcome.diagnostic(reason: reason)
      )
    }
    if reason == "invalid-element" {
      try fail(
        code,
        "The target application's accessibility object became invalid during window discovery.",
        data: outcome.diagnostic(reason: reason)
      )
    }
    if incompleteAXCandidateDiscovery(
      queries: outcome.queries,
      roleQueries: outcome.roleQueries,
      titleErrorCount: 0
    ) {
      try fail(
        code,
        "Accessibility returned an incomplete or internally inconsistent window enumeration.",
        data: outcome.diagnostic(reason: "incomplete-window-enumeration")
      )
    }
    if reason == "window-query-failed" {
      try fail(
        code,
        "Accessibility window discovery failed before the target returned a usable window.",
        data: outcome.diagnostic(reason: reason)
      )
    }
  }

  private func queryWindowAttribute(
    _ application: AXUIElement,
    attribute: String
  ) -> AXWindowAttributeDiagnostic {
    var value: CFTypeRef?
    let error = AXUIElementCopyAttributeValue(application, attribute as CFString, &value)
    let elements: [AXUIElement]
    let elementCount: Int
    let valueValid: Bool
    if error == .success {
      if attribute == kAXWindowsAttribute {
        let returnedElements = strictAXElements(value)
        valueValid = returnedElements != nil
        elementCount = returnedElements?.count ?? 0
        elements = returnedElements ?? []
      } else if let element = axElement(value) {
        valueValid = true
        elementCount = 1
        elements = [element]
      } else {
        valueValid = false
        elementCount = 0
        elements = []
      }
    } else {
      valueValid = false
      elementCount = 0
      elements = []
    }
    return AXWindowAttributeDiagnostic(
      attribute: attribute,
      error: error,
      returnedType: cfTypeName(value),
      elementCount: elementCount,
      elements: elements,
      valueValid: valueValid
    )
  }

  private func windowTitleOf(_ element: AXUIElement) throws -> String {
    axString(try copyAXAttribute(element, kAXTitleAttribute)) ?? ""
  }

  private func pidForAXElement(_ element: AXUIElement) -> pid_t? {
    var pid: pid_t = 0
    guard AXUIElementGetPid(element, &pid) == .success else {
      return nil
    }
    return pid
  }
}
