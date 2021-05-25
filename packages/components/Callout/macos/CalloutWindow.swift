import Foundation
import AppKit

protocol CalloutWindowLifeCycleDelegate {
    /*
     * Notify the CalloutWindowLifeCycle object that the user touched/clicked outside the bounds of the callout.
     */
    func didDetectHitOutsideCallout(calloutWindow: CalloutWindow)
    
    /*
     * Notify the CalloutWindowLifeCycle object that the window the callout is in is no longer active.
     */
    func applicationDidResignActiveForCalloutWindow(calloutWindow: CalloutWindow)
}

class CalloutWindow: NSWindow {
    
    public var windowLifeCycleDelegate: CalloutWindowLifeCycleDelegate?

    override init(contentRect: NSRect, styleMask style: NSWindow.StyleMask, backing backingStoreType: NSWindow.BackingStoreType, defer flag: Bool) {
        super.init(contentRect: contentRect, styleMask: style, backing: backingStoreType, defer: flag)
        
        NotificationCenter.default.addObserver(self, selector: #selector(appDidChangeActive(notification:)), name: NSApplication.didResignActiveNotification, object: nil)
        
        mouseEventMonitor = NSEvent.addLocalMonitorForEvents(matching: .leftMouseUp, handler: { (event) -> NSEvent? in
            if (event.window != self) {
                self.windowLifeCycleDelegate?.didDetectHitOutsideCallout(calloutWindow: self)
            }
            return event
        })
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
    
    
    @objc func appDidChangeActive(notification: NSNotification) {
        windowLifeCycleDelegate?.applicationDidResignActiveForCalloutWindow(calloutWindow: self)
    }
    
    private var mouseEventMonitor: Any?
}
