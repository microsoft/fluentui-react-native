import ApplicationServices
import Foundation
import Darwin

#if !arch(arm64)
  #error("Furn Desktop Driver Host V1 supports only macOS arm64.")
#endif

typealias JSONObject = [String: Any]

enum ErrorCode {
  static let unsupported = "unsupported-operation"
  static let staleElement = "stale-element"
  static let invalidRequest = "invalid-request"
  static let invalidParams = "invalid-params"
  static let noSuchWindow = "no-such-window"
  static let noSuchElement = "no-such-element"
  static let notInteractable = "element-not-interactable"
  static let automationFailed = "automation-failed"
  static let inputUnavailable = "input-unavailable"
  static let inputBusy = "input-busy"
  static let inputFailed = "input-failed"
  static let launchFailed = "launch-failed"
  static let attachFailed = "attach-failed"
  static let leaseInvalid = "lease-invalid"
  static let ambiguousTarget = "ambiguous-target"
  static let noSuchLease = "no-such-lease"
  static let windowActivation = "window-activation-failed"
  static let captureFailed = "capture-failed"
  static let treeTooLarge = "tree-too-large"
  static let internalError = "internal-error"
}

struct HelperError: Error, CustomStringConvertible {
  let code: String
  let message: String
  let data: JSONObject?

  var description: String { message }

  init(code: String, message: String, data: JSONObject? = nil) {
    self.code = code
    self.message = message
    self.data = data
  }
}

struct CancelledError: Error {}

@inline(__always)
func fail(_ code: String, _ message: String, data: JSONObject? = nil) throws -> Never {
  throw HelperError(code: code, message: message, data: data)
}

final class CancellationToken: @unchecked Sendable {
  private let lock = NSLock()
  private var cancelled = false

  func cancel() {
    lock.lock()
    cancelled = true
    lock.unlock()
  }

  func reset() {
    lock.lock()
    cancelled = false
    lock.unlock()
  }

  func throwIfCancelled() throws {
    lock.lock()
    let value = cancelled
    lock.unlock()
    if value {
      throw CancelledError()
    }
  }

  func wait(milliseconds: Int) throws {
    let deadline = DispatchTime.now() + .milliseconds(max(0, milliseconds))
    repeat {
      try throwIfCancelled()
      let remaining = deadline.uptimeNanoseconds > DispatchTime.now().uptimeNanoseconds
        ? deadline.uptimeNanoseconds - DispatchTime.now().uptimeNanoseconds
        : 0
      if remaining == 0 {
        break
      }
      usleep(useconds_t(min(10_000, max(1_000, remaining / 1_000))))
    } while true
    try throwIfCancelled()
  }
}

final class IdentifierGenerator: @unchecked Sendable {
  static let shared = IdentifierGenerator()

  private let lock = NSLock()
  private let salt = String(UUID().uuidString.prefix(8)).lowercased()
  private var nextValue: UInt64 = 1

  func next(_ prefix: String) -> String {
    lock.lock()
    let value = nextValue
    nextValue += 1
    lock.unlock()
    return "\(prefix)-\(salt)-\(String(value, radix: 16))"
  }
}

func requireObject(_ value: Any?, _ message: String) throws -> JSONObject {
  guard let object = value as? JSONObject else {
    try fail(ErrorCode.invalidParams, message)
  }
  return object
}

func requireString(_ object: JSONObject, _ key: String) throws -> String {
  guard let value = object[key] as? String, !value.isEmpty else {
    try fail(ErrorCode.invalidParams, "The request is missing the required \"\(key)\" parameter.")
  }
  return value
}

func optionalString(_ object: JSONObject, _ key: String) -> String? {
  guard let value = object[key] as? String, !value.isEmpty else {
    return nil
  }
  return value
}

func number(_ object: JSONObject, _ key: String, default defaultValue: Double = 0) -> Double {
  guard let value = object[key] as? NSNumber, !isBoolean(value) else {
    return defaultValue
  }
  return value.doubleValue
}

func integer(_ object: JSONObject, _ key: String, default defaultValue: Int = 0) -> Int {
  guard let value = object[key] as? NSNumber, !isBoolean(value) else {
    return defaultValue
  }
  return value.intValue
}

