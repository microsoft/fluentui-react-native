import ApplicationServices

struct ApplicationActivation {
  let method: String
  let accessibilityError: AXError?
}

func activateApplication(
  isFrontmost: () -> Bool,
  accessibility: () -> AXError,
  workspace: () -> Void
) -> ApplicationActivation {
  if isFrontmost() {
    return ApplicationActivation(method: "already-frontmost", accessibilityError: nil)
  }
  let error = accessibility()
  if error != .success {
    workspace()
    return ApplicationActivation(method: "workspace", accessibilityError: error)
  }
  if !isFrontmost() {
    workspace()
    return ApplicationActivation(method: "accessibility+workspace", accessibilityError: nil)
  }
  return ApplicationActivation(method: "accessibility", accessibilityError: nil)
}
