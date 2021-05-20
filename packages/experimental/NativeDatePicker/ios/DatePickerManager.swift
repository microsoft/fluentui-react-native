import FluentUI

@objc(MSFDatePickerManager)
class DatePickerManager: NSObject {
    //     @objc public func present(from presentingController: UIViewController, with mode: DateTimePickerMode, startDate: Date = Date(), endDate: Date? = nil, datePickerType: DatePickerType = .calendar, dateRangePresentation: DateRangePresentation = .paged, titles: Titles? = nil) {
    // @nonobjc public static func with(startTitle: String? = nil, startSubtitle: String? = nil, startTab: String? = nil, endTitle: String? = nil, endSubtitle: String? = nil, endTab: String? = nil, dateTitle: String? = nil, dateSubtitle: String? = nil, dateTimeTitle: String? = nil, dateTimeSubtitle: String? = nil) -> Titles {

    let datePicker = DateTimePicker()

    @objc public func present()
    {
        guard let viewController = UIApplication.shared.windows.filter({$0.isKeyWindow}).first?.rootViewController else {
            fatalError("Unable to get a UIViewController from current shared application context.")
        }
        datePicker.present(from: viewController, with: DateTimePickerMode.date)
    }

}