func isBoolean(_ value: NSNumber) -> Bool {
  CFGetTypeID(value) == CFBooleanGetTypeID()
}

func parseJSON(_ data: Data) throws -> Any {
  do {
    return try JSONSerialization.jsonObject(with: data, options: [.fragmentsAllowed])
  } catch {
    try fail(ErrorCode.invalidRequest, "Malformed JSON: \(error.localizedDescription)")
  }
}

func serializeJSON(_ value: Any) throws -> Data {
  guard JSONSerialization.isValidJSONObject(value) else {
    try fail(ErrorCode.internalError, "The native command produced a value that cannot be encoded as JSON.")
  }
  do {
    return try JSONSerialization.data(withJSONObject: value, options: [])
  } catch {
    try fail(ErrorCode.internalError, "Encoding JSON failed: \(error.localizedDescription)")
  }
}

func bounded(_ value: String, bytes: Int) -> String {
  guard value.utf8.count > bytes else {
    return value
  }
  var output = ""
  var count = 0
  for character in value {
    let size = String(character).utf8.count
    if count + size > bytes {
      break
    }
    output.append(character)
    count += size
  }
  return output + "..."
}

func writeDiagnostic(_ message: String) {
  let line = bounded(message, bytes: 1000) + "\n"
  FileHandle.standardError.write(Data(line.utf8))
}

func rounded(_ value: CGFloat) -> Double {
  guard value.isFinite else {
    return 0
  }
  return (Double(value) * 100).rounded() / 100
}

func rounded(_ value: Double) -> Double {
  guard value.isFinite else {
    return 0
  }
  return (value * 100).rounded() / 100
}

func rectJSON(_ rect: CGRect) -> JSONObject {
  [
    "height": rounded(rect.height),
    "width": rounded(rect.width),
    "x": rounded(rect.origin.x),
    "y": rounded(rect.origin.y),
  ]
}

func canonicalPath(_ path: String) -> String {
  URL(fileURLWithPath: path).standardizedFileURL.resolvingSymlinksInPath().path
}

func processIsAlive(_ pid: pid_t) -> Bool {
  guard pid > 0 else {
    return false
  }
  if kill(pid, 0) == 0 {
    return true
  }
  return errno == EPERM
}

func processStartTime(_ pid: pid_t) -> Date? {
  var info = proc_bsdinfo()
  let size = Int32(MemoryLayout<proc_bsdinfo>.size)
  let read = withUnsafeMutablePointer(to: &info) {
    proc_pidinfo(pid, PROC_PIDTBSDINFO, 0, $0, size)
  }
  guard read == size else {
    return nil
  }
  return Date(
    timeIntervalSince1970: TimeInterval(info.pbi_start_tvsec)
      + TimeInterval(info.pbi_start_tvusec) / 1_000_000
  )
}

func processExecutablePath(_ pid: pid_t) -> String? {
  var buffer = [CChar](repeating: 0, count: Int(MAXPATHLEN) * 4)
  let length = proc_pidpath(pid, &buffer, UInt32(buffer.count))
  guard length > 0 else {
    return nil
  }
  return canonicalPath(String(cString: buffer))
}

private let isoFormatter: ISO8601DateFormatter = {
  let formatter = ISO8601DateFormatter()
  formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
  return formatter
}()

func formatDate(_ date: Date) -> String {
  isoFormatter.string(from: date)
}

func parseDate(_ value: String) -> Date? {
  if let date = isoFormatter.date(from: value) {
    return date
  }
  let fallback = ISO8601DateFormatter()
  fallback.formatOptions = [.withInternetDateTime]
  return fallback.date(from: value)
}

func requireAccessibility(_ operation: String) throws {
  guard AXIsProcessTrusted() else {
    try fail(
      ErrorCode.inputUnavailable,
      "\(operation) requires Accessibility permission. Enable Furn Desktop Driver Host in System Settings > Privacy & Security > Accessibility, then restart the helper."
    )
  }
}

