import ApplicationServices
import Foundation
import Security

private func evidenceField(_ value: String?, unavailable: String) -> JSONObject {
  if let value, !value.isEmpty {
    return [
      "status": "available",
      "value": bounded(value, bytes: 4096),
    ]
  }
  return [
    "reason": unavailable,
    "status": "unavailable",
  ]
}

private func hexadecimalString(_ data: Data) -> String {
  data.map { String(format: "%02x", $0) }.joined()
}

private func statusDescription(_ status: OSStatus) -> String {
  if let message = SecCopyErrorMessageString(status, nil) as String? {
    return "\(message) (\(status))"
  }
  return "Security framework status \(status)"
}

private func helperBundlePath(executablePath: String) -> String? {
  var candidate = URL(fileURLWithPath: executablePath).standardizedFileURL.deletingLastPathComponent()
  while candidate.path != "/" {
    if candidate.pathExtension.lowercased() == "app" {
      return canonicalPath(candidate.path)
    }
    candidate.deleteLastPathComponent()
  }
  return nil
}

private func signingEvidence() -> JSONObject {
  let unavailable = "Security framework did not return this value for the running helper."
  var dynamicCode: SecCode?
  let selfStatus = SecCodeCopySelf(SecCSFlags(), &dynamicCode)
  guard selfStatus == errSecSuccess, let dynamicCode else {
    let reason = "SecCodeCopySelf failed: \(statusDescription(selfStatus))."
    return [
      "cdhash": evidenceField(nil, unavailable: reason),
      "designatedRequirement": evidenceField(nil, unavailable: reason),
      "signer": evidenceField(nil, unavailable: reason),
      "source": "Security.framework",
      "teamIdentifier": evidenceField(nil, unavailable: reason),
    ]
  }

  var staticCode: SecStaticCode?
  let staticStatus = SecCodeCopyStaticCode(dynamicCode, SecCSFlags(), &staticCode)
  guard staticStatus == errSecSuccess, let staticCode else {
    let reason = "SecCodeCopyStaticCode failed: \(statusDescription(staticStatus))."
    return [
      "cdhash": evidenceField(nil, unavailable: reason),
      "designatedRequirement": evidenceField(nil, unavailable: reason),
      "signer": evidenceField(nil, unavailable: reason),
      "source": "Security.framework",
      "teamIdentifier": evidenceField(nil, unavailable: reason),
    ]
  }

  var information: CFDictionary?
  let informationStatus = SecCodeCopySigningInformation(
    staticCode,
    SecCSFlags(rawValue: kSecCSSigningInformation),
    &information
  )
  let values = information as? [CFString: Any]
  let informationReason = informationStatus == errSecSuccess
    ? unavailable
    : "SecCodeCopySigningInformation failed: \(statusDescription(informationStatus))."
  let cdhash = (values?[kSecCodeInfoUnique] as? Data).map(hexadecimalString)
  let teamIdentifier = values?[kSecCodeInfoTeamIdentifier] as? String
  let certificates = values?[kSecCodeInfoCertificates] as? [SecCertificate]
  let signer = certificates?.first.flatMap { SecCertificateCopySubjectSummary($0) as String? }

  var requirement: SecRequirement?
  let requirementStatus = SecCodeCopyDesignatedRequirement(staticCode, SecCSFlags(), &requirement)
  var requirementText: CFString?
  let requirementStringStatus: OSStatus
  if requirementStatus == errSecSuccess, let requirement {
    requirementStringStatus = SecRequirementCopyString(requirement, SecCSFlags(), &requirementText)
  } else {
    requirementStringStatus = requirementStatus
  }
  let requirementReason = requirementStringStatus == errSecSuccess
    ? unavailable
    : "Reading the designated requirement failed: \(statusDescription(requirementStringStatus))."

  return [
    "cdhash": evidenceField(cdhash, unavailable: informationReason),
    "designatedRequirement": evidenceField(requirementText as String?, unavailable: requirementReason),
    "signer": evidenceField(signer, unavailable: informationReason),
    "source": "Security.framework",
    "teamIdentifier": evidenceField(teamIdentifier, unavailable: informationReason),
  ]
}

func createPermissionDiagnostic(prompt: Bool) -> JSONObject {
  let accessibilityBefore = AXIsProcessTrusted()
  let postEventBefore = CGPreflightPostEventAccess()
  let screenCaptureBefore = CGPreflightScreenCaptureAccess()

  var accessibilityAfter = accessibilityBefore
  var screenCaptureAfter = screenCaptureBefore
  var screenCaptureRequestResult: Bool?
  if prompt {
    let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
    accessibilityAfter = AXIsProcessTrustedWithOptions(options)
    screenCaptureRequestResult = CGRequestScreenCaptureAccess()
    screenCaptureAfter = CGPreflightScreenCaptureAccess()
  }

  let executablePath = processExecutablePath(getpid())
    ?? canonicalPath(CommandLine.arguments.first ?? "")
  let bundlePath = helperBundlePath(executablePath: executablePath)
  var accessibility: JSONObject = ["preflight": accessibilityBefore]
  var screenCapture: JSONObject = ["preflight": screenCaptureBefore]
  if prompt {
    accessibility["afterPrompt"] = accessibilityAfter
    screenCapture["afterPrompt"] = screenCaptureAfter
    screenCapture["requestResult"] = screenCaptureRequestResult ?? false
  }

  return [
    "notes": [
      "Ordinary helper commands never request privacy permissions.",
      "Screen Recording permission changes may require restarting the helper before preflight state and window metadata update.",
    ],
    "permissions": [
      "accessibility": accessibility,
      "postEvent": [
        "preflight": postEventBefore,
        "promptSupportedByThisMode": false,
      ],
      "screenCapture": screenCapture,
    ],
    "process": [
      "appBundlePath": evidenceField(bundlePath, unavailable: "The running executable is not nested in an .app bundle."),
      "executablePath": executablePath,
      "parentPid": Int(getppid()),
      "pid": Int(getpid()),
    ],
    "promptRequested": prompt,
    "schemaVersion": 1,
    "signing": signingEvidence(),
    "type": "permissions",
  ]
}
