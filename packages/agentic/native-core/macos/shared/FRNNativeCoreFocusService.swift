import AppKit

@objc(FRNNativeCoreFocusService)
public final class NativeFocusService: NSObject {
    @objc(focusWithin:target:strategy:)
    public static func focus(within root: NSView, target: NSView?, strategy: String) -> String {
        precondition(Thread.isMainThread, "Native focus must execute on the main thread")
        guard let window = root.window, window.isVisible, !window.isMiniaturized else {
            return "not-ready"
        }
        guard NSApp.isActive else { return "inactive-window" }
        var owner: NSWindow? = window
        var ownsKeyWindow = false
        while let current = owner {
            if current.isKeyWindow { ownsKeyWindow = true; break }
            owner = current.parent
        }
        guard ownsKeyWindow else { return "inactive-window" }

        let destination: NSView?
        switch strategy {
        case "target":
            destination = target
        case "default":
            destination = target ?? candidates(in: root).first
        case "first":
            destination = candidates(in: root).first
        case "last":
            destination = candidates(in: root).last
        default:
            return "unsupported"
        }
        guard let destination = destination, destination.window === window,
              destination.isDescendant(of: root) else { return "not-mounted" }
        guard eligible(destination) else { return "not-focusable" }
        if !window.isKeyWindow { window.makeKey() }
        guard NSApp.isActive, window.isKeyWindow,
              window.makeFirstResponder(destination) else { return "refused" }
        if window.firstResponder === destination { return "confirmed" }
        if let control = destination as? NSControl,
           let editor = control.currentEditor(), window.firstResponder === editor { return "confirmed" }
        if let editor = window.firstResponder as? NSTextView, editor.isFieldEditor,
           let delegate = editor.delegate as? NSView, delegate.isDescendant(of: destination) {
            return "confirmed"
        }
        return "refused"
    }

    private static func eligible(_ view: NSView) -> Bool {
        guard view.acceptsFirstResponder, !view.isHiddenOrHasHiddenAncestor,
              !view.visibleRect.isEmpty else { return false }
        var current: NSView? = view
        while let node = current {
            if node.alphaValue <= 0 || (node.layer?.opacity ?? 1) <= 0 { return false }
            if let control = node as? NSControl, !control.isEnabled { return false }
            current = node.superview
        }
        return true
    }

    private static func candidates(in root: NSView) -> [NSView] {
        var result: [NSView] = []
        for child in root.subviews {
            if eligible(child) { result.append(child) }
            else { result.append(contentsOf: candidates(in: child)) }
        }
        return result
    }
}
