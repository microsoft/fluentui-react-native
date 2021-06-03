import FluentUI

@objc(MSFDatePickerManager)
public class DatePickerManager: NSObject {
    @objc public class func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc(presentSimple:)
    public func presentSimple(callback: @escaping RCTResponseSenderBlock) {
        self.presentWithOptions(
            callback: callback,
            mode: .date,
            dateRangePresentation: .tabbed,
            datePickerType: .calendar,
            startDate: nil,
            endDate: nil,
            startTitle: nil,
            startSubtitle: nil,
            startTab: nil,
            endTitle: nil,
            endSubtitle: nil,
            endTab: nil,
            dateTitle: nil,
            dateSubtitle: nil,
            timeTitle: nil,
            timeSubtitle: nil
        )
    }

    @objc public func presentWithOptions(
        callback: @escaping RCTResponseSenderBlock,
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
        timeSubtitle: String?
    ) {
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
        DispatchQueue.main.async {
            guard let viewController = UIApplication.shared.windows.filter({$0.isKeyWindow}).first?.rootViewController else {
                fatalError("Unable to get a UIViewController from current shared application context.")
            }
            let wrapper = DatePickerWrapper(picker: DateTimePicker(), delegate: DatePickerDelegate(callback))
            wrapper.picker.present(
                from: viewController,
                with: mode,
                startDate: startDate ?? Date(),
                endDate: endDate,
                datePickerType: datePickerType,
                dateRangePresentation: dateRangePresentation,
                titles: titles)
        }
    }
}
