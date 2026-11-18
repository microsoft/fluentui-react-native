#include "capture.h"

#include <d3d11.h>
#include <dwmapi.h>
#include <dxgi1_2.h>
#include <wincodec.h>

#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.Graphics.Capture.h>
#include <winrt/Windows.Graphics.DirectX.Direct3D11.h>
#include <winrt/base.h>

#include <windows.graphics.capture.interop.h>
#include <windows.graphics.directx.direct3d11.interop.h>

#include <algorithm>
#include <cmath>

#include "geometry.h"

namespace furn {
namespace {

using winrt::Windows::Graphics::SizeInt32;
using winrt::Windows::Graphics::Capture::Direct3D11CaptureFrame;
using winrt::Windows::Graphics::Capture::Direct3D11CaptureFramePool;
using winrt::Windows::Graphics::Capture::GraphicsCaptureItem;
using winrt::Windows::Graphics::Capture::GraphicsCaptureSession;
using winrt::Windows::Graphics::DirectX::DirectXPixelFormat;
using winrt::Windows::Graphics::DirectX::Direct3D11::IDirect3DDevice;

constexpr unsigned int kFrameTimeoutMs = 4000;

bool IsDeviceLoss(HRESULT error) {
  return error == DXGI_ERROR_DEVICE_REMOVED || error == DXGI_ERROR_DEVICE_RESET;
}

void CheckCaptureHresult(std::string_view operation, HRESULT result) {
  if (IsDeviceLoss(result)) winrt::throw_hresult(result);
  CheckHresult(kErrorCaptureFailed, operation, result);
}

template <typename Capture, typename DeviceStatus, typename Reset>
RawFrame CaptureWithDeviceRecovery(const CancellationToken& token, Capture&& capture, DeviceStatus&& deviceStatus,
                                   Reset&& reset) {
  for (int attempt = 0;; ++attempt) {
    token.ThrowIfCancelled();
    try {
      return capture();
    } catch (const winrt::hresult_error& error) {
      if (!IsDeviceLoss(error.code()) && !IsDeviceLoss(deviceStatus())) {
        FailHresult(kErrorCaptureFailed, "Capturing the window", error.code());
      }
      reset();
      if (attempt != 0) FailHresult(kErrorCaptureFailed, "Capturing the window after device recovery", error.code());
    } catch (const HelperError& error) {
      if (error.code() != kErrorCaptureFailed || !IsDeviceLoss(deviceStatus())) throw;
      reset();
      if (attempt != 0) throw;
    }
  }
}

struct CaptureSessionResources {
  Direct3D11CaptureFramePool framePool{nullptr};
  GraphicsCaptureSession session{nullptr};
  winrt::event_token frameToken{};

  ~CaptureSessionResources() {
    if (frameToken) framePool.FrameArrived(frameToken);
    // Close may itself report a device failure. Release both objects without
    // replacing the HRESULT from the failed capture.
    try {
      if (session) session.Close();
    } catch (const winrt::hresult_error&) {
    }
    try {
      if (framePool) framePool.Close();
    } catch (const winrt::hresult_error&) {
    }
  }
};

}  // namespace

POINT ResolveCaptureOrigin(HWND window, UINT capturedWidth, UINT capturedHeight) {
  RECT windowRect{};
  if (GetWindowRect(window, &windowRect) == FALSE) {
    FailLastError(kErrorCaptureFailed, "Reading the captured window rectangle", GetLastError());
  }
  RECT frameBounds = windowRect;
  if (FAILED(DwmGetWindowAttribute(window, DWMWA_EXTENDED_FRAME_BOUNDS, &frameBounds, sizeof(frameBounds)))) {
    frameBounds = windowRect;
  }
  const auto distance = [&](const RECT& candidate) {
    const long width = candidate.right - candidate.left;
    const long height = candidate.bottom - candidate.top;
    return std::abs(width - static_cast<long>(capturedWidth)) + std::abs(height - static_cast<long>(capturedHeight));
  };
  const RECT& chosen = distance(frameBounds) <= distance(windowRect) ? frameBounds : windowRect;
  POINT origin{chosen.left, chosen.top};
  return origin;
}

struct CaptureEngine::Impl {
  winrt::com_ptr<ID3D11Device> device;
  winrt::com_ptr<ID3D11DeviceContext> context;
  IDirect3DDevice runtimeDevice{nullptr};
  winrt::com_ptr<IWICImagingFactory> imaging;

  void ResetDevice() {
    runtimeDevice = nullptr;
    context = nullptr;
    device = nullptr;
  }

  HRESULT DeviceStatus() const { return device ? device->GetDeviceRemovedReason() : S_OK; }

