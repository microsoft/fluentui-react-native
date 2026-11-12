import AppKit

@MainActor
final class ApplicationFixture: NSObject, NSApplicationDelegate {
  private var window: NSWindow?
  private var count = 0
  private let value = NSTextField(labelWithString: "Count: 0")

  func applicationDidFinishLaunching(_ notification: Notification) {
    let arguments = ProcessInfo.processInfo.arguments
    let titleIndex = arguments.firstIndex(of: "--title").map { $0 + 1 }
    let title = titleIndex.flatMap { arguments.indices.contains($0) ? arguments[$0] : nil }
      ?? "FURN Application Ownership Fixture"
    let window = NSWindow(
      contentRect: NSRect(x: 120, y: 120, width: 420, height: 240),
      styleMask: [.titled, .closable, .miniaturizable, .resizable],
      backing: .buffered,
      defer: false
    )
    window.title = title
    window.identifier = NSUserInterfaceItemIdentifier("ownership-fixture-window")
    let button = NSButton(title: "Increment", target: self, action: #selector(increment))
    button.frame = NSRect(x: 30, y: 120, width: 140, height: 32)
    button.setAccessibilityIdentifier("ownership-fixture-increment")
    value.frame = NSRect(x: 30, y: 80, width: 240, height: 24)
    value.setAccessibilityIdentifier("ownership-fixture-count")
    window.contentView?.addSubview(button)
    window.contentView?.addSubview(value)
    self.window = window
    window.makeKeyAndOrderFront(nil)
    NSApplication.shared.activate(ignoringOtherApps: true)
    if let readyIndex = arguments.firstIndex(of: "--ready-file").map({ $0 + 1 }),
      arguments.indices.contains(readyIndex)
    {
      try? String(ProcessInfo.processInfo.processIdentifier).write(
        toFile: arguments[readyIndex], atomically: true, encoding: .utf8
      )
    }
  }

  @objc private func increment() {
    count += 1
    value.stringValue = "Count: \(count)"
  }

  func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

@main
struct FixtureMain {
  @MainActor static func main() {
    let application = NSApplication.shared
    let delegate = ApplicationFixture()
    application.delegate = delegate
    application.setActivationPolicy(.regular)
    withExtendedLifetime(delegate) { application.run() }
  }
}
