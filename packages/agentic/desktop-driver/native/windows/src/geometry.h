#pragma once

#include <windows.h>

namespace furn {

// Every public rectangle is expressed in logical device-independent pixels that
// are relative to the top-level client area. UI Automation and the window
// manager both report physical screen pixels, so all conversions funnel through
// this module.
struct RectD {
  double x{0.0};
  double y{0.0};
  double width{0.0};
  double height{0.0};
};

struct WindowMetrics {
  UINT dpi{96};
  POINT clientOrigin{};  // physical screen coordinates of the client origin
  SIZE clientSize{};     // physical client size
  RECT windowRect{};     // physical window rectangle
};

constexpr UINT kDefaultDpi = 96;

double DipsFromPhysical(double physical, UINT dpi);
double PhysicalFromDips(double dips, UINT dpi);
long RoundToPixel(double value);

RectD PhysicalRectToClientDips(const RECT& physical, const WindowMetrics& metrics);
POINT ClientDipsToPhysicalPoint(double x, double y, const WindowMetrics& metrics);
RECT ClientDipsToPhysicalRect(const RectD& rect, const WindowMetrics& metrics);
RectD ClientRectInScreenDips(const WindowMetrics& metrics);

WindowMetrics MeasureWindow(HWND window);
bool RectContainsPoint(const RECT& rect, POINT point);
RECT IntersectRects(const RECT& left, const RECT& right);
bool IsEmptyRect(const RECT& rect);

}  // namespace furn
