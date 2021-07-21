import FluentUI

@objc(MSFDatePickerManager)
public class DatePickerManager: NSObject {
    var lastDelegate: DatePickerDelegate?

    @objc public class func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc public func present(
        mode: DateTimePickerMode,
        dateRangePresentation: DateTimePicker.DateRangePresentation,
        datePickerType: DateTimePicker.DatePickerType,
        startDate: Date?,
        endDate: Date?,
        startTitle: String?,
        startSubtitle: String?,
        startTab: String?,
        endTitle: String?,
        endSubtitle: String?,
        endTab: String?,
        dateTitle: String?,
        dateSubtitle: String?,
        timeTitle: String?,
        timeSubtitle: String?,
        callback: @escaping RCTResponseSenderBlock
    ) {
        DispatchQueue.main.async {
            // We need a UIViewController to present the actual DateTimePicker view.
			guard let viewController = RCTPresentedViewController() else {
                preconditionFailure("Unable to get the current UIViewController from React Native.")
            }

            let picker = DateTimePicker()
            let delegate = DatePickerDelegate(manager: self, picker: picker, didPickBlock: callback)
            picker.delegate = delegate
            self.lastDelegate = delegate

            let titles = DateTimePicker.Titles.with(
                startTitle: startTitle,
                startSubtitle: startSubtitle,
                startTab: startTab,
                endTitle: endTitle,
                endSubtitle: endSubtitle,
                endTab: endTab,
                dateTitle: dateTitle,
                dateSubtitle: dateSubtitle,
                dateTimeTitle: timeTitle,
                dateTimeSubtitle: timeSubtitle)

            picker.present(
                from: viewController,
                with: mode,
                startDate: startDate ?? Date(),
                endDate: endDate,
                datePickerType: datePickerType,
                dateRangePresentation: dateRangePresentation,
                titles: titles)
        }
    }

    func releaseLastDelegate(_ delegate: DatePickerDelegate) {
        precondition(delegate === lastDelegate, "DatePickerDelegate requested to be released should match the last one initialized.")
        lastDelegate = nil
    }
}