func describeAXError(_ error: AXError) -> String {
  switch error {
  case .actionUnsupported:
    return "the accessibility action is unsupported"
  case .apiDisabled:
    return "the Accessibility API is disabled"
  case .attributeUnsupported:
    return "the accessibility attribute is unsupported"
  case .cannotComplete:
    return "the target application did not complete the accessibility request"
  case .failure:
    return "the Accessibility API reported a general failure"
  case .illegalArgument:
    return "the accessibility request contained an illegal argument"
  case .invalidUIElement:
    return "the accessibility element is no longer valid"
  case .invalidUIElementObserver:
    return "the accessibility observer is no longer valid"
  case .noValue:
    return "the accessibility attribute has no value"
  case .notEnoughPrecision:
    return "the accessibility value cannot be represented precisely"
  case .notImplemented:
    return "the accessibility operation is not implemented"
  case .notificationAlreadyRegistered:
    return "the accessibility notification is already registered"
  case .notificationNotRegistered:
    return "the accessibility notification is not registered"
  case .notificationUnsupported:
    return "the accessibility notification is unsupported"
  case .parameterizedAttributeUnsupported:
    return "the parameterized accessibility attribute is unsupported"
  case .success:
    return "success"
  @unknown default:
    return "Accessibility error \(error.rawValue)"
  }
}

func axErrorName(_ error: AXError) -> String {
  switch error {
  case .actionUnsupported:
    return "actionUnsupported"
  case .apiDisabled:
    return "apiDisabled"
  case .attributeUnsupported:
    return "attributeUnsupported"
  case .cannotComplete:
    return "cannotComplete"
  case .failure:
    return "failure"
  case .illegalArgument:
    return "illegalArgument"
  case .invalidUIElement:
    return "invalidUIElement"
  case .invalidUIElementObserver:
    return "invalidUIElementObserver"
  case .noValue:
    return "noValue"
  case .notEnoughPrecision:
    return "notEnoughPrecision"
  case .notImplemented:
    return "notImplemented"
  case .notificationAlreadyRegistered:
    return "notificationAlreadyRegistered"
  case .notificationNotRegistered:
    return "notificationNotRegistered"
  case .notificationUnsupported:
    return "notificationUnsupported"
  case .parameterizedAttributeUnsupported:
    return "parameterizedAttributeUnsupported"
  case .success:
    return "success"
  @unknown default:
    return "unknown"
  }
}

func axErrorJSON(_ error: AXError) -> JSONObject {
  [
    "code": Int(error.rawValue),
    "description": describeAXError(error),
    "name": axErrorName(error),
  ]
}

func cfTypeName(_ value: CFTypeRef?) -> String {
  guard let value else {
    return "none"
  }
  return (CFCopyTypeIDDescription(CFGetTypeID(value)) as String?) ?? "unknown"
}

func throwAX(_ error: AXError, operation: String, staleMessage: String? = nil) throws {
  if error == .success {
    return
  }
  if error == .invalidUIElement {
    try fail(ErrorCode.staleElement, staleMessage ?? "\(operation) failed because the accessibility element is no longer valid.")
  }
  if error == .apiDisabled {
    try fail(
      ErrorCode.inputUnavailable,
      "\(operation) failed because the Accessibility API is disabled for the helper. Re-enable Accessibility access and restart it.",
      data: [
        "accessibility": [
          "preflight": AXIsProcessTrusted(),
        ],
        "axError": axErrorJSON(error),
        "reason": "api-disabled",
      ]
    )
  }
  try fail(ErrorCode.automationFailed, "\(operation) failed because \(describeAXError(error)).")
}

func copyAXAttribute(_ element: AXUIElement, _ attribute: String) throws -> CFTypeRef? {
  var value: CFTypeRef?
  let error = AXUIElementCopyAttributeValue(element, attribute as CFString, &value)
  if error == .attributeUnsupported || error == .noValue {
    return nil
  }
  try throwAX(error, operation: "Reading \(attribute)")
  return value
}

func copyOptionalAXAttribute(_ element: AXUIElement, _ attribute: String) throws -> CFTypeRef? {
  var value: CFTypeRef?
  let error = AXUIElementCopyAttributeValue(element, attribute as CFString, &value)
  // Fabric elements can advertise optional metadata or geometry that disappears during a React remount.
  if error == .attributeUnsupported || error == .noValue || error == .failure || error == .illegalArgument {
    return nil
  }
  try throwAX(error, operation: "Reading \(attribute)")
  return value
}

