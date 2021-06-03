import FluentUI

class DatePickerWrapper {
    var picker: DateTimePicker
    var delegate: DatePickerDelegate

    public init(picker: DateTimePicker, delegate: DatePickerDelegate) {
        self.picker = picker
        self.delegate = delegate
        picker.delegate = delegate
    }
}
