

/// NSEvent localMonitors are an _old_ API that requires you to do some  memory management yourself.
/// You _must_ call `removeMonitor`exactly once per monitor created from. This helper class enforces
/// we set the reference to nil after `removeMonitor` so that subsequent calls don't cause an over release.
/// One instance should only be used to allocate and manage one NSEvent monitor.
/// https://developer.apple.com/documentation/appkit/nsevent/1533709-removemonitor
internal class GuardedEventMonitor: Any {

	private var allocatedMonitor: Any?

	func addLocalMonitorForEvents(matching mask: NSEvent.EventTypeMask, handler block: @escaping (NSEvent) -> NSEvent?) {
		if (allocatedMonitor == nil) {
			allocatedMonitor = NSEvent.addLocalMonitorForEvents(matching: mask, handler: block)
		}
	}

	func removeMonitor() {
		if let monitor = allocatedMonitor {
			NSEvent.removeMonitor(monitor)
			allocatedMonitor = nil
		}
	}

	deinit {
		removeMonitor()
	}
}