func requiredAXRole(_ element: AXUIElement, staleMessage: String) throws -> String? {
  var value: CFTypeRef?
  let error = AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &value)
  if error == .invalidUIElement || error == .illegalArgument {
    try fail(ErrorCode.staleElement, staleMessage)
  }
  try throwAX(error, operation: "Reading \(kAXRoleAttribute)", staleMessage: staleMessage)
  return axString(value)
}

func copyAXActionNames(_ element: AXUIElement) throws -> [String] {
  var names: CFArray?
  let error = AXUIElementCopyActionNames(element, &names)
  if error == .actionUnsupported {
    return []
  }
  try throwAX(error, operation: "Reading accessibility actions")
  return names as? [String] ?? []
}

func axPoint(_ value: CFTypeRef?) -> CGPoint? {
  guard let value, CFGetTypeID(value) == AXValueGetTypeID() else {
    return nil
  }
  var point = CGPoint.zero
  guard AXValueGetValue(value as! AXValue, .cgPoint, &point) else {
    return nil
  }
  return point
}

func axSize(_ value: CFTypeRef?) -> CGSize? {
  guard let value, CFGetTypeID(value) == AXValueGetTypeID() else {
    return nil
  }
  var size = CGSize.zero
  guard AXValueGetValue(value as! AXValue, .cgSize, &size) else {
    return nil
  }
  return size
}

func axString(_ value: CFTypeRef?) -> String? {
  guard let value else {
    return nil
  }
  if CFGetTypeID(value) == CFStringGetTypeID() {
    return value as? String
  }
  return nil
}

func axNumber(_ value: CFTypeRef?) -> NSNumber? {
  guard let value, CFGetTypeID(value) == CFNumberGetTypeID() || CFGetTypeID(value) == CFBooleanGetTypeID() else {
    return nil
  }
  return value as? NSNumber
}

func axElements(_ value: CFTypeRef?) -> [AXUIElement] {
  guard let value, CFGetTypeID(value) == CFArrayGetTypeID() else {
    return []
  }
  return value as? [AXUIElement] ?? []
}

func strictAXElements(_ value: CFTypeRef?) -> [AXUIElement]? {
  guard let value, CFGetTypeID(value) == CFArrayGetTypeID(), let items = value as? [AnyObject] else {
    return nil
  }
  var elements: [AXUIElement] = []
  elements.reserveCapacity(items.count)
  for item in items {
    guard CFGetTypeID(item) == AXUIElementGetTypeID() else {
      return nil
    }
    elements.append(item as! AXUIElement)
  }
  return elements
}

func axElement(_ value: CFTypeRef?) -> AXUIElement? {
  guard let value, CFGetTypeID(value) == AXUIElementGetTypeID() else {
    return nil
  }
  return (value as! AXUIElement)
}

func axFrame(_ element: AXUIElement) throws -> CGRect {
  let position = axPoint(try copyAXAttribute(element, kAXPositionAttribute))
  let size = axSize(try copyAXAttribute(element, kAXSizeAttribute))
  guard let position, let size else {
    return .zero
  }
  return CGRect(origin: position, size: size)
}

func axOptionalFrame(_ element: AXUIElement) throws -> CGRect {
  let position = axPoint(try copyOptionalAXAttribute(element, kAXPositionAttribute))
  let size = axSize(try copyOptionalAXAttribute(element, kAXSizeAttribute))
  guard let position, let size else {
    return .zero
  }
  return CGRect(origin: position, size: size)
}

struct CoreGraphicsWindowCandidate {
  let frame: CGRect
  let title: String?
}

struct CoreGraphicsWindowFrameMatch {
  let frame: CGRect?
  let diagnostics: JSONObject
}

