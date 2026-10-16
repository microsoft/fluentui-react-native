import AppKit
import ApplicationServices
import Foundation

/// Records Accessibility window notifications for leased applications.
///
/// Observers run on a dedicated run-loop thread so notifications are delivered while the worker executes commands.
/// Events are advisory: queries remain authoritative, but a destroyed notification proves a tracked window closed and
/// recent structural events show that window publication is still settling.
final class WindowEventMonitor: @unchecked Sendable {
  static let maximumEvents = 512
  static let diagnosticEventLimit = 48

  private static let applicationNotifications = [
    kAXWindowCreatedNotification,
    kAXFocusedWindowChangedNotification,
    kAXMainWindowChangedNotification,
    kAXUIElementDestroyedNotification,
    kAXWindowMiniaturizedNotification,
    kAXWindowDeminiaturizedNotification,
    kAXApplicationActivatedNotification,
    kAXApplicationDeactivatedNotification,
    kAXApplicationHiddenNotification,
    kAXApplicationShownNotification,
  ]
  private static let structuralNotifications: Set<String> = [
    kAXWindowCreatedNotification,
    kAXFocusedWindowChangedNotification,
    kAXMainWindowChangedNotification,
    kAXUIElementDestroyedNotification,
    kAXWindowMiniaturizedNotification,
    kAXWindowDeminiaturizedNotification,
  ]

  struct Event {
    let sequence: Int
    let uptimeNanoseconds: UInt64
    let processID: pid_t
    let notification: String
    let elementHash: CFHashCode
    let windowID: String?
    let descriptor: JSONObject?
  }

  private struct TrackedWindow {
    let element: AXUIElement
    let windowID: String
  }

  private let lock = NSLock()
  private var events: [Event] = []
  private var nextSequence = 1
  private var observers: [pid_t: AXObserver] = [:]
  private var registrationFailures: [pid_t: [String]] = [:]
  private var trackedByHash: [CFHashCode: [TrackedWindow]] = [:]
  private var watchedElements: [pid_t: [CFHashCode: [AXUIElement]]] = [:]
  private var closedWindowIDs: Set<String> = []
  private var lastStructuralEvent: [pid_t: UInt64] = [:]
  private var runLoop: CFRunLoop?
  private var thread: Thread?
  private let started = DispatchSemaphore(value: 0)

  /// Receives `window-closed` notifications for tracked windows; set before any application is observed.
  var publishWindowClosed: ((String) -> Void)?

  /// Starts observing an application process. Registration failures are recorded rather than thrown because events
  /// only add diagnostics and settling hints; automation must not depend on them.
  func observe(processID: pid_t) {
    startThreadIfNeeded()
    lock.lock()
    let existing = observers[processID]
    lock.unlock()
    guard existing == nil else {
      return
    }
    var created: AXObserver?
    let createError = AXObserverCreate(processID, windowEventCallback, &created)
    guard createError == .success, let observer = created else {
      lock.lock()
      registrationFailures[processID] = ["AXObserverCreate: \(axErrorName(createError))"]
      lock.unlock()
      return
    }
    let refcon = Unmanaged.passUnretained(self).toOpaque()
    let application = AXUIElementCreateApplication(processID)
    var failures: [String] = []
    for notification in Self.applicationNotifications {
      let error = AXObserverAddNotification(observer, application, notification as CFString, refcon)
      if error != .success && error != .notificationAlreadyRegistered {
        failures.append("\(notification): \(axErrorName(error))")
      }
    }
    lock.lock()
    observers[processID] = observer
    registrationFailures[processID] = failures
    let loop = runLoop
    lock.unlock()
    if let loop {
      CFRunLoopPerformBlock(loop, CFRunLoopMode.defaultMode.rawValue) {
        CFRunLoopAddSource(CFRunLoopGetCurrent(), AXObserverGetRunLoopSource(observer), .defaultMode)
      }
      CFRunLoopWakeUp(loop)
    }
  }

  /// Stops observing a process and discards its events and tracked windows.
  func stop(processID: pid_t) {
    lock.lock()
    let observer = observers.removeValue(forKey: processID)
    registrationFailures.removeValue(forKey: processID)
    watchedElements.removeValue(forKey: processID)
    lastStructuralEvent.removeValue(forKey: processID)
    events.removeAll { $0.processID == processID }
    let loop = runLoop
    lock.unlock()
    if let observer, let loop {
      CFRunLoopPerformBlock(loop, CFRunLoopMode.defaultMode.rawValue) {
        CFRunLoopRemoveSource(CFRunLoopGetCurrent(), AXObserverGetRunLoopSource(observer), .defaultMode)
      }
      CFRunLoopWakeUp(loop)
    }
  }

