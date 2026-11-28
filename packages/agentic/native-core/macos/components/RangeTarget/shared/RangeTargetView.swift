import AppKit
#if USE_REACT_AS_MODULE
import React
#endif

@objc(FRNNativeCoreRangeTargetView)
public final class RangeTargetView: RCTUIView {
    @objc public var targetLabel = ""
    @objc public var targetTestID: String?
    @objc public var minimum: Double = 0
    @objc public var maximum: Double = 100
    @objc public var step: Double = 1
    @objc public var value: Double = 0 {
        didSet {
            if oldValue != value { notifyValueChanged() }
        }
    }
    @objc public var hasValue = true {
        didSet {
            if oldValue != hasValue { notifyValueChanged() }
        }
    }
    @objc public var valueDescription: String? {
        didSet {
            if oldValue != valueDescription { notifyValueChanged() }
        }
    }
    @objc public var disabled = false
    @objc public var readOnly = false
    @objc public var clearable = false
    @objc public var horizontalReversed = false
    @objc public var onRequest: ((String, Double) -> Void)?
    @objc public var onValueRequest: (([String: Any]) -> Void)?

    private var validBounds: Bool {
        minimum.isFinite && maximum.isFinite && minimum <= maximum && step.isFinite && step > 0
    }
    private var writable: Bool { validBounds && !disabled && !readOnly && (onRequest != nil || onValueRequest != nil) }

    public override init(frame: NSRect) {
        super.init(frame: frame)
        focusRingType = .exterior
    }

    public required init?(coder: NSCoder) { nil }

    public override var acceptsFirstResponder: Bool { !disabled }
    public override var focusRingMaskBounds: NSRect { bounds }

    public override func drawFocusRingMask() {
        NSBezierPath(roundedRect: bounds.insetBy(dx: 1, dy: 1), xRadius: 4, yRadius: 4).fill()
    }

    public override func isAccessibilityElement() -> Bool { true }
    public override func accessibilityRole() -> NSAccessibility.Role? { .slider }
    public override func accessibilityIdentifier() -> String { targetTestID ?? "" }
    public override func accessibilityLabel() -> String? { targetLabel }
    public override func accessibilityValue() -> Any? { validBounds && hasValue ? NSNumber(value: value) : nil }
    public override func accessibilityValueDescription() -> String? { valueDescription }
    public override func accessibilityMinValue() -> Any? { validBounds ? NSNumber(value: minimum) : nil }
    public override func accessibilityMaxValue() -> Any? { validBounds ? NSNumber(value: maximum) : nil }
    public override func isAccessibilityEnabled() -> Bool { !disabled }

    public override func isAccessibilitySelectorAllowed(_ selector: Selector) -> Bool {
        switch selector {
        case #selector(setAccessibilityValue(_:)), #selector(accessibilityPerformIncrement), #selector(accessibilityPerformDecrement):
            return writable
        default:
            return super.isAccessibilitySelectorAllowed(selector)
        }
    }

    public override func setAccessibilityValue(_ accessibilityValue: Any?) {
        guard let number = accessibilityValue as? NSNumber else { return }
        _ = request(number.doubleValue, kind: "accessibility")
    }

    public override func accessibilityPerformIncrement() -> Bool {
        request(hasValue ? value + step : minimum + step, kind: "accessibility")
    }

    public override func accessibilityPerformDecrement() -> Bool {
        request(hasValue ? value - step : minimum, kind: "accessibility")
    }

    public override func keyDown(with event: NSEvent) {
        guard writable, event.modifierFlags.intersection([.command, .option, .control, .shift]).isEmpty else {
            super.keyDown(with: event)
            return
        }
        switch event.keyCode {
        case 123: _ = request((hasValue ? value : minimum) + (horizontalReversed ? step : -step), kind: "keyboard")
        case 124: _ = request((hasValue ? value : minimum) + (horizontalReversed ? -step : step), kind: "keyboard")
        case 125: _ = request(hasValue ? value - step : minimum, kind: "keyboard")
        case 126: _ = request((hasValue ? value : minimum) + step, kind: "keyboard")
        case 115: _ = request(minimum, kind: "keyboard")
        case 119: _ = request(maximum, kind: "keyboard")
        case 51 where clearable, 117 where clearable:
            if hasValue { emit("clear", value: value) }
        default: super.keyDown(with: event)
        }
    }

    @discardableResult
    private func request(_ next: Double, kind: String) -> Bool {
        guard writable, next.isFinite else { return false }
        let clamped = min(maximum, max(minimum, next))
        if !hasValue || clamped != value { emit(kind, value: clamped) }
        return true
    }

    private func emit(_ kind: String, value: Double) {
        if let onRequest { onRequest(kind, value) }
        else { onValueRequest?(["kind": kind, "value": value]) }
    }

    private func notifyValueChanged() {
        if window != nil { NSAccessibility.post(element: self, notification: .valueChanged) }
    }
}
