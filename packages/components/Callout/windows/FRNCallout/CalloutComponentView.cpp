#include "pch.h"

#include "CalloutComponentView.h"

#ifdef RNW_NEW_ARCH

#include "codegen/react/components/FRNCalloutSpec/RCTCallout.g.h"

#include <ComponentView.Experimental.interop.h>
#include <winrt/Microsoft.UI.Content.h>
#include <winrt/Microsoft.UI.Input.h>
#include <winrt/Microsoft.UI.Windowing.h>
#include <winrt/Microsoft.UI.interop.h>

#include <commctrl.h>

namespace winrt::FRNCallout {

struct CalloutComponentView : winrt::implements<CalloutComponentView, winrt::IInspectable>,
                              FRNCalloutCodegen::BaseRCTCallout<CalloutComponentView> {
  ~CalloutComponentView() {
    CloseWindow();
  }

  void InitializePortal(
      const winrt::Microsoft::ReactNative::Composition::PortalComponentView &portalComponentView) noexcept {
    m_portal = portalComponentView;
    m_reactContext = portalComponentView.ReactContext();

    portalComponentView.Mounted([weakThis = get_weak()](auto &&, auto &&) {
      if (auto strongThis = weakThis.get()) {
        strongThis->m_mounted = true;
        strongThis->QueueShow();
      }
    });
    portalComponentView.Unmounted([weakThis = get_weak()](auto &&, auto &&) {
      if (auto strongThis = weakThis.get()) {
        strongThis->m_mounted = false;
        strongThis->CloseWindow();
      }
    });
  }

  void UpdateProps(
      const winrt::Microsoft::ReactNative::ComponentView &view,
      const winrt::com_ptr<FRNCalloutCodegen::RCTCalloutProps> &newProps,
      const winrt::com_ptr<FRNCalloutCodegen::RCTCalloutProps> &oldProps) noexcept override {
    BaseRCTCallout::UpdateProps(view, newProps, oldProps);
    QueueShow();
  }

  void MountChildComponentView(
      const winrt::Microsoft::ReactNative::ComponentView &,
      const winrt::Microsoft::ReactNative::MountChildComponentViewArgs &args) noexcept override {
    ResizeAndPosition(args.Child().LayoutMetrics());
    m_childLayoutMetricsToken = args.Child().LayoutMetricsChanged(
        [weakThis = get_weak()](auto &&, const auto &eventArgs) {
          if (auto strongThis = weakThis.get()) {
            strongThis->ResizeAndPosition(eventArgs.NewLayoutMetrics());
          }
        });
    QueueShow();
  }

  void UnmountChildComponentView(
      const winrt::Microsoft::ReactNative::ComponentView &,
      const winrt::Microsoft::ReactNative::UnmountChildComponentViewArgs &args) noexcept override {
    if (m_childLayoutMetricsToken) {
      args.Child().LayoutMetricsChanged(m_childLayoutMetricsToken);
      m_childLayoutMetricsToken.value = 0;
    }
  }

  void HandleFocusWindowCommand() noexcept override {
    if (m_window) {
      auto hwnd = winrt::Microsoft::UI::GetWindowFromWindowId(m_window.AppWindow().Id());
      SetForegroundWindow(hwnd);
      SetFocus(hwnd);
    }
  }

  void HandleBlurWindowCommand() noexcept override {
    if (m_parentHwnd) {
      SetForegroundWindow(m_parentHwnd);
      SetFocus(m_parentHwnd);
    }
  }

 private:
  void QueueShow() noexcept {
    if (!m_mounted || m_showQueued || m_popup) {
      return;
    }

    m_showQueued = true;
    m_reactContext.UIDispatcher().Post([weakThis = get_weak()] {
      if (auto strongThis = weakThis.get()) {
        strongThis->m_showQueued = false;
        strongThis->Show();
      }
    });
  }

  void Show() {
    if (!m_mounted || m_popup) {
      return;
    }

    m_parentHwnd =
        m_portal.as<::Microsoft::ReactNative::Composition::Experimental::IComponentViewInterop>()->GetHwndForParenting();
    m_previousWindowId =
        winrt::Microsoft::ReactNative::ReactCoreInjection::GetTopLevelWindowId(m_reactContext.Properties().Handle());

    m_popup = winrt::Microsoft::UI::Content::DesktopPopupSiteBridge::Create(
        m_portal.Parent()
            .as<winrt::Microsoft::ReactNative::Composition::ComponentView>()
            .Root()
            .ReactNativeIsland()
            .Island());
    m_window = winrt::Microsoft::ReactNative::ReactNativeWindow::CreateFromContentSiteBridgeAndIsland(
        m_popup, winrt::Microsoft::ReactNative::ReactNativeIsland::CreatePortal(m_portal));
    m_window.ResizePolicy(winrt::Microsoft::ReactNative::ContentSizePolicy::None);

    auto presenter = winrt::Microsoft::UI::Windowing::OverlappedPresenter::Create();
    presenter.IsResizable(false);
    presenter.IsMinimizable(false);
    presenter.IsMaximizable(false);
    presenter.SetBorderAndTitleBar(false, false);
    m_window.AppWindow().SetPresenter(presenter);

    m_calloutHwnd = winrt::Microsoft::UI::GetWindowFromWindowId(m_window.AppWindow().Id());
    SetWindowSubclass(m_calloutHwnd, WindowSubclassProc, 1, reinterpret_cast<DWORD_PTR>(this));

    m_closingToken = m_window.AppWindow().Closing([weakThis = get_weak()](auto &&, const auto &args) {
      args.Cancel(true);
      if (auto strongThis = weakThis.get()) {
        strongThis->Dismiss();
      }
    });

    winrt::Microsoft::ReactNative::ReactCoreInjection::SetTopLevelWindowId(
        m_reactContext.Properties().Handle(),
        reinterpret_cast<uint64_t>(winrt::Microsoft::UI::GetWindowFromWindowId(m_popup.WindowId())));

    if (m_portal.ContentRoot().Children().Size()) {
      ResizeAndPosition(m_portal.ContentRoot().Children().GetAt(0).LayoutMetrics());
    }

    m_popup.Show();
    if (Props() && Props()->setInitialFocus.value_or(false)) {
      auto focusController =
          winrt::Microsoft::UI::Input::InputFocusController::GetForIsland(m_window.ReactNativeIsland().Island());
      focusController.TrySetFocus();
    }

    if (auto eventEmitter = EventEmitter()) {
      eventEmitter->onShow({.target = m_portal.Tag()});
    }
  }

  void ResizeAndPosition(const winrt::Microsoft::ReactNative::LayoutMetrics &layoutMetrics) noexcept {
    if (!m_window || layoutMetrics.Frame.Width <= 0 || layoutMetrics.Frame.Height <= 0) {
      return;
    }

    const auto scale = layoutMetrics.PointScaleFactor;
    m_window.AppWindow().ResizeClient(
        {static_cast<int32_t>(std::ceil(layoutMetrics.Frame.Width * scale)),
         static_cast<int32_t>(std::ceil(layoutMetrics.Frame.Height * scale))});

    auto origin = AnchorOrigin();
    auto x = static_cast<int32_t>(std::round(origin.X * scale));
    auto y = static_cast<int32_t>(std::round(origin.Y * scale));
    auto windowSize = m_window.AppWindow().Size();
    MONITORINFO monitorInfo{.cbSize = sizeof(MONITORINFO)};
    if (GetMonitorInfo(MonitorFromPoint({x, y}, MONITOR_DEFAULTTONEAREST), &monitorInfo)) {
      auto props = Props();
      auto padding = static_cast<int32_t>(std::round((props ? props->minPadding.value_or(0) : 0) * scale));
      auto minX = monitorInfo.rcWork.left + padding;
      auto maxX = monitorInfo.rcWork.right - windowSize.Width - padding;
      auto minY = monitorInfo.rcWork.top + padding;
      auto maxY = monitorInfo.rcWork.bottom - windowSize.Height - padding;
      x = maxX >= minX ? std::clamp<int32_t>(x, minX, maxX) : minX;
      y = maxY >= minY ? std::clamp<int32_t>(y, minY, maxY) : minY;
    }
    m_window.AppWindow().Move({x, y});
  }

  winrt::Windows::Foundation::Point AnchorOrigin() const noexcept {
    auto props = Props();
    if (!props) {
      return {};
    }

    winrt::Windows::Foundation::Rect anchor{};
    if (props->anchorRect) {
      anchor = {
          static_cast<float>(props->anchorRect->screenX),
          static_cast<float>(props->anchorRect->screenY),
          static_cast<float>(props->anchorRect->width),
          static_cast<float>(props->anchorRect->height)};
    } else if (
        props->target &&
        (props->target.Type() == winrt::Microsoft::ReactNative::JSValueType::Int64 ||
         props->target.Type() == winrt::Microsoft::ReactNative::JSValueType::Double)) {
      auto targetTag = props->target.Type() == winrt::Microsoft::ReactNative::JSValueType::Int64
          ? props->target.AsInt64()
          : static_cast<int64_t>(props->target.AsDouble());
      auto target = winrt::Microsoft::ReactNative::Composition::CompositionUIService::ComponentFromReactTag(
          m_reactContext.Handle(), targetTag);
      if (target) {
        auto scale = target.LayoutMetrics().PointScaleFactor;
        auto current = target;
        float x = 0;
        float y = 0;
        while (current) {
          auto metrics = current.LayoutMetrics();
          x += metrics.Frame.X;
          y += metrics.Frame.Y;
          current = current.Parent();
        }

        POINT clientOrigin{0, 0};
        auto hwnd =
            target.as<::Microsoft::ReactNative::Composition::Experimental::IComponentViewInterop>()->GetHwndForParenting();
        ClientToScreen(hwnd, &clientOrigin);
        auto metrics = target.LayoutMetrics();
        anchor = {
            clientOrigin.x / scale + x,
            clientOrigin.y / scale + y,
            metrics.Frame.Width,
            metrics.Frame.Height};
      }
    }

    auto gap = static_cast<float>(props->gapSpace.value_or(0));
    auto windowSize = m_window.AppWindow().Size();
    auto scale = m_window.ReactNativeIsland().Island().RasterizationScale();
    auto width = windowSize.Width / scale;
    auto height = windowSize.Height / scale;
    auto hint = props->directionalHint.value_or("bottomCenter");

    if (hint.starts_with("top")) {
      auto x = hint.ends_with("LeftEdge") ? anchor.X
          : hint.ends_with("RightEdge")   ? anchor.X + anchor.Width - width
                                         : anchor.X + (anchor.Width - width) / 2;
      return {x, anchor.Y - height - gap};
    }
    if (hint.starts_with("left")) {
      auto y = hint.ends_with("TopEdge") ? anchor.Y
          : hint.ends_with("BottomEdge") ? anchor.Y + anchor.Height - height
                                        : anchor.Y + (anchor.Height - height) / 2;
      return {anchor.X - width - gap, y};
    }
    if (hint.starts_with("right")) {
      auto y = hint.ends_with("TopEdge") ? anchor.Y
          : hint.ends_with("BottomEdge") ? anchor.Y + anchor.Height - height
                                        : anchor.Y + (anchor.Height - height) / 2;
      return {anchor.X + anchor.Width + gap, y};
    }
    auto x = hint.ends_with("LeftEdge") ? anchor.X
        : hint.ends_with("RightEdge")   ? anchor.X + anchor.Width - width
                                       : anchor.X + (anchor.Width - width) / 2;
    return {x, anchor.Y + anchor.Height + gap};
  }

  void Dismiss() noexcept {
    const bool containedFocus = GetForegroundWindow() == m_calloutHwnd;
    if (auto eventEmitter = EventEmitter()) {
      eventEmitter->onDismiss({.target = m_portal.Tag()});
      if (Props() && Props()->onRestoreFocus) {
        eventEmitter->onRestoreFocus({.target = m_portal.Tag(), .containsFocus = containedFocus});
      }
    }
    CloseWindow();
  }

  void CloseWindow() noexcept {
    if (!m_popup) {
      return;
    }

    if (m_closingToken) {
      m_window.AppWindow().Closing(m_closingToken);
      m_closingToken.value = 0;
    }
    if (m_calloutHwnd) {
      RemoveWindowSubclass(m_calloutHwnd, WindowSubclassProc, 1);
      m_calloutHwnd = nullptr;
    }
    m_popup.Hide();
    m_window.Close();
    m_window = nullptr;
    m_popup.Close();
    m_popup = nullptr;

    if (m_previousWindowId) {
      winrt::Microsoft::ReactNative::ReactCoreInjection::SetTopLevelWindowId(
          m_reactContext.Properties().Handle(), m_previousWindowId);
      m_previousWindowId = 0;
    }
    HandleBlurWindowCommand();
  }

  static LRESULT CALLBACK WindowSubclassProc(
      HWND hwnd,
      UINT message,
      WPARAM wParam,
      LPARAM lParam,
      UINT_PTR subclassId,
      DWORD_PTR referenceData) noexcept {
    auto callout = reinterpret_cast<CalloutComponentView *>(referenceData);
    if (message == WM_ACTIVATE && LOWORD(wParam) == WA_INACTIVE && callout && !callout->PreventsLightDismiss()) {
      callout->m_reactContext.UIDispatcher().Post([weakThis = callout->get_weak()] {
        if (auto strongThis = weakThis.get()) {
          strongThis->Dismiss();
        }
      });
    }
    return DefSubclassProc(hwnd, message, wParam, lParam);
  }

  bool PreventsLightDismiss() const noexcept {
    auto props = Props();
    if (!props || !props->dismissBehaviors) {
      return false;
    }
    return std::ranges::find(*props->dismissBehaviors, "preventDismissOnClickOutside") != props->dismissBehaviors->end();
  }

  winrt::Microsoft::ReactNative::ReactContext m_reactContext{nullptr};
  winrt::Microsoft::ReactNative::Composition::PortalComponentView m_portal{nullptr};
  winrt::Microsoft::UI::Content::DesktopPopupSiteBridge m_popup{nullptr};
  winrt::Microsoft::ReactNative::ReactNativeWindow m_window{nullptr};
  HWND m_parentHwnd{nullptr};
  HWND m_calloutHwnd{nullptr};
  uint64_t m_previousWindowId{0};
  bool m_mounted{false};
  bool m_showQueued{false};
  winrt::event_token m_closingToken{};
  winrt::event_token m_childLayoutMetricsToken{};
};

} // namespace winrt::FRNCallout

