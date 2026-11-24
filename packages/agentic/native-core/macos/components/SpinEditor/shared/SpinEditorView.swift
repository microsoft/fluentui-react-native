import AppKit

private final class SpinField: NSTextField {
    weak var owner: SpinEditorView?

    override func accessibilityMinValue() -> Any? { owner.map { NSNumber(value: $0.minimum) } }
    override func accessibilityMaxValue() -> Any? { owner.map { NSNumber(value: $0.maximum) } }
    override func accessibilityValueDescription() -> String? { owner.map { String($0.numericValue) } }
    override func isAccessibilitySelectorAllowed(_ selector: Selector) -> Bool {
        switch selector {
        case #selector(accessibilityPerformIncrement): return owner?.canAdjust(increasing: true) ?? false
        case #selector(accessibilityPerformDecrement): return owner?.canAdjust(increasing: false) ?? false
        case #selector(setAccessibilityValue(_:)): return owner?.editable ?? false
        default: return super.isAccessibilitySelectorAllowed(selector)
        }
    }

    override func accessibilityPerformIncrement() -> Bool { owner?.step("increment", increasing: true) ?? false }
    override func accessibilityPerformDecrement() -> Bool { owner?.step("decrement", increasing: false) ?? false }
    override func setAccessibilityValue(_ accessibilityValue: Any?) {
        guard let owner, owner.editable else { return }
        let value: Double?
        if let number = accessibilityValue as? NSNumber { value = number.doubleValue }
        else if let text = accessibilityValue as? String { value = nil; owner.emit("accessibility-text", text: text) }
        else { value = nil }
        if let value, value.isFinite { owner.emit("accessibility-value", value: value) }
    }
}

private final class SpinStepButton: NSButton {
    override var acceptsFirstResponder: Bool { false }
    override func isAccessibilityElement() -> Bool { false }
}

@objc(FRNNativeCoreSpinEditorView)
public final class SpinEditorView: NSView, NSTextFieldDelegate {
    private let field = SpinField(frame: .zero)
    private let up = SpinStepButton(frame: .zero)
    private let down = SpinStepButton(frame: .zero)

    @objc public var targetLabel = "" { didSet { field.setAccessibilityLabel(targetLabel) } }
    @objc public var targetTestID: String? { didSet { field.setAccessibilityIdentifier(targetTestID) } }
    @objc public var incrementLabel = "" { didSet { up.toolTip = incrementLabel } }
    @objc public var decrementLabel = "" { didSet { down.toolTip = decrementLabel } }
    @objc public var draft = "" {
        didSet {
            guard oldValue != draft, field.stringValue != draft else { return }
            if let editor = field.currentEditor() as? NSTextView {
                if editor.hasMarkedText() { return }
                editor.string = draft
            }
            field.stringValue = draft
        }
    }
    @objc public var numericValue: Double = 0 {
        didSet { if oldValue != numericValue && window != nil { NSAccessibility.post(element: field, notification: .valueChanged) } }
    }
    @objc public var minimum: Double = 0
    @objc public var maximum: Double = 100
    @objc public var canIncrement = false { didSet { updateEligibility() } }
    @objc public var canDecrement = false { didSet { updateEligibility() } }
    @objc public var hasLargeStep = false
    @objc public var disabled = false { didSet { updateEligibility() } }
    @objc public var readOnly = false { didSet { updateEligibility() } }
    @objc public var invalid = false {
        didSet { field.textColor = invalid ? .systemRed : .labelColor }
    }
    @objc public var onRequest: ((String, String, Double) -> Void)?
    @objc public var onEditorInput: (([String: Any]) -> Void)?

    @objc public var fieldElement: NSTextField { field }
    var editable: Bool { !disabled && !readOnly }

    public override init(frame: NSRect) {
        super.init(frame: frame)
        field.owner = self
        field.delegate = self
        field.isBordered = false
        field.drawsBackground = false
        field.usesSingleLineMode = true
        addSubview(field)
        for (button, title, action) in [(up, "\u{25b4}", #selector(increment)), (down, "\u{25be}", #selector(decrement))] {
            button.title = title
            button.bezelStyle = .inline
            button.isBordered = false
            button.target = self
            button.action = action
            addSubview(button)
        }
        updateEligibility()
    }

    public required init?(coder: NSCoder) { nil }

    public override func layout() {
        super.layout()
        let width: CGFloat = 24
        let half = bounds.height / 2
        let rtl = userInterfaceLayoutDirection == .rightToLeft
        let column = rtl ? 0 : max(0, bounds.width - width)
        let editorHeight: CGFloat = min(19, bounds.height)
        field.frame = NSRect(x: rtl ? width + 6 : 6, y: (bounds.height - editorHeight) / 2, width: max(0, bounds.width - width - 12), height: editorHeight)
        up.frame = NSRect(x: column, y: half, width: width, height: half)
        down.frame = NSRect(x: column, y: 0, width: width, height: half)
    }

    public func controlTextDidChange(_ notification: Notification) {
        emit("change", text: field.stringValue)
    }

    public func controlTextDidEndEditing(_ notification: Notification) {
        if editable { emit("commit", text: field.stringValue) }
    }

    public func control(_ control: NSControl, textView: NSTextView, doCommandBy commandSelector: Selector) -> Bool {
        guard editable, !textView.hasMarkedText() else { return false }
        switch commandSelector {
        case #selector(NSResponder.insertNewline(_:)):
            emit("commit", text: field.stringValue)
            return true
        case #selector(NSResponder.cancelOperation(_:)):
            emit("cancel", text: field.stringValue)
            return true
        case #selector(NSResponder.moveUp(_:)):
            _ = step("increment", increasing: true)
            return true
        case #selector(NSResponder.moveDown(_:)):
            _ = step("decrement", increasing: false)
            return true
        case #selector(NSResponder.pageUp(_:)) where hasLargeStep:
            _ = step("page-up", increasing: true)
            return true
        case #selector(NSResponder.pageDown(_:)) where hasLargeStep:
            _ = step("page-down", increasing: false)
            return true
        default: return false
        }
    }

    func canAdjust(increasing: Bool) -> Bool { editable && (increasing ? canIncrement : canDecrement) }

    func step(_ kind: String, increasing: Bool) -> Bool {
        guard canAdjust(increasing: increasing), (field.currentEditor() as? NSTextView)?.hasMarkedText() != true else { return false }
        emit(kind)
        return true
    }

    func emit(_ kind: String, text: String = "", value: Double = 0) {
        if let onRequest { onRequest(kind, text, value) }
        else { onEditorInput?(["kind": kind, "text": text, "value": value]) }
    }

    private func updateEligibility() {
        field.isEnabled = !disabled
        field.isEditable = editable
        field.isSelectable = !disabled
        up.isEnabled = canAdjust(increasing: true)
        down.isEnabled = canAdjust(increasing: false)
    }

    @objc private func increment() { _ = step("increment", increasing: true) }
    @objc private func decrement() { _ = step("decrement", increasing: false) }
}