  void EnsureDevice() {
    if (device && runtimeDevice) {
      const HRESULT status = DeviceStatus();
      if (IsDeviceLoss(status)) winrt::throw_hresult(status);
      return;
    }
    ResetDevice();
    const D3D_FEATURE_LEVEL levels[] = {D3D_FEATURE_LEVEL_11_1, D3D_FEATURE_LEVEL_11_0, D3D_FEATURE_LEVEL_10_1,
                                        D3D_FEATURE_LEVEL_10_0};
    HRESULT result = D3D11CreateDevice(nullptr, D3D_DRIVER_TYPE_HARDWARE, nullptr, D3D11_CREATE_DEVICE_BGRA_SUPPORT,
                                       levels, ARRAYSIZE(levels), D3D11_SDK_VERSION, device.put(), nullptr,
                                       context.put());
    if (FAILED(result)) {
      device = nullptr;
      context = nullptr;
      result = D3D11CreateDevice(nullptr, D3D_DRIVER_TYPE_WARP, nullptr, D3D11_CREATE_DEVICE_BGRA_SUPPORT, levels,
                                 ARRAYSIZE(levels), D3D11_SDK_VERSION, device.put(), nullptr, context.put());
    }
    CheckCaptureHresult("Creating the Direct3D 11 capture device", result);

    winrt::com_ptr<IDXGIDevice> dxgiDevice;
    CheckCaptureHresult("Reading the DXGI capture device", device->QueryInterface(IID_PPV_ARGS(dxgiDevice.put())));
    winrt::com_ptr<::IInspectable> inspectable;
    CheckCaptureHresult("Wrapping the Direct3D device for Windows Graphics Capture",
                        CreateDirect3D11DeviceFromDXGIDevice(dxgiDevice.get(), inspectable.put()));
    runtimeDevice = inspectable.as<IDirect3DDevice>();
  }

