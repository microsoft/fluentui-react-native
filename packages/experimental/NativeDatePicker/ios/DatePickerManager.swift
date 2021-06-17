import FluentUI

@objc(MSFDatePickerManager)
public class DatePickerManager: NSObject {
    var delegates: Array<DatePickerDelegate> = []

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
            guard let viewController = UIApplication.shared.windows.filter({$0.isKeyWindow}).first?.rootViewController else {
                fatalError("Unable to get a UIViewController from current shared application context.")
            }

            let picker = DateTimePicker()
            let delegate = DatePickerDelegate(manager: self, picker: picker, didPickBlock: callback)
            picker.delegate = delegate
            self.delegates.append(delegate)

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

            delegate.picker.present(
                from: viewController,
                with: mode,
                startDate: startDate ?? Date(),
                endDate: endDate,
                datePickerType: datePickerType,
                dateRangePresentation: dateRangePresentation,
                titles: titles)
        }
    }

    func remove(delegate: DatePickerDelegate) {
        if let index = delegates.firstIndex(of: delegate) {
            delegates.remove(at: index)
        }
    }
}
