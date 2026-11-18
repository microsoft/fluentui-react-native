import ApplicationServices

struct ActionTargetOwnership {
  let windowOwner: (CGPoint, CancellationToken) throws -> pid_t?
  let focusedApplication: () throws -> pid_t?
  let leaseStarts: (pid_t) -> [String]
  let observe: (pid_t) -> ApplicationIncarnation.ExactObservation
  let activatePrimary: (CancellationToken) throws -> Bool

  func requirePointerTarget(_ point: CGPoint, token: CancellationToken) throws {
    try token.throwIfCancelled()
    let owner = try windowOwner(point, token)
    try token.throwIfCancelled()
    guard owns(owner) else {
      try fail(ErrorCode.notInteractable, "The pointer is not over a window of an exactly leased application.")
    }
  }

  func requireKeyboardTarget(allowActivation: Bool, token: CancellationToken) throws {
    try token.throwIfCancelled()
    let foreground = try focusedApplication()
    try token.throwIfCancelled()
    if owns(foreground) { return }
    if allowActivation, foreground != nil, try activatePrimary(token) {
      try token.throwIfCancelled()
      let activated = try focusedApplication()
      try token.throwIfCancelled()
      if owns(activated) { return }
    }
    try fail(ErrorCode.notInteractable, "The keyboard foreground is not an exactly leased application.")
  }

  private func owns(_ pid: pid_t?) -> Bool {
    guard let pid, pid > 0 else { return false }
    let starts = leaseStarts(pid)
    guard !starts.isEmpty else { return false }
    let observed = observe(pid)
    return starts.contains { ApplicationIncarnation.classifyExact(recorded: $0, observed: observed) == .running }
  }
}
