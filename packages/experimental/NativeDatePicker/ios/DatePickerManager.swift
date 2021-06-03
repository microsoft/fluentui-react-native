import FluentUI

@objc(MSFDatePickerManager)
public class DatePickerManager: NSObject {
    @objc public class func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc public func present() {
        self.present(
            with: .date,
            dateRangePresentation: .paged,
            datePickerType: .calendar,
            startDate: nil,
            endDate: nil,
            titles: nil)
    }

    @objc(presentWithOptions:dateRangePresentation:datePickerType:startDate:endDate:)
    public func present(
        with mode: DateTimePickerMode,
        dateRangePresentation: DateTimePicker.DateRangePresentation,
        datePickerType: DateTimePicker.DatePickerType,
        startDate: Date?,
        endDate: Date?
    ) {
        self.present(
            with: mode,
            dateRangePresentation: dateRangePresentation,
            datePickerType: datePickerType,
            startDate: startDate,
            endDate: endDate,
            titles: nil)
    }

    @objc(presentWithOptionsAndTitles:dateRangePresentation:datePickerType:startDate:endDate:startTitle:startSubtitle:startTab:endTitle:endSubtitle:endTab:dateTitle:dateSubtitle:timeTitle:timeSubtitle:)
    public func present(
        with mode: DateTimePickerMode,
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
        self.present(
            with: mode,
            dateRangePresentation: dateRangePresentation,
            datePickerType: datePickerType,
            startDate: startDate,
            endDate: endDate,
            titles: titles)
    }

    private func present(
        with mode: DateTimePickerMode,
        dateRangePresentation: DateTimePicker.DateRangePresentation,
        datePickerType: DateTimePicker.DatePickerType,
        startDate: Date?,
        endDate: Date?,
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
