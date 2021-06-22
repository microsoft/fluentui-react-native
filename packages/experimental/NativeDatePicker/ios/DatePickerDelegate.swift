import FluentUI

class DatePickerDelegate: DateTimePickerDelegate {
    weak var manager: DatePickerManager?
    let picker: DateTimePicker
    let didPickBlock: RCTResponseSenderBlock

    public init(manager: DatePickerManager, picker: DateTimePicker, didPickBlock: @escaping RCTResponseSenderBlock) {
        self.manager = manager
        self.picker = picker
        self.didPickBlock = didPickBlock
    }

    public func dateTimePicker(_ dateTimePicker: DateTimePicker, didPickStartDate startDate: Date, endDate: Date) {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions.insert(.withFractionalSeconds)
        self.didPickBlock([formatter.string(from: startDate), formatter.string(from: endDate)])
        if let manager = manager {
            manager.releaseLastDelegate(self)
        }
    }
}
