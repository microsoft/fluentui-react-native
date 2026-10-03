import AppKit
import Foundation
#if USE_REACT_AS_MODULE
import React
#endif

@objc(FRNCalloutView)
open class CalloutView: RCTView, CalloutWindowLifeCycleDelegate {
    @objc public var commandGeneration: Int = 0 {
        didSet {
            if oldValue != commandGeneration { readyGeneration = 0; closedGeneration = nil }
        }
    }
    @objc public var anchorMode = "legacy" { didSet { updatePresentation() } }
    @objc public var placementHint = "" { didSet { updatePresentation() } }
    @objc public var gapSpace: CGFloat = 0 { didSet { updatePresentation() } }
    @objc public var anchorRect: NSRect = .null { didSet { updatePresentation() } }
    @objc public var directionalHint: NSRectEdge = .maxY { didSet { updatePresentation() } }
    @objc public var setInitialFocus = false
    @objc public var onShow: RCTDirectEventBlock?
    @objc public var onDismiss: RCTDirectEventBlock?
    @objc public var onReady: RCTDirectEventBlock?
    @objc public var onClosed: RCTDirectEventBlock?
    @objc public var onOperationResult: RCTDirectEventBlock?
    public weak var bridge: RCTBridge?

    private weak var anchorView: NSView?
    private var popupWindow: CalloutWindow?
    private var observers: [NSObjectProtocol] = []
    private var mouseEventMonitor = GuardedEventMonitor()
    private var shown = false
    private var readyGeneration = 0
    private var closedGeneration: Int?
    private var dismissReason = "native-light-dismiss"
    private var closeRequest: (Int, Int)?

    @objc public override init(frame frameRect: NSRect) {
        super.init(frame: frameRect)
        backgroundColor = .clear
        borderColor = .clear
    }

    public required init?(coder: NSCoder) { preconditionFailure("Callout does not support decoding") }

    convenience init(bridge: RCTBridge) {
        self.init(frame: .zero)
        self.bridge = bridge
    }

    deinit { removeObservers() }

    public override func viewDidMoveToWindow() {
        super.viewDidMoveToWindow()
        if window == nil { dismissReason = "host-detached"; dismissCallout() }
        else {
            if commandGeneration == 0 { closedGeneration = nil }
            updatePresentation()
        }
    }

    public override func updateLayer() {
        guard let layer = popupWindow?.contentView?.layer else { return }
        layer.borderColor = borderColor.cgColor
        layer.borderWidth = borderWidth
        layer.backgroundColor = backgroundColor.cgColor
        layer.cornerRadius = borderRadius
    }

    @objc public var contentProxyView: NSView { proxyView }
    @objc public func focusWindow() { popupWindow?.makeKey() }
    @objc public func blurWindow() { popupWindow?.parent?.makeKey() }

    @objc public func setAnchorView(_ view: NSView?) {
        let lost = anchorView != nil && view == nil && commandGeneration > 0
        anchorView = view
        if lost { dismissReason = "anchor-lost"; dismissCallout() }
        if shown { installObservers() }
        updatePresentation()
    }

    @objc public func mountContentSubview(_ subview: NSView, at index: Int) {
        if index >= proxyView.subviews.count { proxyView.addSubview(subview) }
        else { proxyView.addSubview(subview, positioned: .below, relativeTo: proxyView.subviews[index]) }
        updatePresentation()
    }

    @objc public func unmountContentSubview(_ subview: NSView) {
        if subview.superview === proxyView { subview.removeFromSuperview() }
    }

    @objc public func updateContentSize(_ size: NSSize) {
        proxyView.frame = NSRect(origin: .zero, size: size)
        updatePresentation()
    }

    public override func insertReactSubview(_ subview: NSView!, at atIndex: Int) {
        proxyView.insertReactSubview(subview, at: atIndex)
    }
    public override func didUpdateReactSubviews() {
        proxyView.didUpdateReactSubviews()
        updatePresentation()
    }
    public override func reactSetFrame(_ frame: CGRect) {
        proxyView.reactSetFrame(frame)
        updatePresentation()
    }

    @objc public func requestFocus(_ generation: Int, requestId: Int, target: NSView?) {
        emitResult(generation, requestId, operationStatus(generation) ??
            NativeFocusService.focus(within: proxyView, target: target, strategy: "target"))
    }
    @objc public func close(_ generation: Int, requestId: Int) {
        if let blocked = operationStatus(generation) { emitResult(generation, requestId, blocked); return }
        closeRequest = (generation, requestId)
        dismissReason = "programmatic"
        dismissCallout()
    }
    @objc public func reposition(_ generation: Int, requestId: Int) {
        if let blocked = operationStatus(generation) { emitResult(generation, requestId, blocked); return }
        emitResult(generation, requestId, updateFrame() ? "confirmed" : "not-ready")
    }
    @objc public func invalidatePresentation() {
        dismissReason = "host-detached"
        dismissCallout()
    }

    private func operationStatus(_ generation: Int) -> String? {
        if generation <= 0 || generation != commandGeneration { return "stale" }
        if !shown || readyGeneration != generation { return "not-ready" }
        return nil
    }
    private func emitResult(_ generation: Int, _ requestId: Int, _ status: String) {
        onOperationResult?(["generation": generation, "requestId": requestId, "status": status])
    }

