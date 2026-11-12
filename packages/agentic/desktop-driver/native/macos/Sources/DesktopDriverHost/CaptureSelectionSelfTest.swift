import CoreGraphics
import Foundation

extension SelfTestRunner {
  func testCaptureWindowSelection() {
    let frame = CGRect(x: 100, y: 120, width: 800, height: 600)
    func candidate(_ rect: CGRect, layer: Int = 0, title: String? = nil) -> CaptureWindowCandidate {
      CaptureWindowCandidate(frame: rect, layer: layer, title: title)
    }
    func select(_ candidates: [CaptureWindowCandidate], title: String = "") -> CaptureWindowSelection {
      selectCaptureWindow(candidates: candidates, title: title, windowFrame: frame)
    }

    check(select([]) == .noWindow, "capture reports no window when the process has none")
    check(
      select([candidate(frame, layer: 25)]) == .noWindow,
      "capture ignores windows above the ordinary window layer"
    )
    check(
      select([candidate(frame.offsetBy(dx: 1.5, dy: -1))]) == .selected(0),
      "capture accepts a window whose edges differ only by rounding"
    )
    check(
      select([candidate(frame.offsetBy(dx: 40, dy: 0))]) == .uncorrelated,
      "capture refuses the nearest window when it is not the tracked window's frame"
    )
    check(
      select([candidate(CGRect(x: 100, y: 120, width: 800, height: 640))]) == .uncorrelated,
      "capture refuses a window of the same origin and a different size"
    )
    check(
      select([candidate(CGRect(x: 10, y: 10, width: 200, height: 100), layer: 0), candidate(frame, layer: 25)])
        == .uncorrelated,
      "capture does not fall back to a panel layer when the ordinary windows do not match"
    )
    check(
      select([candidate(frame, title: "Other"), candidate(frame.offsetBy(dx: 1, dy: 0), title: "Main")], title: "Main")
        == .selected(1),
      "capture prefers the window whose title matches"
    )
    check(
      select([candidate(frame.offsetBy(dx: 1, dy: 0), title: "Other"), candidate(frame, title: "Another")], title: "Main")
        == .selected(1),
      "capture picks the closest frame when no title matches"
    )
    check(
      select([candidate(frame), candidate(frame)]) == .ambiguous,
      "capture refuses two equally matching windows"
    )
    check(
      select([candidate(frame), candidate(frame.offsetBy(dx: 1.5, dy: 0))]) == .selected(0),
      "capture takes the clearly closer of two correlated windows"
    )

    check(
      visibleState(hidden: false, frame: nil).value == nil && visibleState(hidden: nil, frame: nil).value == nil,
      "an element without readable geometry is not reported visible or hidden"
    )
    check(
      visibleState(hidden: false, frame: frame).value == true
        && visibleState(hidden: true, frame: frame).value == false
        && visibleState(hidden: false, frame: .zero).value == false,
      "an element with readable geometry is visible unless hidden or empty"
    )
  }
}
