import FluentUI

@objc(MSFDatePickerManager)
class DatePickerManager: NSObject {
    @objc public class func requiresMainQueueSetup() -> Bool {
        return true
    }

    //     @objc public func present(from presentingController: UIViewController, with mode: DateTimePickerMode, startDate: Date = Date(), endDate: Date? = nil, datePickerType: DatePickerType = .calendar, dateRangePresentation: DateRangePresentation = .paged, titles: Titles? = nil) {
    // @nonobjc public static func with(startTitle: String? = nil, startSubtitle: String? = nil, startTab: String? = nil, endTitle: String? = nil, endSubtitle: String? = nil, endTab: String? = nil, dateTitle: String? = nil, dateSubtitle: String? = nil, dateTimeTitle: String? = nil, dateTimeSubtitle: String? = nil) -> Titles {

    let datePicker = DateTimePicker()

    // Properties used directly by the `DateTimePicker.present` method
    public var mode: DateTimePickerMode = .date
    public var startDate: Date = Date()
    public var endDate: Date? = nil
    public var type: DateTimePicker.DatePickerType = .calendar
    public var dateRangePresentation: DateTimePicker.DateRangePresentation = .paged
    public let titles = DateTimePicker.Titles()

    @objc public func new() -> DatePickerManager {
        return DatePickerManager()
    }

    @objc public func present() {
        DispatchQueue.main.async {
            guard let viewController = UIApplication.shared.windows.filter({$0.isKeyWindow}).first?.rootViewController else {
                fatalError("Unable to get a UIViewController from current shared application context.")
            }

            //            present(from presentingController: UIViewController, with mode: DateTimePickerMode, startDate: Date = Date(), endDate: Date? = nil, datePickerType: DatePickerType = .calendar, dateRangePresentation: DateRangePresentation = .paged, titles: Titles? = nil)

            self.datePicker.present(from: viewController, with: self.mode, startDate: self.startDate, endDate: self.endDate, datePickerType: self.type, dateRangePresentation: self.dateRangePresentation, titles: self.titles)
        }
    }
}
