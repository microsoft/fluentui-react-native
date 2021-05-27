@objc(MSFDatePickerManager)
class DatePickerManager: RCTViewManager {
    override class func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func view() -> UIView! {
        return DatePickerWrapper()
    }
}
