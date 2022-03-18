

/// NSEvent localMonitors are an _old_ API that requires you to do some  memory management yourself.
/// You _must_ call `removeMonitor`exactly once per monitor created from. This helper class enforces
/// that with the use of an extra boolean to track whether we have already allocated/released our monitor.
/// https://developer.apple.com/documentation/appkit/nsevent/1533709-removemonitor
internal class GuardedEventMonitor: Any {
	
	private var isMonitorAllocated = false
	private var allocatedMonitor: Any?
	
	
	func addLocalMonitorForEvents(matching mask: NSEvent.EventTypeMask, handler block: @escaping (NSEvent) -> NSEvent?) {
		if (!isMonitorAllocated) {
			allocatedMonitor = NSEvent.addLocalMonitorForEvents(matching: mask, handler: block)
			isMonitorAllocated = true
		}
	}
	
	func removeMonitor() {
		if (isMonitorAllocated) {
			NSEvent.removeMonitor(allocatedMonitor as Any)
			isMonitorAllocated = false
		}
	}
	
	deinit {
		removeMonitor()
	}
}
