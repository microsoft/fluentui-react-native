import AppKit
import SwiftUI
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@available(macOS 11.0, *)
private struct FRNHostedDisclosureContent: NSViewRepresentable {
  let contentView: NSView

  func makeNSView(context: Context) -> NSView {
    return contentView
  }

  func updateNSView(_ nsView: NSView, context: Context) {}
}

@available(macOS 11.0, *)
@objc(FRNDisclosureGroup)
class FRNDisclosureGroup: RCTView {

  @objc public var label: String = "" {
    didSet {
      updateHostedView()
    }
  }

  @objc public var expanded: NSNumber? {
    didSet {
      guard let expanded else {
        return
      }
      isExpanded = expanded.boolValue
      updateHostedView()
    }
  }

  @objc public var defaultExpanded: Bool = false {
    didSet {
      guard expanded == nil, !hasAppliedDefaultExpanded else {
        return
      }
      hasAppliedDefaultExpanded = true
      isExpanded = defaultExpanded
      updateHostedView()
    }
  }

  @objc public var disabled: Bool = false {
    didSet {
      updateHostedView()
    }
  }

  @objc public var onExpandedChange: RCTBubblingEventBlock?

  @objc public convenience init() {
    self.init(frame: .zero)
  }

  public override init(frame frameRect: NSRect) {
    super.init(frame: frameRect)
    addSubview(hostingView)
  }

  required init?(coder: NSCoder) {
    preconditionFailure("init(coder:) has not been implemented")
  }

  override func layout() {
    super.layout()
    hostingView.frame = bounds
    updateContentSize()
  }

  override func hitTest(_ point: NSPoint) -> NSView? {
    let localPoint = convert(point, from: superview)
    if hostingView.frame.contains(localPoint) {
      return hostingView.hitTest(localPoint) ?? hostingView
    }
    return super.hitTest(point)
  }

  override func insertReactSubview(_ subview: NSView!, at atIndex: Int) {
    super.insertReactSubview(subview, at: atIndex)

    if atIndex >= contentView.subviews.count {
      contentView.addSubview(subview)
    } else {
      contentView.addSubview(subview, positioned: .below, relativeTo: contentView.subviews[atIndex])
    }
    needsLayout = true
  }

  override func removeReactSubview(_ subview: NSView!) {
    super.removeReactSubview(subview)
    needsLayout = true
  }

  override func didUpdateReactSubviews() {
    needsLayout = true
  }

  private lazy var hostingView = NSHostingView(rootView: makeRootView())
  private let contentView = NSView()
  private var contentSize = NSSize.zero
  private var hasAppliedDefaultExpanded = false
  private var isExpanded = false

  private func makeRootView() -> AnyView {
    let expandedBinding = Binding(
      get: { [weak self] in self?.isExpanded ?? false },
      set: { [weak self] expanded in
        self?.setExpandedFromUser(expanded)
      }
    )

    return AnyView(
      DisclosureGroup(isExpanded: expandedBinding) {
        FRNHostedDisclosureContent(contentView: self.contentView)
          .frame(width: self.contentSize.width, height: self.contentSize.height, alignment: .topLeading)
      } label: {
        Text(label)
      }
      .disabled(disabled)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    )
  }

  private func setExpandedFromUser(_ expanded: Bool) {
    guard expanded != isExpanded else {
      return
    }
    isExpanded = expanded
    updateHostedView()
    onExpandedChange?(["expanded": expanded])
  }

  private func updateContentSize() {
    let size = contentView.subviews.reduce(into: NSSize.zero) { result, subview in
      result.width = max(result.width, subview.frame.maxX)
      result.height = max(result.height, subview.frame.maxY)
    }
    guard size != contentSize else {
      return
    }
    contentSize = size
    contentView.frame = NSRect(origin: .zero, size: size)
    updateHostedView()
  }

  private func updateHostedView() {
    guard isViewLoaded else {
      return
    }
    hostingView.rootView = makeRootView()
  }

  private var isViewLoaded: Bool {
    return subviews.contains(hostingView)
  }
}

@objc(FRNDisclosureGroupFallback)
class FRNDisclosureGroupFallback: RCTView {
  @objc public var label: String = ""
  @objc public var expanded: NSNumber?
  @objc public var defaultExpanded: Bool = false
  @objc public var disabled: Bool = false
  @objc public var onExpandedChange: RCTBubblingEventBlock?
}
