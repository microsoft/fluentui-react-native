import FluentUI

class DatePickerDelegate: DateTimePickerDelegate {
    var didPickBlock: RCTResponseSenderBlock

    public init(_ didPickBlock: @escaping RCTResponseSenderBlock) {
        self.didPickBlock = didPickBlock
    }

    public func dateTimePicker(_ dateTimePicker: DateTimePicker, didPickStartDate startDate: Date, endDate: Date) {
        self.didPickBlock([startDate, endDate])
    }
}