  void EnsureImaging() {
    if (imaging) {
      return;
    }
    CheckHresult(kErrorCaptureFailed, "Creating the WIC imaging factory",
                 CoCreateInstance(CLSID_WICImagingFactory, nullptr, CLSCTX_INPROC_SERVER, IID_PPV_ARGS(imaging.put())));
  }
};

CaptureEngine::CaptureEngine() : impl_(std::make_unique<Impl>()) {}

CaptureEngine::~CaptureEngine() = default;

bool CaptureEngine::Available() {
  try {
    return GraphicsCaptureSession::IsSupported();
  } catch (const winrt::hresult_error&) {
    return false;
  }
}

RawFrame CaptureEngine::CaptureWindow(HWND window, const CancellationToken& token) {
  if (window == nullptr || IsWindow(window) == FALSE) {
    Fail(kErrorNoSuchWindow, "The requested window is no longer available.");
  }
  if (IsIconic(window) != FALSE) {
    Fail(kErrorUnsupported,
         "Capture is unavailable while the window is minimized; the helper never restores a window to capture it.");
  }
  if (!Available()) {
    Fail(kErrorUnsupported, "Windows Graphics Capture is unavailable on this system.");
  }
  return CaptureWithDeviceRecovery(
      token, [&]() { return CaptureWindowAttempt(window, token); },
      [&]() { return impl_->DeviceStatus(); }, [&]() { impl_->ResetDevice(); });
}

RawFrame CaptureEngine::CaptureWindowAttempt(HWND window, const CancellationToken& token) {
  impl_->EnsureDevice();
  token.ThrowIfCancelled();

  GraphicsCaptureItem item{nullptr};
  try {
    const auto interop = winrt::get_activation_factory<GraphicsCaptureItem, ::IGraphicsCaptureItemInterop>();
    winrt::check_hresult(
        interop->CreateForWindow(window, winrt::guid_of<GraphicsCaptureItem>(), winrt::put_abi(item)));
  } catch (const winrt::hresult_error& error) {
    CheckCaptureHresult("Creating the window capture item", error.code());
  }
  if (!item) {
    Fail(kErrorCaptureFailed, "Windows Graphics Capture did not provide a capture item for the window.");
  }

  const SizeInt32 size = item.Size();
  if (size.Width <= 0 || size.Height <= 0) {
    Fail(kErrorCaptureFailed, "The window reported an empty capture size.");
  }

  const auto ready = std::make_shared<winrt::handle>(CreateEventW(nullptr, TRUE, FALSE, nullptr));
  if (!*ready) {
    FailLastError(kErrorCaptureFailed, "Creating the capture synchronization event", GetLastError());
  }
  const HANDLE readyHandle = ready->get();

  CaptureSessionResources resources;
  auto& [framePool, session, frameToken] = resources;
  try {
    framePool = Direct3D11CaptureFramePool::CreateFreeThreaded(
        impl_->runtimeDevice, DirectXPixelFormat::B8G8R8A8UIntNormalized, 2, size);
    // The frame pool is free-threaded, so the delegate shares ownership of the
    // event and a late callback can never signal a recycled handle.
    frameToken = framePool.FrameArrived(
        [ready](const Direct3D11CaptureFramePool&, const winrt::Windows::Foundation::IInspectable&) {
          SetEvent(ready->get());
        });
    session = framePool.CreateCaptureSession(item);
    try {
      session.IsCursorCaptureEnabled(false);
    } catch (const winrt::hresult_error&) {
      // Older builds do not expose cursor control; the cursor stays visible.
    }
    try {
      session.IsBorderRequired(false);
    } catch (const winrt::hresult_error&) {
      // Border removal needs a capability that this helper does not request.
    }
    session.StartCapture();
  } catch (const winrt::hresult_error& error) {
    CheckCaptureHresult("Starting the window capture session", error.code());
  }

  RawFrame result;
  {
    Direct3D11CaptureFrame frame{nullptr};
    const Deadline deadline(kFrameTimeoutMs);
    while (!frame) {
      token.ThrowIfCancelled();
      const DWORD waited = WaitForSingleObject(readyHandle, 50);
      if (waited == WAIT_OBJECT_0) {
        ResetEvent(readyHandle);
      }
      frame = framePool.TryGetNextFrame();
      if (frame) {
        break;
      }
      if (deadline.Expired()) {
        Fail(kErrorCaptureFailed, "Windows Graphics Capture did not deliver a frame for the window.");
      }
    }

    const auto access = frame.Surface().as<::Windows::Graphics::DirectX::Direct3D11::IDirect3DDxgiInterfaceAccess>();
    winrt::com_ptr<ID3D11Texture2D> texture;
    CheckCaptureHresult("Reading the captured Direct3D texture", access->GetInterface(IID_PPV_ARGS(texture.put())));

    D3D11_TEXTURE2D_DESC description{};
    texture->GetDesc(&description);
    D3D11_TEXTURE2D_DESC staging = description;
    staging.Usage = D3D11_USAGE_STAGING;
    staging.BindFlags = 0;
    staging.CPUAccessFlags = D3D11_CPU_ACCESS_READ;
    staging.MiscFlags = 0;
    winrt::com_ptr<ID3D11Texture2D> readback;
    CheckCaptureHresult("Creating the capture readback texture",
                        impl_->device->CreateTexture2D(&staging, nullptr, readback.put()));
    impl_->context->CopyResource(readback.get(), texture.get());

    result.width = description.Width;
    result.height = description.Height;
    result.stride = result.width * 4;
    result.pixels.resize(static_cast<std::size_t>(result.stride) * result.height);
    D3D11_MAPPED_SUBRESOURCE mapped{};
    CheckCaptureHresult("Mapping the capture readback texture",
                        impl_->context->Map(readback.get(), 0, D3D11_MAP_READ, 0, &mapped));
    const auto* source = static_cast<const std::uint8_t*>(mapped.pData);
    for (UINT row = 0; row < result.height; row += 1) {
      std::copy_n(source + static_cast<std::size_t>(row) * mapped.RowPitch, result.stride,
                  result.pixels.begin() + static_cast<std::ptrdiff_t>(row) * result.stride);
    }
    impl_->context->Unmap(readback.get(), 0);
    frame.Close();
  }

  result.origin = ResolveCaptureOrigin(window, result.width, result.height);
  const UINT dpi = GetDpiForWindow(window);
  result.scaleFactor = static_cast<double>(dpi == 0 ? kDefaultDpi : dpi) / static_cast<double>(kDefaultDpi);
  return result;
}

void RunCaptureRecoverySelfTests(void (*check)(bool, const std::string&)) {
  const CancellationToken token;
  for (const HRESULT failure : {DXGI_ERROR_DEVICE_REMOVED, DXGI_ERROR_DEVICE_RESET}) {
    int captures = 0;
    int resets = 0;
    const auto frame = CaptureWithDeviceRecovery(
        token, [&]() {
          if (++captures == 1) CheckCaptureHresult("Reading a test frame", failure);
          RawFrame result;
          result.width = 42;
          return result;
        },
        []() { return S_OK; }, [&]() { ++resets; });
    check(frame.width == 42 && captures == 2 && resets == 1, "capture retries once after device loss");
  }

  int captures = 0;
  bool failed = false;
  try {
    CaptureWithDeviceRecovery(
        token, [&]() -> RawFrame { ++captures; winrt::throw_hresult(DXGI_ERROR_DEVICE_REMOVED); },
        []() { return S_OK; }, []() {});
  } catch (const HelperError& error) {
    failed = error.code() == kErrorCaptureFailed;
  }
  check(failed && captures == 2, "repeated device loss stops after one retry with capture-failed");

  captures = 0;
  failed = false;
  try {
    CaptureWithDeviceRecovery(
        token, [&]() -> RawFrame { ++captures; Fail(kErrorCaptureFailed, "Test frame was not delivered."); },
        []() { return S_OK; }, []() {});
  } catch (const HelperError& error) {
    failed = error.code() == kErrorCaptureFailed;
  }
  check(failed && captures == 1, "a capture failure without device loss is not retried");
}

EncodedImage CaptureEngine::Encode(const RawFrame& frame, const RECT& cropInFrame) {
  impl_->EnsureImaging();
  RECT bounds{0, 0, static_cast<long>(frame.width), static_cast<long>(frame.height)};
  const RECT crop = IntersectRects(bounds, cropInFrame);
  if (IsEmptyRect(crop)) {
    Fail(kErrorCaptureFailed, "The requested capture region lies outside the captured window.");
  }
  const UINT width = static_cast<UINT>(crop.right - crop.left);
  const UINT height = static_cast<UINT>(crop.bottom - crop.top);
  const UINT stride = width * 4;
  std::vector<std::uint8_t> pixels(static_cast<std::size_t>(stride) * height);
  for (UINT row = 0; row < height; row += 1) {
    const std::size_t sourceOffset =
        (static_cast<std::size_t>(crop.top) + row) * frame.stride + static_cast<std::size_t>(crop.left) * 4;
    std::copy_n(frame.pixels.begin() + static_cast<std::ptrdiff_t>(sourceOffset), stride,
                pixels.begin() + static_cast<std::ptrdiff_t>(row) * stride);
  }

  winrt::com_ptr<IStream> stream;
  CheckHresult(kErrorCaptureFailed, "Creating the PNG encoding stream",
               CreateStreamOnHGlobal(nullptr, TRUE, stream.put()));
  winrt::com_ptr<IWICBitmapEncoder> encoder;
  CheckHresult(kErrorCaptureFailed, "Creating the PNG encoder",
               impl_->imaging->CreateEncoder(GUID_ContainerFormatPng, nullptr, encoder.put()));
  CheckHresult(kErrorCaptureFailed, "Initializing the PNG encoder",
               encoder->Initialize(stream.get(), WICBitmapEncoderNoCache));
  winrt::com_ptr<IWICBitmapFrameEncode> encoded;
  winrt::com_ptr<IPropertyBag2> properties;
  CheckHresult(kErrorCaptureFailed, "Creating the PNG frame", encoder->CreateNewFrame(encoded.put(), properties.put()));
  CheckHresult(kErrorCaptureFailed, "Initializing the PNG frame", encoded->Initialize(properties.get()));
  CheckHresult(kErrorCaptureFailed, "Sizing the PNG frame", encoded->SetSize(width, height));
  GUID format = GUID_WICPixelFormat32bppBGRA;
  CheckHresult(kErrorCaptureFailed, "Selecting the PNG pixel format", encoded->SetPixelFormat(&format));
  CheckHresult(kErrorCaptureFailed, "Writing the PNG pixels",
               encoded->WritePixels(height, stride, static_cast<UINT>(pixels.size()), pixels.data()));
  CheckHresult(kErrorCaptureFailed, "Committing the PNG frame", encoded->Commit());
  CheckHresult(kErrorCaptureFailed, "Committing the PNG image", encoder->Commit());

  STATSTG statistics{};
  CheckHresult(kErrorCaptureFailed, "Measuring the PNG stream", stream->Stat(&statistics, STATFLAG_NONAME));
  const ULONG size = static_cast<ULONG>(statistics.cbSize.QuadPart);
  LARGE_INTEGER origin{};
  CheckHresult(kErrorCaptureFailed, "Rewinding the PNG stream", stream->Seek(origin, STREAM_SEEK_SET, nullptr));
  EncodedImage image;
  image.png.resize(size);
  ULONG read = 0;
  CheckHresult(kErrorCaptureFailed, "Reading the PNG stream", stream->Read(image.png.data(), size, &read));
  image.png.resize(read);
  image.width = width;
  image.height = height;
  image.scaleFactor = frame.scaleFactor;
  return image;
}

}  // namespace furn