  /// Associates a registered window with its helper ID and watches it for destruction.
  func track(_ element: AXUIElement, windowID: String, processID: pid_t) {
    lock.lock()
    let hash = CFHash(element)
    trackedByHash[hash, default: []].removeAll { $0.windowID == windowID }
    trackedByHash[hash, default: []].append(TrackedWindow(element: element, windowID: windowID))
    closedWindowIDs.remove(windowID)
    lock.unlock()
    watchDestroyed(element, processID: processID)
  }

  func forget(windowID: String) {
    lock.lock()
    for hash in trackedByHash.keys {
      trackedByHash[hash]?.removeAll { $0.windowID == windowID }
    }
    trackedByHash = trackedByHash.filter { !$0.value.isEmpty }
    closedWindowIDs.remove(windowID)
    lock.unlock()
  }

  /// True only when Accessibility reported the tracked window destroyed.
  func isClosed(windowID: String) -> Bool {
    lock.lock()
    defer { lock.unlock() }
    return closedWindowIDs.contains(windowID)
  }

  /// True while a structural window event for the process arrived within the quiet interval.
  func isSettling(processID: pid_t, quietMilliseconds: UInt64 = 400) -> Bool {
    lock.lock()
    let last = lastStructuralEvent[processID]
    lock.unlock()
    guard let last else {
      return false
    }
    return DispatchTime.now().uptimeNanoseconds - last < quietMilliseconds * 1_000_000
  }

  func diagnostic(processID: pid_t, limit: Int = WindowEventMonitor.diagnosticEventLimit) -> JSONObject {
    let now = DispatchTime.now().uptimeNanoseconds
    lock.lock()
    let observing = observers[processID] != nil
    let failures = registrationFailures[processID] ?? []
    let recent = events.filter { $0.processID == processID }.suffix(limit)
    let total = events.filter { $0.processID == processID }.count
    lock.unlock()
    var result: JSONObject = [
      "events": recent.map { event in
        var value: JSONObject = [
          "ageMs": Int((now - event.uptimeNanoseconds) / 1_000_000),
          "element": "ax:\(event.elementHash)",
          "notification": event.notification,
          "sequence": event.sequence,
        ]
        if let windowID = event.windowID {
          value["windowId"] = windowID
        }
        if let descriptor = event.descriptor {
          value["descriptor"] = descriptor
        }
        return value
      },
      "eventsTruncated": total > recent.count,
      "observing": observing,
      "source": "AXObserver",
    ]
    if !failures.isEmpty {
      result["registrationFailures"] = failures
    }
    return result
  }

  func record(element: AXUIElement, notification: String, describe: Bool = true) {
    var processID: pid_t = 0
    _ = AXUIElementGetPid(element, &processID)
    let now = DispatchTime.now().uptimeNanoseconds
    // Destroyed elements cannot be queried; describe live elements immediately because they may be transient.
    var descriptor: JSONObject?
    if describe && Self.describedNotifications.contains(notification) {
      descriptor = Self.describe(element)
    } else if describe && Self.activationNotifications.contains(notification) {
      // Activation changes are attributed to whichever application now owns keyboard focus.
      descriptor = ["focusedApplication": focusedApplicationIdentity() ?? ["unavailable": true]]
    }
    let hash = CFHash(element)
    var closedWindowID: String?
    lock.lock()
    let windowID = trackedByHash[hash]?.first { sameAXElement($0.element, element) }?.windowID
    if notification == kAXUIElementDestroyedNotification, let windowID, !closedWindowIDs.contains(windowID) {
      closedWindowIDs.insert(windowID)
      closedWindowID = windowID
    }
    events.append(Event(
      sequence: nextSequence,
      uptimeNanoseconds: now,
      processID: processID,
      notification: notification,
      elementHash: hash,
      windowID: windowID,
      descriptor: descriptor
    ))
    nextSequence += 1
    if events.count > Self.maximumEvents {
      events.removeFirst(events.count - Self.maximumEvents)
    }
    if Self.structuralNotifications.contains(notification) {
      lastStructuralEvent[processID] = now
    }
    lock.unlock()
    if notification == kAXWindowCreatedNotification {
      watchDestroyed(element, processID: processID)
    }
    if let closedWindowID {
      publishWindowClosed?(closedWindowID)
    }
  }

  private static let activationNotifications: Set<String> = [
    kAXApplicationActivatedNotification,
    kAXApplicationDeactivatedNotification,
  ]
  private static let describedNotifications: Set<String> = [
    kAXWindowCreatedNotification,
    kAXFocusedWindowChangedNotification,
    kAXMainWindowChangedNotification,
  ]

