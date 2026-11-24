import AppKit
#if USE_REACT_AS_MODULE
import React
#endif

private final class DialogPanel: NSPanel {
    var onEscape: (() -> Void)?

    override func cancelOperation(_ sender: Any?) { onEscape?() }
}

private final class DialogContentView: NSView {
    override var isFlipped: Bool { true }
    override var acceptsFirstResponder: Bool { true }
}

@objc(FRNNativeCoreDialogWindowView)
public final class DialogWindowView: RCTView {
    @objc public var shown = false { didSet { synchronize() } }
    @objc public var mode = "modal" { didSet { synchronize() } }
    @objc public var windowLabel = "" { didSet { panel?.title = windowLabel } }
    @objc public var onWindowEvent: RCTDirectEventBlock?
    @objc public var onEvent: ((String) -> Void)?

    private let content = DialogContentView(frame: .zero)
    private weak var presentingOwner: NSWindow?
    private weak var savedFocus: NSView?
    private var panel: DialogPanel?
    private var currentMode: String?
    private var revision = 0
    private var externallyClosed = false
    private var ownerCloseObserver: (any NSObjectProtocol)?

    convenience init(bridge: RCTBridge) {
        self.init(frame: .zero)
        if let handler = RCTTouchHandler(bridge: bridge) { content.addGestureRecognizer(handler) }
    }

    @objc public var contentHost: NSView { content }

    public override func viewDidMoveToWindow() {
        super.viewDidMoveToWindow()
        if window == nil { invalidatePresentation() }
        else { synchronize() }
    }

    public override func insertReactSubview(_ subview: NSView!, at index: Int) {
        content.insertReactSubview(subview, at: index)
    }

    public override func removeReactSubview(_ subview: NSView!) {
        content.removeReactSubview(subview)
    }

    public override func didUpdateReactSubviews() {
        content.didUpdateReactSubviews()
        synchronize()
    }

    public override func reactSetFrame(_ frame: CGRect) {
        content.reactSetFrame(NSRect(origin: .zero, size: frame.size))
        updateContentSize(frame.size)
    }

    @objc public func mountContent(_ subview: NSView, at index: Int) {
        if index < content.subviews.count {
            content.addSubview(subview, positioned: .below, relativeTo: content.subviews[index])
        } else {
            content.addSubview(subview)
        }
        synchronize()
    }

    @objc public func unmountContent(_ subview: NSView) {
        if subview.superview === content { subview.removeFromSuperview() }
        synchronize()
    }

    @objc public func updateContentSize(_ size: NSSize) {
        guard size.width.isFinite, size.height.isFinite, size.width > 0, size.height > 0 else { return }
        content.frame.size = size
        if let panel { panel.setContentSize(size) }
        else { synchronize() }
    }

    @objc public func invalidatePresentation() {
        revision += 1
        close(restore: false)
    }

    private func synchronize() {
        if !shown { externallyClosed = false }
        revision += 1
        let expected = revision
        DispatchQueue.main.async { [weak self] in
            guard let self, self.revision == expected else { return }
            if !self.shown || self.externallyClosed || self.content.subviews.isEmpty {
                self.close(restore: self.shown == false)
                return
            }
            guard let owner = self.window, self.content.frame.width > 0, self.content.frame.height > 0 else { return }
            if self.panel != nil && self.currentMode == self.mode && self.presentingOwner === owner { return }
            self.close(restore: false)
            self.present(owner)
        }
    }

    private func present(_ owner: NSWindow) {
        // An unrelated existing sheet owns the window. Never queue behind it and later open stale content.
        if mode != "nonmodal", owner.attachedSheet != nil {
            externallyClosed = true
            emit("presentation-refused")
            return
        }
        let panel = DialogPanel(contentRect: content.frame, styleMask: [.titled], backing: .buffered, defer: false)
        panel.isReleasedWhenClosed = false
        panel.title = windowLabel
        panel.setAccessibilitySubrole(mode == "alert" ? .systemDialog : .dialog)
        panel.standardWindowButton(.closeButton)?.isHidden = true
        panel.standardWindowButton(.miniaturizeButton)?.isHidden = true
        panel.standardWindowButton(.zoomButton)?.isHidden = true
        panel.onEscape = { [weak self] in
            guard let self, self.currentMode != "alert", self.panel?.attachedSheet == nil else { return }
            self.emit("dismiss-request")
        }
        savedFocus = owner.firstResponder as? NSView
        presentingOwner = owner
        currentMode = mode
        self.panel = panel
        panel.contentView = content
        ownerCloseObserver = NotificationCenter.default.addObserver(forName: NSWindow.willCloseNotification, object: owner, queue: .main) {
            [weak self] _ in
            MainActor.assumeIsolated {
                self?.externallyClosed = true
                self?.close(restore: false)
                self?.emit("owner-lost")
            }
        }

        if mode == "nonmodal" {
            panel.center()
            owner.addChildWindow(panel, ordered: .above)
            panel.makeKeyAndOrderFront(nil)
        } else {
            owner.beginSheet(panel) { [weak self, weak panel] _ in
                MainActor.assumeIsolated {
                    guard let self, let panel, self.panel === panel else { return }
                    self.externallyClosed = true
                    self.close(restore: true)
                    self.emit("native-close")
                }
            }
        }
        if panel.firstResponder == panel || panel.firstResponder == nil { _ = panel.makeFirstResponder(content) }
        emit("presented")
    }

    private func close(restore: Bool) {
        guard let panel else { return }
        let owner = presentingOwner
        let previous = savedFocus
        let mayRestore = restore && (panel.isKeyWindow || panel.sheetParent != nil)
        self.panel = nil
        presentingOwner = nil
        savedFocus = nil
        currentMode = nil
        if let observation = ownerCloseObserver { NotificationCenter.default.removeObserver(observation) }
        ownerCloseObserver = nil
        panel.onEscape = nil
        if panel.sheetParent === owner, let owner { owner.endSheet(panel) }
        else { owner?.removeChildWindow(panel) }
        panel.contentView = nil
        panel.orderOut(nil)
        panel.close()
        if mayRestore, let owner, owner.isKeyWindow, previous?.window === owner {
            _ = owner.makeFirstResponder(previous)
        }
        if mayRestore, owner?.isKeyWindow == true { emit("focus-return") }
    }

    private func emit(_ kind: String) {
        if let onEvent { onEvent(kind) }
        else { onWindowEvent?(["kind": kind]) }
    }
}
