#pragma once

#include <windows.h>

#include <cstdint>
#include <memory>
#include <vector>

#include "common.h"

namespace furn {

// A single captured window frame in top-down BGRA order. The origin records the
// physical screen coordinate of pixel (0, 0) so element crops can be derived
// from client-relative geometry.
struct RawFrame {
  std::vector<std::uint8_t> pixels;
  UINT width{0};
  UINT height{0};
  UINT stride{0};
  POINT origin{};
  double scaleFactor{1.0};
};

struct EncodedImage {
  std::vector<std::uint8_t> png;
  UINT width{0};
  UINT height{0};
  double scaleFactor{1.0};
};

class CaptureEngine {
 public:
  CaptureEngine();
  ~CaptureEngine();
  CaptureEngine(const CaptureEngine&) = delete;
  CaptureEngine& operator=(const CaptureEngine&) = delete;

  bool Available();
  RawFrame CaptureWindow(HWND window, const CancellationToken& token);
  EncodedImage Encode(const RawFrame& frame, const RECT& cropInFrame);

 private:
  struct Impl;
  std::unique_ptr<Impl> impl_;
};

POINT ResolveCaptureOrigin(HWND window, UINT capturedWidth, UINT capturedHeight);

}  // namespace furn
