import ApplicationServices
import Foundation
import ImageIO
import ScreenCaptureKit
import UniformTypeIdentifiers

struct EncodedImage {
  let data: Data
  let width: Int
  let height: Int
  let scaleFactor: Double
}

private final class ShareableContentBox: @unchecked Sendable {
  let lock = NSLock()
  var content: SCShareableContent?
  var error: Error?
}

private final class ScreenshotBox: @unchecked Sendable {
  let lock = NSLock()
  var image: CGImage?
  var error: Error?
}

final class CaptureEngine {
  var available: Bool {
    if #available(macOS 14.0, *) {
      return CGPreflightScreenCaptureAccess()
    }
    return false
  }

  func captureWindow(
    window: WindowRecord,
    title: String,
    token: CancellationToken
  ) throws -> EncodedImage {
    let windowFrame = try window.currentFrame()
    return try capture(
      window: window,
      title: title,
      cropScreenRect: nil,
      windowFrame: windowFrame,
      token: token
    )
  }

  func captureElement(
    window: WindowRecord,
    title: String,
    element: ElementSnapshot,
    token: CancellationToken
  ) throws -> EncodedImage {
    guard element.screenRect.width > 0, element.screenRect.height > 0 else {
      try fail(ErrorCode.unsupported, "The element does not occupy a capturable area.")
    }
    let windowFrame = try window.currentFrame()
    return try capture(
      window: window,
      title: title,
      cropScreenRect: element.screenRect,
      windowFrame: windowFrame,
      token: token
    )
  }

  private func capture(
    window: WindowRecord,
    title: String,
    cropScreenRect: CGRect?,
    windowFrame: CGRect,
    token: CancellationToken
  ) throws -> EncodedImage {
    guard available else {
      try fail(ErrorCode.unsupported, "SCScreenshotManager is unavailable on this version of macOS.")
    }
    guard CGPreflightScreenCaptureAccess() else {
      try fail(
        ErrorCode.captureFailed,
        "Screen Recording permission is required. Enable Furn Desktop Driver Host in System Settings > Privacy & Security > Screen & System Audio Recording, then restart the helper."
      )
    }
    try token.throwIfCancelled()
    let content = try shareableContent(token: token)
    let candidates = content.windows.filter { candidate in
      candidate.owningApplication?.processID == window.processID
        && (title.isEmpty || candidate.title == title)
    }
    guard !candidates.isEmpty else {
      try fail(ErrorCode.captureFailed, "ScreenCaptureKit could not correlate the tracked accessibility window.")
    }
    let selected = candidates.min {
      frameDistance($0.frame, windowFrame) < frameDistance($1.frame, windowFrame)
    }!
    if candidates.count > 1 {
      let sorted = candidates.sorted { frameDistance($0.frame, windowFrame) < frameDistance($1.frame, windowFrame) }
      if sorted.count > 1
        && abs(frameDistance(sorted[0].frame, windowFrame) - frameDistance(sorted[1].frame, windowFrame)) < 0.5
      {
        try fail(ErrorCode.captureFailed, "ScreenCaptureKit found multiple indistinguishable windows for the target.")
      }
    }
    guard selected.isOnScreen else {
      try fail(
        ErrorCode.unsupported,
        "Capture is unavailable while the window is minimized or off screen; the helper never restores a window to capture it."
      )
    }
    let scale = scaleFactor(for: selected.frame, displays: content.displays)
    let configuration = SCStreamConfiguration()
    configuration.width = max(1, Int((selected.frame.width * scale).rounded()))
    configuration.height = max(1, Int((selected.frame.height * scale).rounded()))
    configuration.showsCursor = false
    configuration.capturesAudio = false
    configuration.ignoreShadowsSingleWindow = true
    configuration.backgroundColor = CGColor.clear
    let filter = SCContentFilter(desktopIndependentWindow: selected)
    let captured = try screenshot(filter: filter, configuration: configuration, token: token)
    try token.throwIfCancelled()

    let finalImage: CGImage
    if let cropScreenRect {
      let scaleX = CGFloat(captured.width) / max(1, selected.frame.width)
      let scaleY = CGFloat(captured.height) / max(1, selected.frame.height)
      var crop = CGRect(
        x: (cropScreenRect.minX - selected.frame.minX) * scaleX,
        y: (cropScreenRect.minY - selected.frame.minY) * scaleY,
        width: cropScreenRect.width * scaleX,
        height: cropScreenRect.height * scaleY
      ).integral
      crop = crop.intersection(CGRect(x: 0, y: 0, width: captured.width, height: captured.height))
      guard !crop.isNull, crop.width > 0, crop.height > 0, let cropped = captured.cropping(to: crop) else {
        try fail(ErrorCode.captureFailed, "The requested element capture lies outside the captured window.")
      }
      finalImage = cropped
    } else {
      finalImage = captured
    }
    let encoded = try encodePNG(finalImage)
    return EncodedImage(
      data: encoded,
      width: finalImage.width,
      height: finalImage.height,
      scaleFactor: rounded(scale)
    )
  }

  private func shareableContent(token: CancellationToken) throws -> SCShareableContent {
    let box = ShareableContentBox()
    let semaphore = DispatchSemaphore(value: 0)
    SCShareableContent.getExcludingDesktopWindows(true, onScreenWindowsOnly: false) { content, error in
      box.lock.lock()
      box.content = content
      box.error = error
      box.lock.unlock()
      semaphore.signal()
    }
    try wait(semaphore, token: token, operation: "ScreenCaptureKit window enumeration")
    box.lock.lock()
    let content = box.content
    let error = box.error
    box.lock.unlock()
    if let error {
      try fail(ErrorCode.captureFailed, "ScreenCaptureKit window enumeration failed: \(error.localizedDescription)")
    }
    guard let content else {
      try fail(ErrorCode.captureFailed, "ScreenCaptureKit returned no shareable desktop content.")
    }
    return content
  }

  private func screenshot(
    filter: SCContentFilter,
    configuration: SCStreamConfiguration,
    token: CancellationToken
  ) throws -> CGImage {
    let box = ScreenshotBox()
    let semaphore = DispatchSemaphore(value: 0)
    SCScreenshotManager.captureImage(contentFilter: filter, configuration: configuration) { image, error in
      box.lock.lock()
      box.image = image
      box.error = error
      box.lock.unlock()
      semaphore.signal()
    }
    try wait(semaphore, token: token, operation: "ScreenCaptureKit screenshot")
    box.lock.lock()
    let image = box.image
    let error = box.error
    box.lock.unlock()
    if let error {
      try fail(ErrorCode.captureFailed, "ScreenCaptureKit screenshot failed: \(error.localizedDescription)")
    }
    guard let image else {
      try fail(ErrorCode.captureFailed, "ScreenCaptureKit returned no image for the target window.")
    }
    return image
  }

  private func wait(
    _ semaphore: DispatchSemaphore,
    token: CancellationToken,
    operation: String
  ) throws {
    let deadline = DispatchTime.now() + .seconds(10)
    while semaphore.wait(timeout: .now() + .milliseconds(50)) == .timedOut {
      try token.throwIfCancelled()
      if DispatchTime.now() >= deadline {
        try fail(ErrorCode.captureFailed, "\(operation) did not complete within 10 seconds.")
      }
    }
    try token.throwIfCancelled()
  }

  private func scaleFactor(for windowFrame: CGRect, displays: [SCDisplay]) -> CGFloat {
    let center = CGPoint(x: windowFrame.midX, y: windowFrame.midY)
    if let display = displays.first(where: { $0.frame.contains(center) }), display.frame.width > 0 {
      return max(1, CGFloat(display.width) / display.frame.width)
    }
    return 1
  }

  private func frameDistance(_ left: CGRect, _ right: CGRect) -> CGFloat {
    abs(left.minX - right.minX)
      + abs(left.minY - right.minY)
      + abs(left.width - right.width)
      + abs(left.height - right.height)
  }

  private func encodePNG(_ image: CGImage) throws -> Data {
    let data = NSMutableData()
    guard
      let destination = CGImageDestinationCreateWithData(
        data,
        UTType.png.identifier as CFString,
        1,
        nil
      )
    else {
      try fail(ErrorCode.captureFailed, "Creating the PNG encoder failed.")
    }
    CGImageDestinationAddImage(destination, image, nil)
    guard CGImageDestinationFinalize(destination) else {
      try fail(ErrorCode.captureFailed, "Encoding the captured image as PNG failed.")
    }
    return data as Data
  }
}
