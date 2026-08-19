// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
#include "pch.h"

#include "Callout.h"

#include <winrt/Microsoft.UI.Content.h>
#include <winrt/Microsoft.UI.Input.h>
#include <winrt/Microsoft.UI.Windowing.h>
#include <winrt/Microsoft.UI.interop.h>
#include <winrt/Windows.System.h>

namespace winrt::FluentUI::Callout {

enum class DirectionalHint {
  LeftTopEdge,
  LeftCenter,
  LeftBottomEdge,
  TopLeftEdge,
  TopAutoEdge,
  TopCenter,
  TopRightEdge,
  RightTopEdge,
  RightCenter,
  RightBottomEdge,
  BottomLeftEdge,
  BottomAutoEdge,
  BottomCenter,
  BottomRightEdge
};

DirectionalHint parseDirectionHint(std::string &directionHint) {
  if (directionHint == "leftTopEdge") {
    return DirectionalHint::LeftTopEdge;
  } else if (directionHint == "leftCenter") {
    return DirectionalHint::LeftCenter;
  } else if (directionHint == "leftBottomEdge") {
    return DirectionalHint::LeftBottomEdge;
  } else if (directionHint == "topLeftEdge") {
    return DirectionalHint::TopLeftEdge;
  } else if (directionHint == "topAutoEdge") {
    return DirectionalHint::TopAutoEdge;
  } else if (directionHint == "topCenter") {
    return DirectionalHint::TopCenter;
  } else if (directionHint == "topRightEdge") {
    return DirectionalHint::TopRightEdge;
  } else if (directionHint == "rightTopEdge") {
    return DirectionalHint::RightTopEdge;
  } else if (directionHint == "rightCenter") {
    return DirectionalHint::RightCenter;
  } else if (directionHint == "rightBottomEdge") {
    return DirectionalHint::RightBottomEdge;
  } else if (directionHint == "bottomLeftEdge") {
    return DirectionalHint::BottomLeftEdge;
  } else if (directionHint == "bottomAutoEdge") {
    return DirectionalHint::BottomAutoEdge;
  } else if (directionHint == "bottomCenter") {
    return DirectionalHint::BottomCenter;
  } else if (directionHint == "bottomRightEdge") {
    return DirectionalHint::BottomRightEdge;
  }

  return DirectionalHint::LeftTopEdge;
}

struct CalloutComponentView
    : public winrt::implements<CalloutComponentView,
                               winrt::Windows::Foundation::IInspectable>,
      Codegen::BaseCallout<CalloutComponentView> {
  ~CalloutComponentView() {
    if (m_popup && !m_popup.IsClosed()) {
      /*
      // Unregister closing event handler
      if (m_appWindowClosingToken)
      {
              m_rnWindow.AppWindow().Closing(m_appWindowClosingToken);
              m_appWindowClosingToken = {};
      }
      */

      // Hide popup
      if (m_popup.IsVisible()) {
        m_popup.Hide();
      }

      if (m_rnWindow.AppWindow()) {
        m_rnWindow.Close();
        m_rnWindow = nullptr;
      }

      // Close bridge
      m_popup.Close();
      m_popup = nullptr;
    }
  }

  void UpdateProps(const winrt::Microsoft::ReactNative::ComponentView &view,
                   const winrt::com_ptr<Codegen::CalloutProps> &newProps,
                   const winrt::com_ptr<Codegen::CalloutProps>
                       &oldProps) noexcept override {
    if (!oldProps || newProps->directionalHint != oldProps->directionalHint) {
      m_directionalHint =
          newProps->directionalHint
              ? parseDirectionHint(newProps->directionalHint.value())
              : DirectionalHint::LeftTopEdge;

      auto portal = view.as<
          winrt::Microsoft::ReactNative::Composition::PortalComponentView>();
      if (portal.ContentRoot().Children().Size() != 0) {
        AdjustWindowSize(
            portal.ContentRoot().Children().GetAt(0).LayoutMetrics());
      }
    }

    __super::UpdateProps(view, newProps, oldProps);
  }

  void InitializePortalViewComponent(
      const winrt::Microsoft::ReactNative::Composition::PortalComponentView
          &portalComponentView) noexcept {
    m_reactContext = portalComponentView.ReactContext();

    portalComponentView.Mounted([](const auto & /*sender*/, const auto &view) {
      view.UserData().as<CalloutComponentView>()->OnMounted(view);
    });
    portalComponentView.Unmounted(
        [](const auto & /*sender*/, const auto &view) {
          view.UserData().as<CalloutComponentView>()->OnUnmounted(view);
        });
  }

  void HandleFocusWindowCommand() noexcept override {
    // nyi
  }

  // You must provide an implementation of this method to handle the
  // "blurWindow" command
  void HandleBlurWindowCommand() noexcept override {
    // nyi
  }

  void MountChildComponentView(
      const winrt::Microsoft::ReactNative::ComponentView & /*view*/,
      const winrt::Microsoft::ReactNative::MountChildComponentViewArgs
          &args) noexcept override {
    AdjustWindowSize(args.Child().LayoutMetrics());
    // TODO These asserts are currently hit if the root view of the callout is collapsed.
    // Need to handle this case
    // assert(args.Index() == 0);
    // assert(!m_childLayoutMetricsToken);
    m_childLayoutMetricsToken = args.Child().LayoutMetricsChanged(
        [wkThis = get_weak()](
            auto &/*sender*/,
            const winrt::Microsoft::ReactNative::LayoutMetricsChangedArgs
                &layoutMetricsChangedArgs) {
          if (auto strongThis = wkThis.get()) {
            strongThis->AdjustWindowSize(
                layoutMetricsChangedArgs.NewLayoutMetrics());
          }
        });
  }

  void UnmountChildComponentView(
      const winrt::Microsoft::ReactNative::ComponentView & /*view*/,
      const winrt::Microsoft::ReactNative::UnmountChildComponentViewArgs
          &args) noexcept override {
      // TODO These asserts are currently hit if the root view of the callout is collapsed.
      // Need to handle this case
      // assert(args.Index() == 0);
    // assert(m_childLayoutMetricsToken);
    args.Child().LayoutMetricsChanged(m_childLayoutMetricsToken);
    // m_childLayoutMetricsToken.value = 0;
  }

private:
  void
  OnMounted(const winrt::Microsoft::ReactNative::ComponentView &view) noexcept {
    assert(!m_mounted);
    m_mounted = true;

    CreatePopup(view);

    m_showQueued = true;

    m_reactContext.UIDispatcher().Post(
        [wkThis = get_weak(), wkView = winrt::weak_ref(view)]() {
          if (auto strongThis = wkThis.get()) {
            strongThis->m_showQueued = false;

            if (!strongThis->m_mounted) {
              return;
            }
            if (auto v = wkView.get()) {
              strongThis->Show();
            }
          }
        });
  }

  void OnUnmounted(
      const winrt::Microsoft::ReactNative::ComponentView & /*view*/) noexcept {
    assert(m_mounted);
    m_mounted = false;
  }

  void OnLightDismissDismissed(
      const winrt::Microsoft::UI::Input::InputLightDismissAction &,
      const winrt::Microsoft::UI::Input::InputLightDismissEventArgs &) {
    HidePopup();
  }

  void HidePopup() {
    if (!m_popup)
      return;
    m_popup.Hide();
    if (auto eventEmitter = EventEmitter())
      eventEmitter->onDismiss({});
  }

  void CreatePopup(
      const winrt::Microsoft::ReactNative::ComponentView &view) noexcept {
    if (m_popup)
      return;

    auto portal = view.as<
        winrt::Microsoft::ReactNative::Composition::PortalComponentView>();
    m_popup = winrt::Microsoft::UI::Content::DesktopPopupSiteBridge::Create(
        portal.Parent()
            .as<winrt::Microsoft::ReactNative::Composition::ComponentView>()
            .Root()
            .ReactNativeIsland()
            .Island());

    assert(!m_rnWindow);
    m_rnWindow = winrt::Microsoft::ReactNative::ReactNativeWindow::
        CreateFromContentSiteBridgeAndIsland(
            m_popup,
            winrt::Microsoft::ReactNative::ReactNativeIsland::CreatePortal(
                portal));
    m_rnWindow.ResizePolicy(
        winrt::Microsoft::ReactNative::ContentSizePolicy::None);

    auto inputLightDismissAction =
        winrt::Microsoft::UI::Input::InputLightDismissAction::GetForWindowId(
            m_rnWindow.AppWindow().Id());
    inputLightDismissAction.Dismissed(
        {get_weak(), &CalloutComponentView::OnLightDismissDismissed});

    if (portal.ContentRoot().Children().Size()) {
      AdjustWindowSize(
          portal.ContentRoot().Children().GetAt(0).LayoutMetrics());
    }
  }

  void RegisterLightDismissAction() noexcept {}

  void Show() noexcept {
    m_popup.Show();

    winrt::Microsoft::UI::Input::InputFocusController::GetForIsland(
        m_rnWindow.ReactNativeIsland().Island())
        .TrySetFocus();
    m_rnWindow.ReactNativeIsland().NavigateFocus(
        winrt::Microsoft::ReactNative::FocusNavigationRequest::
            FocusNavigationRequest(
                winrt::Microsoft::ReactNative::FocusNavigationReason::First));

    if (auto eventEmitter = EventEmitter()) {
      eventEmitter->onShow({});
    }
  }

  void AdjustWindowSize(const winrt::Microsoft::ReactNative::LayoutMetrics
                            &layoutMetrics) noexcept {
    if (!m_rnWindow) {
      return;
    }

    if (layoutMetrics.Frame.Width == 0 && layoutMetrics.Frame.Height == 0) {
      return;
    }

    // Calculate physical pixels from DIPs
    int32_t clientWidthPx = static_cast<int32_t>(
        layoutMetrics.Frame.Width * layoutMetrics.PointScaleFactor);
    int32_t clientHeightPx = static_cast<int32_t>(
        layoutMetrics.Frame.Height * layoutMetrics.PointScaleFactor);

    // Size the client area directly
    m_rnWindow.AppWindow().ResizeClient({clientWidthPx, clientHeightPx});

    // Target can be either a view tag of a view to anchor to, or a string for
    // an anchor id
    if (Props()->target.Type() ==
        winrt::Microsoft::ReactNative::JSValueType::Int64) {
      auto targetView = winrt::Microsoft::ReactNative::Composition::
          CompositionUIService::ComponentFromReactTag(
              m_reactContext.Handle(), Props()->target.AsInt64());
      auto targetPos = ViewToScreenOffset(targetView);

      POINT anchorPoint{targetPos.X, targetPos.Y};
      SIZE windowSize{clientWidthPx, clientHeightPx};

      RECT excludeRect{targetPos.X, targetPos.Y,
                       targetPos.X + targetView.LayoutMetrics().Frame.Width,
                       targetPos.Y + targetView.LayoutMetrics().Frame.Height};

      UINT flags = 0;

      if (m_directionalHint == DirectionalHint::LeftTopEdge) {
        flags = TPM_LEFTALIGN | TPM_TOPALIGN | TPM_HORIZONTAL;
      } else if (m_directionalHint == DirectionalHint::LeftCenter) {
        flags = TPM_LEFTALIGN | TPM_VCENTERALIGN | TPM_HORIZONTAL;
      } else if (m_directionalHint == DirectionalHint::LeftBottomEdge) {
        flags = TPM_LEFTALIGN | TPM_BOTTOMALIGN | TPM_HORIZONTAL;
      } else if (m_directionalHint == DirectionalHint::TopLeftEdge) {
        flags = TPM_LEFTALIGN | TPM_TOPALIGN | TPM_VERTICAL;
      } else if (m_directionalHint == DirectionalHint::TopAutoEdge) {
        flags = TPM_LEFTALIGN | TPM_TOPALIGN | TPM_VERTICAL;
      } else if (m_directionalHint == DirectionalHint::TopCenter) {
        flags = TPM_CENTERALIGN | TPM_TOPALIGN | TPM_VERTICAL;
      } else if (m_directionalHint == DirectionalHint::TopRightEdge) {
        flags = TPM_RIGHTALIGN | TPM_TOPALIGN | TPM_VERTICAL;
      } else if (m_directionalHint == DirectionalHint::RightTopEdge) {
        flags = TPM_RIGHTALIGN | TPM_TOPALIGN | TPM_HORIZONTAL;
      } else if (m_directionalHint == DirectionalHint::RightCenter) {
        flags = TPM_RIGHTALIGN | TPM_VCENTERALIGN | TPM_HORIZONTAL;
      } else if (m_directionalHint == DirectionalHint::RightBottomEdge) {
        flags = TPM_RIGHTALIGN | TPM_BOTTOMALIGN | TPM_HORIZONTAL;
      } else if (m_directionalHint == DirectionalHint::BottomLeftEdge) {
        flags = TPM_LEFTALIGN | TPM_BOTTOMALIGN | TPM_VERTICAL;
      } else if (m_directionalHint == DirectionalHint::BottomAutoEdge) {
        flags = TPM_LEFTALIGN | TPM_BOTTOMALIGN | TPM_VERTICAL;
      } else if (m_directionalHint == DirectionalHint::BottomCenter) {
        flags = TPM_CENTERALIGN | TPM_BOTTOMALIGN | TPM_VERTICAL;
      } else if (m_directionalHint == DirectionalHint::BottomRightEdge) {
        flags = TPM_RIGHTALIGN | TPM_BOTTOMALIGN | TPM_VERTICAL;
      }

      flags |= TPM_WORKAREA;

      RECT finalPos;

      CalculatePopupWindowPosition(&anchorPoint, &windowSize, flags,
                                   &excludeRect, &finalPos);

      m_rnWindow.AppWindow().Move({finalPos.left, finalPos.top});
    } else {
      // TODO target named anchors
      m_rnWindow.AppWindow().Move({0, 0});
    }
  };

  winrt::Windows::Graphics::PointInt32
  ViewToScreenOffset(const winrt::Microsoft::ReactNative::ComponentView &view) {
    winrt::Windows::Foundation::Point pt{
        (view.LayoutMetrics().Frame.X) * view.LayoutMetrics().PointScaleFactor,
        (view.LayoutMetrics().Frame.Y) * view.LayoutMetrics().PointScaleFactor};

    for (auto p = view.Parent(); p; p = p.Parent()) {
      pt.X += p.LayoutMetrics().Frame.X * p.LayoutMetrics().PointScaleFactor;
      pt.Y += p.LayoutMetrics().Frame.Y * p.LayoutMetrics().PointScaleFactor;
    }

    auto root =
        view.as<winrt::Microsoft::ReactNative::Composition::ComponentView>()
            .Root();
    auto cc = root.ReactNativeIsland().Island().CoordinateConverter();
    return cc.ConvertLocalToScreen(pt);
  }

  DirectionalHint m_directionalHint{DirectionalHint::LeftTopEdge};
  bool m_showQueued{false};
  bool m_mounted{false};
  winrt::event_token m_childLayoutMetricsToken;
  winrt::Microsoft::UI::Content::DesktopPopupSiteBridge m_popup{nullptr};
  winrt::Microsoft::ReactNative::ReactNativeWindow m_rnWindow{nullptr};
  winrt::Microsoft::ReactNative::ReactContext m_reactContext{nullptr};
};

} // namespace winrt::FluentUI::Callout

void RegisterCalloutComponentView(
    winrt::Microsoft::ReactNative::IReactPackageBuilder const &packageBuilder) {
  winrt::FluentUI::Callout::Codegen::RegisterCalloutNativeComponent<
      winrt::FluentUI::Callout::CalloutComponentView>(
      packageBuilder, [](const winrt::Microsoft::ReactNative::Composition::
                             IReactCompositionViewComponentBuilder &builder) {
        builder.SetPortalComponentViewInitializer(
            [](const winrt::Microsoft::ReactNative::Composition::
                   PortalComponentView &portalComponentView) noexcept {
              auto userData = winrt::make_self<
                  winrt::FluentUI::Callout::CalloutComponentView>();
              userData->InitializePortalViewComponent(portalComponentView);
              portalComponentView.UserData(*userData);
            });
      });
};