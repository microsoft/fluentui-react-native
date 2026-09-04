#include "geometry.h"

#include <algorithm>
#include <cmath>

#include "common.h"

namespace furn {

double DipsFromPhysical(double physical, UINT dpi) {
  const UINT effective = dpi == 0 ? kDefaultDpi : dpi;
  return physical * static_cast<double>(kDefaultDpi) / static_cast<double>(effective);
}

double PhysicalFromDips(double dips, UINT dpi) {
  const UINT effective = dpi == 0 ? kDefaultDpi : dpi;
  return dips * static_cast<double>(effective) / static_cast<double>(kDefaultDpi);
}

long RoundToPixel(double value) {
  if (!std::isfinite(value)) {
    return 0;
  }
  return static_cast<long>(std::llround(value));
}

RectD PhysicalRectToClientDips(const RECT& physical, const WindowMetrics& metrics) {
  RectD result;
  result.x = RoundToHundredths(DipsFromPhysical(static_cast<double>(physical.left - metrics.clientOrigin.x), metrics.dpi));
  result.y = RoundToHundredths(DipsFromPhysical(static_cast<double>(physical.top - metrics.clientOrigin.y), metrics.dpi));
  result.width = RoundToHundredths(DipsFromPhysical(static_cast<double>(physical.right - physical.left), metrics.dpi));
  result.height = RoundToHundredths(DipsFromPhysical(static_cast<double>(physical.bottom - physical.top), metrics.dpi));
  return result;
}

POINT ClientDipsToPhysicalPoint(double x, double y, const WindowMetrics& metrics) {
  POINT point{};
  point.x = metrics.clientOrigin.x + RoundToPixel(PhysicalFromDips(x, metrics.dpi));
  point.y = metrics.clientOrigin.y + RoundToPixel(PhysicalFromDips(y, metrics.dpi));
  return point;
}

RECT ClientDipsToPhysicalRect(const RectD& rect, const WindowMetrics& metrics) {
  const POINT origin = ClientDipsToPhysicalPoint(rect.x, rect.y, metrics);
  RECT result{};
  result.left = origin.x;
  result.top = origin.y;
  result.right = origin.x + RoundToPixel(PhysicalFromDips(rect.width, metrics.dpi));
  result.bottom = origin.y + RoundToPixel(PhysicalFromDips(rect.height, metrics.dpi));
  return result;
}

RectD ClientRectInScreenDips(const WindowMetrics& metrics) {
  RectD result;
  result.x = RoundToHundredths(DipsFromPhysical(static_cast<double>(metrics.clientOrigin.x), metrics.dpi));
  result.y = RoundToHundredths(DipsFromPhysical(static_cast<double>(metrics.clientOrigin.y), metrics.dpi));
  result.width = RoundToHundredths(DipsFromPhysical(static_cast<double>(metrics.clientSize.cx), metrics.dpi));
  result.height = RoundToHundredths(DipsFromPhysical(static_cast<double>(metrics.clientSize.cy), metrics.dpi));
  return result;
}

WindowMetrics MeasureWindow(HWND window) {
  if (window == nullptr || IsWindow(window) == FALSE) {
    Fail(kErrorNoSuchWindow, "The requested window is no longer available.");
  }
  WindowMetrics metrics;
  metrics.dpi = GetDpiForWindow(window);
  if (metrics.dpi == 0) {
    metrics.dpi = kDefaultDpi;
  }
  RECT client{};
  if (GetClientRect(window, &client) == FALSE) {
    FailLastError(kErrorNoSuchWindow, "Reading the window client rectangle", GetLastError());
  }
  POINT origin{client.left, client.top};
  if (ClientToScreen(window, &origin) == FALSE) {
    FailLastError(kErrorNoSuchWindow, "Mapping the window client origin", GetLastError());
  }
  metrics.clientOrigin = origin;
  metrics.clientSize.cx = client.right - client.left;
  metrics.clientSize.cy = client.bottom - client.top;
  if (GetWindowRect(window, &metrics.windowRect) == FALSE) {
    FailLastError(kErrorNoSuchWindow, "Reading the window rectangle", GetLastError());
  }
  return metrics;
}

bool RectContainsPoint(const RECT& rect, POINT point) {
  return point.x >= rect.left && point.x < rect.right && point.y >= rect.top && point.y < rect.bottom;
}

RECT IntersectRects(const RECT& left, const RECT& right) {
  RECT result{};
  result.left = std::max(left.left, right.left);
  result.top = std::max(left.top, right.top);
  result.right = std::min(left.right, right.right);
  result.bottom = std::min(left.bottom, right.bottom);
  if (result.right < result.left) {
    result.right = result.left;
  }
  if (result.bottom < result.top) {
    result.bottom = result.top;
  }
  return result;
}

bool IsEmptyRect(const RECT& rect) {
  return rect.right <= rect.left || rect.bottom <= rect.top;
}

}  // namespace furn
