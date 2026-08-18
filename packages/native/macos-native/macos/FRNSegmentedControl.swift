import AppKit
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNSegmentedControl)
class FRNSegmentedControl: NSSegmentedControl {

  @objc public var onChange: RCTBubblingEventBlock?

  public override init(frame: NSRect) {
    super.init(frame: frame)
    target = self
    action = #selector(sendChangeEvent)
  }

  required init?(coder: NSCoder) {
    preconditionFailure("init(coder:) has not been implemented")
  }

  // Rebuilds the native segments any time the JS-provided `segments` array changes. Selection is
  // preserved (clamped) across rebuilds since RN may re-set this prop on every render.
  @objc public func setSegments(_ segments: NSArray) {
    let previousSelectedSegment = selectedSegment
    segmentCount = segments.count
    for (index, entry) in segments.enumerated() {
      guard let segment = entry as? NSDictionary else {
        continue
      }
      setLabel((segment["label"] as? String) ?? "", forSegment: index)
      setEnabled((segment["enabled"] as? Bool) ?? true, forSegment: index)
      if let width = segment["width"] as? CGFloat, width > 0 {
        setWidth(width, forSegment: index)
      }
    }
    if previousSelectedSegment >= 0 && previousSelectedSegment < segments.count {
      selectedSegment = previousSelectedSegment
    }
  }

  @objc(sendChangeEvent:)
  private func sendChangeEvent(sender: NSSegmentedControl) {
    onChange?(["selectedIndex": selectedSegment])
  }
}