  /// Reads a bounded identity summary so transient elements remain identifiable after they disappear.
  static func describe(_ element: AXUIElement) -> JSONObject {
    // The timeout applies only to this notification's element object, not to equal elements used by commands.
    _ = AXUIElementSetMessagingTimeout(element, 1)
    var result: JSONObject = [:]
    var errors: JSONObject = [:]
    func read(_ attribute: String) -> CFTypeRef? {
      var value: CFTypeRef?
      let error = AXUIElementCopyAttributeValue(element, attribute as CFString, &value)
      if error != .success && error != .noValue && error != .attributeUnsupported {
        errors[attribute] = axErrorName(error)
      }
      return error == .success ? value : nil
    }
    for (attribute, key) in [
      (kAXRoleAttribute, "role"),
      (kAXSubroleAttribute, "subrole"),
      (kAXRoleDescriptionAttribute, "roleDescription"),
      (kAXIdentifierAttribute, "identifier"),
      (kAXTitleAttribute, "title"),
    ] {
      if let value = axString(read(attribute)) {
        result[key] = bounded(value, bytes: 128)
      }
    }
    if let position = axPoint(read(kAXPositionAttribute)), let size = axSize(read(kAXSizeAttribute)) {
      let frame = CGRect(origin: position, size: size)
      result["frame"] = [
        "height": Double(size.height),
        "width": Double(size.width),
        "x": Double(position.x),
        "y": Double(position.y),
      ]
      var processID: pid_t = 0
      if AXUIElementGetPid(element, &processID) == .success, let window = coreGraphicsWindow(processID: processID, frame: frame) {
        result["coreGraphicsWindow"] = window
      }
    }
    if !errors.isEmpty {
      result["errors"] = errors
    }
    if let parent = axElement(read(kAXParentAttribute)) {
      result["parent"] = "ax:\(CFHash(parent))"
    }
    if let children = read(kAXChildrenAttribute), CFGetTypeID(children) == CFArrayGetTypeID() {
      result["childCount"] = CFArrayGetCount((children as! CFArray))
    }
    if result.isEmpty {
      result["unavailable"] = true
    }
    return result
  }

  private func watchDestroyed(_ element: AXUIElement, processID: pid_t) {
    lock.lock()
    let hash = CFHash(element)
    let alreadyWatched = watchedElements[processID]?[hash]?.contains { sameAXElement($0, element) } == true
    guard !alreadyWatched, let observer = observers[processID] else {
      lock.unlock()
      return
    }
    watchedElements[processID, default: [:]][hash, default: []].append(element)
    lock.unlock()
    let refcon = Unmanaged.passUnretained(self).toOpaque()
    let error = AXObserverAddNotification(observer, element, kAXUIElementDestroyedNotification as CFString, refcon)
    if error != .success && error != .notificationAlreadyRegistered {
      lock.lock()
      registrationFailures[processID, default: []].append("window \(kAXUIElementDestroyedNotification): \(axErrorName(error))")
      lock.unlock()
    }
  }

  private func startThreadIfNeeded() {
    lock.lock()
    guard thread == nil else {
      lock.unlock()
      return
    }
    let thread = Thread { [weak self] in
      // A port keeps the run loop alive while no observer sources are registered.
      RunLoop.current.add(Port(), forMode: .default)
      self?.lock.lock()
      self?.runLoop = CFRunLoopGetCurrent()
      self?.lock.unlock()
      self?.started.signal()
      while true {
        RunLoop.current.run(mode: .default, before: .distantFuture)
      }
    }
    thread.name = "furn-desktop-driver-window-events"
    self.thread = thread
    lock.unlock()
    thread.start()
    started.wait()
  }
}

/// A bounded journal of recent helper commands on the same monotonic clock as window events.
final class CommandJournal: @unchecked Sendable {
  static let maximumEntries = 128

  private struct Entry {
    let sequence: Int
    let command: String
    let startedNanoseconds: UInt64
    var durationMilliseconds: Int?
    var outcome: String
    var detail: JSONObject
  }

  private let lock = NSLock()
  private var entries: [Entry] = []
  private var nextSequence = 1

  func begin(_ command: String, detail: JSONObject) -> Int {
    lock.lock()
    defer { lock.unlock() }
    let sequence = nextSequence
    nextSequence += 1
    entries.append(Entry(
      sequence: sequence,
      command: command,
      startedNanoseconds: DispatchTime.now().uptimeNanoseconds,
      outcome: "running",
      detail: detail
    ))
    if entries.count > Self.maximumEntries {
      entries.removeFirst(entries.count - Self.maximumEntries)
    }
    return sequence
  }

  func finish(_ sequence: Int, outcome: String, detail: JSONObject = [:]) {
    lock.lock()
    defer { lock.unlock() }
    guard let index = entries.lastIndex(where: { $0.sequence == sequence }) else {
      return
    }
    entries[index].durationMilliseconds = Int((DispatchTime.now().uptimeNanoseconds - entries[index].startedNanoseconds) / 1_000_000)
    entries[index].outcome = outcome
    entries[index].detail.merge(detail) { _, new in new }
  }

