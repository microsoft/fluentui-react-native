import AppKit

@objc(FRNNativeCoreSingleSelectView)
public final class SingleSelectView: NSPopUpButton {
    private struct Option: Equatable {
        let key: String
        let label: String
        let disabled: Bool
    }

    private var options: [Option] = []
    private let emptyFace = NSMenuItem(title: "", action: nil, keyEquivalent: "")
    @objc public var onRequest: ((String) -> Void)?
    @objc public var onSelectionRequest: (([String: Any]) -> Void)?
    @objc public var selectedKey: String? {
        didSet { if oldValue != selectedKey { updatePresentation() } }
    }
    @objc public var placeholder: String? {
        didSet { if oldValue != placeholder { updatePresentation() } }
    }
    @objc public var invalid = false {
        didSet { contentTintColor = invalid ? .systemRed : nil }
    }

    public override init(frame: NSRect, pullsDown: Bool) {
        super.init(frame: frame, pullsDown: false)
        target = self
        action = #selector(didSelect)
        menu?.autoenablesItems = false
        updatePresentation()
    }

    public required init?(coder: NSCoder) { nil }

    @objc public var optionRecords: [[String: Any]] = [] {
        didSet { replaceOptions(optionRecords) }
    }

    private func replaceOptions(_ records: [[String: Any]]) {
        var seen = Set<String>()
        let next: [Option] = records.compactMap { record in
            guard let key = record["key"] as? String, !key.isEmpty, seen.insert(key).inserted,
                  let label = record["label"] as? String, !label.isEmpty else { return nil }
            return Option(key: key, label: label, disabled: record["disabled"] as? Bool ?? false)
        }
        guard next != options else { return }
        options = next
        let choices = NSMenu()
        choices.autoenablesItems = false
        for option in next {
            let item = NSMenuItem(title: option.label, action: nil, keyEquivalent: "")
            item.representedObject = option.key
            item.isEnabled = !option.disabled
            choices.addItem(item)
        }
        menu = choices
        updatePresentation()
    }

    public override func accessibilityValue() -> Any? {
        options.first(where: { $0.key == selectedKey })?.label
    }

    private func updatePresentation() {
        guard let popupCell = cell as? NSPopUpButtonCell else { return }
        if let item = menu?.items.first(where: { ($0.representedObject as? String) == selectedKey && selectedKey != nil }) {
            popupCell.usesItemFromMenu = true
            select(item)
        } else {
            select(nil)
            popupCell.usesItemFromMenu = false
            emptyFace.title = placeholder ?? ""
            popupCell.menuItem = emptyFace
        }
        needsDisplay = true
        if window != nil { NSAccessibility.post(element: self, notification: .valueChanged) }
    }

    @objc private func didSelect() {
        let key = selectedItem?.representedObject as? String
        defer { updatePresentation() }
        guard isEnabled, let key, key != selectedKey, options.contains(where: { $0.key == key && !$0.disabled }) else { return }
        if let onRequest { onRequest(key) }
        else { onSelectionRequest?(["key": key]) }
    }
}
