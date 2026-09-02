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
    for candidate in candidates {
      try token.throwIfCancelled()
      let candidateWindows = try accessibilityWindows(processID: candidate.processIdentifier)
      for window in candidateWindows where (try windowTitleOf(window)) == windowTitle {
        matches.append((candidate, window))
      }
    }
    if matches.isEmpty {
      try fail(ErrorCode.attachFailed, "No window titled \"\(windowTitle)\" is currently open.")
    }
    if matches.count > 1 {
      try fail(
        ErrorCode.ambiguousTarget,
        "\(matches.count) windows are titled \"\(windowTitle)\", so the target is ambiguous."
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
          let frame = axGeometry.width > 0 && axGeometry.height > 0
            ? axGeometry
            : (coreGraphicsWindowFrame(processID: lease.processID, title: title) ?? .zero)
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
        "The application exposes \(candidateCount) live accessibility window candidate(s), but \(zeroGeometryCount) have empty geometry."
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
        let role = axString(try copyAXAttribute(record.element, kAXRoleAttribute))
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
    let matches = try accessibilityWindows(processID: processID).filter {
      try windowTitleOf($0) == exactTitle
    }
    if matches.isEmpty {
      try fail(missingCode, "The application does not currently show a window titled \"\(exactTitle)\".")
    }
    if matches.count > 1 {
      try fail(
        ErrorCode.ambiguousTarget,
        "The application shows \(matches.count) windows titled \"\(exactTitle)\"."
      )
    }
    return matches[0]
  }

  private func accessibilityWindows(processID: pid_t) throws -> [AXUIElement] {
    try requireAccessibility("Application window discovery")
    let application = AXUIElementCreateApplication(processID)
    var elements = axElements(try copyAXAttribute(application, kAXWindowsAttribute))
    for attribute in [kAXMainWindowAttribute, kAXFocusedWindowAttribute] {
      if let element = axElement(try copyOptionalAXAttribute(application, attribute)) {
        elements.append(element)
      }
    }
    return try uniqueAXElements(elements).filter {
      let role = axString(try copyAXAttribute($0, kAXRoleAttribute))
      return role == kAXWindowRole || role == kAXSheetRole
    }
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
