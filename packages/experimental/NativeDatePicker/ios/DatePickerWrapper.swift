import FluentUI

@objc(MSFDatePickerWrapper)
class DatePickerWrapper: UIControl {
    @objc public var mode: DateTimePickerMode = .date
    @objc public var startDate: Date? = nil
    @objc public var endDate: Date? = nil
    @objc public var type: DateTimePicker.DatePickerType = .calendar
    @objc public var dateRangePresentation: DateTimePicker.DateRangePresentation = .paged
    @objc public let titles = DateTimePicker.Titles()

    public init() {
        super.init(frame: .zero)
        self.addTarget(self, action: #selector(present), for: .touchUpInside)
    }

    required init?(coder aDecoder: NSCoder) {
      fatalError("init(coder:) has not been implemented")
    }

    let datePicker = DateTimePicker()

    @objc func present() {
        DispatchQueue.main.async {
            guard let viewController = UIApplication.shared.windows.filter({$0.isKeyWindow}).first?.rootViewController else {
                fatalError("Unable to get a UIViewController from current shared application context.")
            }
            self.datePicker.present(
                from: viewController,
                with: self.mode,
                startDate: self.startDate ?? Date(),
                endDate: self.endDate,
                datePickerType: self.type,
                dateRangePresentation: self.dateRangePresentation,
                titles: self.titles
            )
        }
    }
}