func selectCoreGraphicsWindowFrame(
  candidates: [CoreGraphicsWindowCandidate],
  title: String,
  authoritativeWindowCount: Int,
  screenCaptureAccess: Bool
) -> CoreGraphicsWindowFrameMatch {
  let uniqueFrames = candidates.reduce(into: [CGRect]()) { frames, candidate in
    if !frames.contains(where: { $0.equalTo(candidate.frame) }) {
      frames.append(candidate.frame)
    }
  }
  var reason = "ambiguous"
  var selected: CGRect?
  let titleMatchingAvailable = candidates.contains(where: { $0.title != nil })
  if titleMatchingAvailable {
    let titleMatches = candidates.filter { candidate in
      title.isEmpty ? candidate.title?.isEmpty == true : candidate.title == title
    }
    if titleMatches.count == 1 {
      reason = "unique-title"
      selected = titleMatches[0].frame
    } else if titleMatches.count > 1 {
      let titleFrames = titleMatches.reduce(into: [CGRect]()) { frames, candidate in
        if !frames.contains(where: { $0.equalTo(candidate.frame) }) {
          frames.append(candidate.frame)
        }
      }
      if titleFrames.count == 1 {
        reason = "unique-title-geometry"
        selected = titleFrames[0]
      }
    } else {
      reason = "no-matching-title"
    }
  } else if authoritativeWindowCount == 1, candidates.count == 1 {
    reason = "unique-candidate"
    selected = candidates[0].frame
  } else if authoritativeWindowCount == 1, uniqueFrames.count == 1, let frame = uniqueFrames.first {
    reason = "unique-geometry"
    selected = frame
  } else {
    reason = "title-unavailable"
  }
  let boundedCandidates = candidates.prefix(16).map { candidate -> JSONObject in
    var value: JSONObject = ["frame": rectJSON(candidate.frame)]
    if let title = candidate.title {
      value["title"] = bounded(title, bytes: 256)
    }
    return value
  }
  return CoreGraphicsWindowFrameMatch(
    frame: selected,
    diagnostics: [
      "candidateCount": candidates.count,
      "candidates": boundedCandidates,
      "authoritativeWindowCount": authoritativeWindowCount,
      "reason": reason,
      "screenCaptureAccess": screenCaptureAccess,
      "titleMatchingAvailable": titleMatchingAvailable,
      "truncated": candidates.count > boundedCandidates.count,
      "uniqueGeometryCount": uniqueFrames.count,
    ]
  )
}

func coreGraphicsWindowFrame(
  processID: pid_t,
  title: String,
  authoritativeWindowCount: Int
) -> CoreGraphicsWindowFrameMatch {
  let screenCaptureAccess = CGPreflightScreenCaptureAccess()
  guard
    let descriptions = CGWindowListCopyWindowInfo([.optionAll, .excludeDesktopElements], kCGNullWindowID)
      as? [[String: Any]]
  else {
    return CoreGraphicsWindowFrameMatch(
      frame: nil,
      diagnostics: [
        "candidateCount": 0,
        "reason": "enumeration-failed",
        "screenCaptureAccess": screenCaptureAccess,
        "titleMatchingAvailable": false,
      ]
    )
  }
  let candidates = descriptions.compactMap { description -> CoreGraphicsWindowCandidate? in
    guard
      (description[kCGWindowOwnerPID as String] as? NSNumber)?.int32Value == processID,
      (description[kCGWindowLayer as String] as? NSNumber)?.intValue == 0,
      let bounds = description[kCGWindowBounds as String] as? [String: Any],
      let frame = CGRect(dictionaryRepresentation: bounds as CFDictionary),
      frame.width > 0,
      frame.height > 0
    else {
      return nil
    }
    return CoreGraphicsWindowCandidate(
      frame: frame,
      title: description[kCGWindowName as String] as? String
    )
  }
  return selectCoreGraphicsWindowFrame(
    candidates: candidates,
    title: title,
    authoritativeWindowCount: authoritativeWindowCount,
    screenCaptureAccess: screenCaptureAccess
  )
}

func sameAXElement(_ left: AXUIElement, _ right: AXUIElement) -> Bool {
  CFEqual(left, right)
}

func uniqueAXElements(_ elements: [AXUIElement]) -> [AXUIElement] {
  var elementsByHash: [CFHashCode: [AXUIElement]] = [:]
  var result: [AXUIElement] = []
  for element in elements {
    let hash = CFHash(element)
    if elementsByHash[hash]?.contains(where: { sameAXElement($0, element) }) == true {
      continue
    }
    elementsByHash[hash, default: []].append(element)
    result.append(element)
  }
  return result
}