void RegisterCalloutComponentView(
    winrt::Microsoft::ReactNative::IReactPackageBuilder const &packageBuilder) noexcept {
  packageBuilder.as<winrt::Microsoft::ReactNative::IReactPackageBuilderFabric>().AddViewComponent(
      L"Callout", [](const winrt::Microsoft::ReactNative::IReactViewComponentBuilder &builder) noexcept {
        auto compositionBuilder =
            builder.as<winrt::Microsoft::ReactNative::Composition::IReactCompositionViewComponentBuilder>();

        builder.SetCreateProps(
            [](winrt::Microsoft::ReactNative::ViewProps props,
               const winrt::Microsoft::ReactNative::IComponentProps &cloneFrom) noexcept {
              return winrt::make<FRNCalloutCodegen::RCTCalloutProps>(props, cloneFrom);
            });
        builder.SetUpdatePropsHandler(
            [](const winrt::Microsoft::ReactNative::ComponentView &view,
               const winrt::Microsoft::ReactNative::IComponentProps &newProps,
               const winrt::Microsoft::ReactNative::IComponentProps &oldProps) noexcept {
              view.UserData()
                  .as<winrt::FRNCallout::CalloutComponentView>()
                  ->UpdateProps(
                      view,
                      newProps ? newProps.as<FRNCalloutCodegen::RCTCalloutProps>() : nullptr,
                      oldProps ? oldProps.as<FRNCalloutCodegen::RCTCalloutProps>() : nullptr);
            });
        compositionBuilder.SetUpdateLayoutMetricsHandler(
            [](const winrt::Microsoft::ReactNative::ComponentView &view,
               const winrt::Microsoft::ReactNative::LayoutMetrics &newLayoutMetrics,
               const winrt::Microsoft::ReactNative::LayoutMetrics &oldLayoutMetrics) noexcept {
              view.UserData()
                  .as<winrt::FRNCallout::CalloutComponentView>()
                  ->UpdateLayoutMetrics(view, newLayoutMetrics, oldLayoutMetrics);
            });
        builder.SetUpdateEventEmitterHandler(
            [](const winrt::Microsoft::ReactNative::ComponentView &view,
               const winrt::Microsoft::ReactNative::EventEmitter &eventEmitter) noexcept {
              view.UserData()
                  .as<winrt::FRNCallout::CalloutComponentView>()
                  ->UpdateEventEmitter(std::make_shared<FRNCalloutCodegen::RCTCalloutEventEmitter>(eventEmitter));
            });
        builder.SetCustomCommandHandler(
            [](const winrt::Microsoft::ReactNative::ComponentView &view,
               const winrt::Microsoft::ReactNative::HandleCommandArgs &args) noexcept {
              view.UserData().as<winrt::FRNCallout::CalloutComponentView>()->HandleCommand(view, args);
            });
        builder.SetMountChildComponentViewHandler(
            [](const winrt::Microsoft::ReactNative::ComponentView &view,
               const winrt::Microsoft::ReactNative::MountChildComponentViewArgs &args) noexcept {
              view.UserData().as<winrt::FRNCallout::CalloutComponentView>()->MountChildComponentView(view, args);
            });
        builder.SetUnmountChildComponentViewHandler(
            [](const winrt::Microsoft::ReactNative::ComponentView &view,
               const winrt::Microsoft::ReactNative::UnmountChildComponentViewArgs &args) noexcept {
              view.UserData().as<winrt::FRNCallout::CalloutComponentView>()->UnmountChildComponentView(view, args);
            });
        compositionBuilder.SetPortalComponentViewInitializer(
            [](const winrt::Microsoft::ReactNative::Composition::PortalComponentView &portalView) noexcept {
              auto userData = winrt::make_self<winrt::FRNCallout::CalloutComponentView>();
              userData->InitializePortal(portalView);
              portalView.UserData(*userData);
            });
      });
}

#endif
