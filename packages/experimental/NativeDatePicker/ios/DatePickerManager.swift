import FluentUI

@objc(MSFDatePickerManager)
public class DatePickerManager: NSObject {
    @objc public class func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc public func present()
    {
        self.present(
            with: .date,
            startDate: nil,
            endDate: nil,
            datePickerType: .calendar,
            dateRangePresentation: .paged,
            titles: nil)
    }

    @objc public func present(with startDate: Date?, endDate: Date?)
    {
        self.present(
            with: .date,
            startDate: startDate,
            endDate: endDate,
            datePickerType: .calendar,
            dateRangePresentation: .paged,
            titles: nil)
    }

    @objc public func present(
        with mode: DateTimePickerMode
    ) {
        self.present(
            with: mode,
            startDate: nil,
            endDate: nil,
            datePickerType: .calendar,
            dateRangePresentation: .paged,
            titles: nil)
    }

    @objc public func present(
        with mode: DateTimePickerMode,
        startDate: Date?,
        endDate: Date?,
        datePickerType: DateTimePicker.DatePickerType,
        dateRangePresentation: DateTimePicker.DateRangePresentation
    ) {
        self.present(
            with: mode,
            startDate: startDate,
            endDate: endDate,
            datePickerType: datePickerType,
            dateRangePresentation: dateRangePresentation,
            titles: nil)
    }

    @objc public func present(
        with mode: DateTimePickerMode,
        startDate: Date?,
        endDate: Date?,
        datePickerType: DateTimePicker.DatePickerType,
        dateRangePresentation: DateTimePicker.DateRangePresentation,
        startTitle: String?,
        startSubtitle: String?,
        startTab: String?,
        endTitle: String?,
        endSubtitle: String?,
        endTab: String?,
        dateTitle: String?,
        dateSubtitle: String?,
        dateTimeTitle: String?,
        dateTimeSubtitle: String?
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
            dateTimeTitle: dateTimeTitle,
            dateTimeSubtitle: dateTimeSubtitle)
        self.present(
            with: mode,
            startDate: startDate,
            endDate: endDate,
            datePickerType: datePickerType,
            dateRangePresentation: dateRangePresentation,
            titles: titles)
    }

    private func present(
        with mode: DateTimePickerMode,
        startDate: Date?,
        endDate: Date?,
        datePickerType: DateTimePicker.DatePickerType,
        dateRangePresentation: DateTimePicker.DateRangePresentation,
        titles: DateTimePicker.Titles?
    ) {
        DispatchQueue.main.async {
            guard let viewController = UIApplication.shared.windows.filter({$0.isKeyWindow}).first?.rootViewController else {
                fatalError("Unable to get a UIViewController from current shared application context.")
            }
            DateTimePicker().present(
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