  /// Adds diagnostic detail to a running entry, such as how a command satisfied its readiness condition.
  func annotate(_ sequence: Int, detail: JSONObject) {
    lock.lock()
    defer { lock.unlock() }
    guard let index = entries.lastIndex(where: { $0.sequence == sequence }) else {
      return
    }
    entries[index].detail.merge(detail) { _, new in new }
  }

  func diagnostic(limit: Int = 64) -> [JSONObject] {
    let now = DispatchTime.now().uptimeNanoseconds
    lock.lock()
    defer { lock.unlock() }
    return entries.suffix(limit).map { entry in
      var value: JSONObject = [
        "ageMs": Int((now - entry.startedNanoseconds) / 1_000_000),
        "command": entry.command,
        "outcome": entry.outcome,
        "sequence": entry.sequence,
      ]
      if let duration = entry.durationMilliseconds {
        value["durationMs"] = duration
      }
      if !entry.detail.isEmpty {
        value["detail"] = entry.detail
      }
      return value
    }
  }
}

private func windowEventCallback(
  _ observer: AXObserver,
  _ element: AXUIElement,
  _ notification: CFString,
  _ refcon: UnsafeMutableRawPointer?
) {
  guard let refcon else {
    return
  }
  Unmanaged<WindowEventMonitor>.fromOpaque(refcon).takeUnretainedValue().record(
    element: element,
    notification: notification as String
  )
}

/// Identifies a process for diagnostics without depending on run-loop-updated workspace state.
func processIdentity(_ processID: pid_t) -> JSONObject {
  var result: JSONObject = ["pid": Int(processID)]
  if let application = NSRunningApplication(processIdentifier: processID) {
    if let name = application.localizedName {
      result["name"] = bounded(name, bytes: 128)
    }
    if let bundleIdentifier = application.bundleIdentifier {
      result["bundleIdentifier"] = bounded(bundleIdentifier, bytes: 256)
    }
  } else {
    var buffer = [CChar](repeating: 0, count: 256)
    if proc_name(processID, &buffer, UInt32(buffer.count)) > 0 {
      result["name"] = String(cString: buffer)
    }
  }
  return result
}

/// Reports the application that owns system-wide keyboard focus.
func focusedApplicationIdentity() -> JSONObject? {
  // Never set a messaging timeout on the system-wide element: AXUIElementSetMessagingTimeout applies it to every
  // Accessibility request in this process.
  let systemWide = AXUIElementCreateSystemWide()
  var value: CFTypeRef?
  guard
    AXUIElementCopyAttributeValue(systemWide, kAXFocusedApplicationAttribute as CFString, &value) == .success,
    let application = axElement(value)
  else {
    return nil
  }
  var processID: pid_t = 0
  guard AXUIElementGetPid(application, &processID) == .success else {
    return nil
  }
  return processIdentity(processID)
}

/// Describes the WindowServer window whose bounds match an Accessibility frame, including off-screen and non-standard
/// layers, so transient AppKit windows can be identified after they disappear.
func coreGraphicsWindow(processID: pid_t, frame: CGRect) -> JSONObject? {
  guard
    let descriptions = CGWindowListCopyWindowInfo([.optionAll, .excludeDesktopElements], kCGNullWindowID)
      as? [[String: Any]]
  else {
    return nil
  }
  let matches = descriptions.filter { description in
    guard
      (description[kCGWindowOwnerPID as String] as? NSNumber)?.int32Value == processID,
      let bounds = description[kCGWindowBounds as String] as? [String: Any],
      let windowFrame = CGRect(dictionaryRepresentation: bounds as CFDictionary)
    else {
      return false
    }
    return abs(windowFrame.minX - frame.minX) < 1 && abs(windowFrame.minY - frame.minY) < 1
      && abs(windowFrame.width - frame.width) < 1 && abs(windowFrame.height - frame.height) < 1
  }
  guard let match = matches.first else {
    return ["matched": false]
  }
  var result: JSONObject = ["matched": true, "matchCount": matches.count]
  if let number = match[kCGWindowNumber as String] as? NSNumber {
    result["number"] = number.intValue
  }
  if let layer = match[kCGWindowLayer as String] as? NSNumber {
    result["layer"] = layer.intValue
  }
  if let alpha = match[kCGWindowAlpha as String] as? NSNumber {
    result["alpha"] = alpha.doubleValue
  }
  result["onscreen"] = (match[kCGWindowIsOnscreen as String] as? NSNumber)?.boolValue ?? false
  if let name = match[kCGWindowName as String] as? String {
    result["name"] = bounded(name, bytes: 128)
  }
  return result
}