    func calloutWillDismiss(window: CalloutWindow) {
        for child in window.childWindows ?? [] {
            if let popup = child as? CalloutWindow { popup.dismissCallout() }
        }
    }
    func calloutDidDismiss(window: CalloutWindow) {
        guard shown else { return }
        shown = false
        closedGeneration = commandGeneration
        mouseEventMonitor.removeMonitor()
        removeObservers()
        if let request = closeRequest {
            closeRequest = nil
            emitResult(request.0, request.1, "confirmed")
        }
        if commandGeneration > 0 {
            onClosed?(["generation": commandGeneration, "reason": dismissReason])
        }
        onDismiss?(["target": reactTag ?? NSNumber(value: 0)])
    }

    private func updatePresentation() {
        guard window != nil else { return }
        let positioned = updateFrame()
        if !shown {
            if closedGeneration == commandGeneration { return }
            if commandGeneration > 0 &&
                (!positioned || proxyView.subviews.isEmpty) { return }
            let popup = calloutWindow
            if let owner = anchorView?.window ?? window, popup.parent !== owner {
                popup.parent?.removeChildWindow(popup)
                owner.addChildWindow(popup, ordered: .above)
            }
            shown = true
            dismissReason = "native-light-dismiss"
            popup.orderFront(self)
            if setInitialFocus { popup.makeKey() }
            installObservers()
            mouseEventMonitor.addLocalMonitorForEvents(matching: .leftMouseDown) { [weak self] event in
                guard let self = self else { return event }
                func contains(_ window: NSWindow, _ clicked: NSWindow) -> Bool {
                    window === clicked || (window.childWindows ?? []).contains { contains($0, clicked) }
                }
                var root: NSWindow = popup
                while let parent = root.parent as? CalloutWindow { root = parent }
                if let clicked = event.window, !contains(root, clicked) { self.dismissCallout() }
                return event
            }
            onShow?([:])
        }
        if commandGeneration > 0 && positioned && !proxyView.subviews.isEmpty &&
            readyGeneration != commandGeneration {
            readyGeneration = commandGeneration
            onReady?(["generation": commandGeneration])
        }
    }

    private func dismissCallout() {
        guard shown else { return }
        popupWindow?.dismissCallout()
    }

    private func anchorInScreen() -> NSRect? {
        if let anchor = anchorView, let owner = anchor.window {
            var local = anchor.bounds
            if anchorMode == "rect" || anchorMode == "point" {
                local = anchorRect
                if !anchor.isFlipped { local.origin.y = anchor.bounds.height - local.maxY }
            }
            return owner.convertToScreen(anchor.convert(local, to: nil))
        }
        if commandGeneration > 0 || anchorRect.isNull || anchorRect.isInfinite { return nil }
        guard let owner = window else { return nil }
        var root: NSView = self
        while !root.isReactRootView() {
            guard let parent = root.reactSuperview() else { return nil }
            root = parent
        }
        return owner.convertToScreen(root.convert(anchorRect, to: nil))
    }

    private func updateFrame() -> Bool {
        guard window != nil, let anchor = anchorInScreen(),
              proxyView.frame.width > 0, proxyView.frame.height > 0,
              let area = (anchorView?.window ?? window)?.screen?.visibleFrame else { return false }
        let frame = CalloutPlacement.frame(anchor: anchor, size: proxyView.frame.size,
            workArea: area, edge: directionalHint, hint: placementHint, gap: gapSpace,
            rtl: NSApp.userInterfaceLayoutDirection == .rightToLeft || RCTI18nUtil.sharedInstance().isRTL())
        proxyView.frame.origin = .zero
        calloutWindow.setFrame(frame, display: false)
        return true
    }

    private func observe(_ name: Notification.Name, object: Any?, action: @escaping (CalloutView) -> Void) {
        observers.append(NotificationCenter.default.addObserver(forName: name, object: object, queue: .main) {
            [weak self] _ in if let self = self { action(self) }
        })
    }
    private func removeObservers() {
        observers.forEach(NotificationCenter.default.removeObserver)
        observers.removeAll()
    }
    private func installObservers() {
        removeObservers()
        observe(NSApplication.didResignActiveNotification, object: nil) { $0.dismissCallout() }
        observe(NSMenu.didBeginTrackingNotification, object: nil) { $0.dismissCallout() }
        var current = anchorView
        while let view = current {
            view.postsFrameChangedNotifications = true
            view.postsBoundsChangedNotifications = true
            observe(NSView.frameDidChangeNotification, object: view) { $0.updatePresentation() }
            observe(NSView.boundsDidChangeNotification, object: view) { $0.updatePresentation() }
            current = view.superview
        }
        if let owner = anchorView?.window ?? window {
            for name in [NSWindow.didMoveNotification, NSWindow.didResizeNotification,
                         NSWindow.didChangeBackingPropertiesNotification, NSWindow.didChangeScreenNotification] {
                observe(name, object: owner) { $0.updatePresentation() }
            }
        }
    }

    private lazy var proxyView: NSView = {
        let view = FlippedVisualEffectView()
        view.translatesAutoresizingMaskIntoConstraints = false
        view.material = .menu
        view.state = .active
        view.wantsLayer = true
        if let bridge = bridge {
            guard let handler = RCTTouchHandler(bridge: bridge) else {
                preconditionFailure("Callout could not create its Paper touch handler")
            }
            view.addGestureRecognizer(handler)
        }
        return view
    }()
    private var calloutWindow: CalloutWindow {
        if let popup = popupWindow { return popup }
        let popup = CalloutWindow()
        popup.lifeCycleDelegate = self
        guard let content = popup.contentView else { preconditionFailure("Callout window has no content view") }
        content.addSubview(proxyView)
        (anchorView?.window ?? window)?.addChildWindow(popup, ordered: .above)
        popupWindow = popup
        return popup
    }
}
