// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
#include "pch.h"

#include "Callout.h"
#include <ComponentView.Experimental.interop.h>
#include <atomic>

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
    RemoveManagedSubscriptions();
    if (m_lightDismiss && m_lightDismissToken.value) m_lightDismiss.Dismissed(m_lightDismissToken);
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
    if (oldProps && oldProps->menuFocusManagement.value_or(false) && m_ready &&
        (!newProps->menuFocusManagement.value_or(false) ||
         newProps->target.Type() != winrt::Microsoft::ReactNative::JSValueType::Int64 ||
         newProps->target.AsInt64() != m_anchorTag)) {
      CloseManaged("host-detached", false, "", false);
    }
    __super::UpdateProps(view, newProps, oldProps);
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

  }

  void FinalizeUpdate(const winrt::Microsoft::ReactNative::ComponentView &,
                      winrt::Microsoft::ReactNative::ComponentViewUpdateMask) noexcept override {
    TryShowManaged();
  }

  void InitializePortalViewComponent(
      const winrt::Microsoft::ReactNative::Composition::PortalComponentView
          &portalComponentView) noexcept {
    m_reactContext = portalComponentView.ReactContext();
    m_portal = portalComponentView;

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

  void HandleFocusInitialChildCommand(std::string generation, std::string requestId,
                                     int32_t targetTag) noexcept override {
    auto status = ManagedRequestStatus(generation);
    if (!status.empty()) {
      EmitManagedResult(generation, requestId, "initial-focus", status);
      return;
    }
    auto portal = m_portal.get();
    if (m_initialFocusSuperseded) {
      EmitManagedResult(generation, requestId, "initial-focus", "focus-moved");
      return;
    }
    auto target = FindDescendant(portal.ContentRoot(), targetTag);
    if (!target) {
      EmitManagedResult(generation, requestId, "initial-focus", "not-mounted");
      return;
    }
    if (!Eligible(target)) {
      EmitManagedResult(generation, requestId, "initial-focus", "not-focusable");
      return;
    }
    if (!OwnsPopupFocus() && !OwnsParentFocus()) {
      EmitManagedResult(generation, requestId, "initial-focus", "inactive-window");
      return;
    }
    auto focus = winrt::Microsoft::UI::Input::InputFocusController::GetForIsland(
        m_rnWindow.ReactNativeIsland().Island());
    if (!focus.TrySetFocus()) {
      EmitManagedResult(generation, requestId, "initial-focus", "inactive-window");
      return;
    }
    const bool requested = target.TryFocus(winrt::Microsoft::ReactNative::FocusState::Keyboard);
    const bool confirmed = requested && OwnsPopupFocus() &&
        portal.ContentRoot().GetFocusedComponent() == target;
    EmitManagedResult(generation, requestId, "initial-focus", confirmed ? "confirmed" : "failed");
  }

  void HandleCloseOwnedCommand(std::string generation, std::string requestId,
                               std::string reason, bool returnFocus) noexcept override {
    auto status = ManagedRequestStatus(generation);
    if (!status.empty()) {
      EmitManagedResult(generation, requestId, "close", status);
    } else if (reason != "action" && reason != "programmatic") {
      EmitManagedResult(generation, requestId, "close", "failed");
    } else {
      CloseManaged(reason, returnFocus && reason == "action", requestId);
    }
  }

  void HandleFocusOwnedChildCommand(std::string generation, std::string requestId,
                                   int32_t /*targetTag*/, std::string /*intent*/) noexcept override {
    EmitManagedResult(generation, requestId, "owned-child-focus", "unsupported");
  }

  void MountChildComponentView(
      const winrt::Microsoft::ReactNative::ComponentView & /*view*/,
      const winrt::Microsoft::ReactNative::MountChildComponentViewArgs
          &args) noexcept override {
    if (args.Index() == 0) m_content = args.Child();
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
            strongThis->TryShowManaged();
          }
        });
  }

  void UnmountChildComponentView(
      const winrt::Microsoft::ReactNative::ComponentView & /*view*/,
      const winrt::Microsoft::ReactNative::UnmountChildComponentViewArgs
          &args) noexcept override {
    if (MenuManaged() && m_content.get() == args.Child()) {
      CloseManaged("host-detached", false);
      m_content = {};
    }
      // TODO These asserts are currently hit if the root view of the callout is collapsed.
      // Need to handle this case
      // assert(args.Index() == 0);
    // assert(m_childLayoutMetricsToken);
    if (m_childLayoutMetricsToken.value) args.Child().LayoutMetricsChanged(m_childLayoutMetricsToken);
    m_childLayoutMetricsToken = {};
    // m_childLayoutMetricsToken.value = 0;
  }

private:
  bool MenuManaged() const noexcept {
    return Props() && Props()->menuFocusManagement.value_or(false);
  }

  static winrt::Microsoft::ReactNative::ComponentView FindDescendant(
      const winrt::Microsoft::ReactNative::ComponentView &scope, int64_t tag) noexcept {
    if (!scope) return nullptr;
    if (scope.Tag() == tag) return scope;
    for (auto child : scope.Children()) {
      if (auto match = FindDescendant(child, tag)) return match;
    }
    return nullptr;
  }

  static bool Within(const winrt::Microsoft::ReactNative::ComponentView &view,
                     const winrt::Microsoft::ReactNative::ComponentView &scope) noexcept {
    if (!scope) return false;
    for (auto current = view; current; current = current.Parent()) {
      if (current == scope) return true;
    }
    return false;
  }

  static bool Eligible(const winrt::Microsoft::ReactNative::ComponentView &view) noexcept {
    if (!view || !view.Parent() ||
        winrt::Microsoft::ReactNative::Composition::FocusManager::FindFirstFocusableElement(view) != view) return false;
    auto root = view.as<winrt::Microsoft::ReactNative::Composition::ComponentView>().Root();
    if (!root) return false;
    for (auto current = view; current && current != root; current = current.Parent()) {
      const auto frame = current.LayoutMetrics().Frame;
      if (frame.Width <= 0 || frame.Height <= 0) return false;
      if (auto visual = current.try_as<winrt::Microsoft::ReactNative::Composition::ViewComponentView>()) {
        if (visual.ViewProps().Opacity() <= 0) return false;
      }
    }
    return true;
  }

  bool IntendedForeground() const noexcept {
    if (!m_rnWindow || !m_parentHwnd) return false;
    auto foreground = GetForegroundWindow();
    if (!foreground) return false;
    auto popupHwnd = winrt::Microsoft::UI::GetWindowFromWindowId(m_rnWindow.AppWindow().Id());
    auto root = GetAncestor(foreground, GA_ROOT);
    return root == GetAncestor(popupHwnd, GA_ROOT) || root == GetAncestor(m_parentHwnd, GA_ROOT);
  }

  bool OwnsPopupFocus() const noexcept {
    return m_rnWindow && m_popup && !m_popup.IsClosed() &&
        m_rnWindow.ReactNativeIsland() && IntendedForeground() &&
        winrt::Microsoft::UI::Input::InputFocusController::GetForIsland(
            m_rnWindow.ReactNativeIsland().Island()).HasFocus();
  }

  bool OwnsParentFocus() const noexcept {
    auto parent = m_parentRoot.get();
    return parent && parent.ReactNativeIsland() && IntendedForeground() && parent.GetFocusedComponent() == m_openingFocus.get() &&
        winrt::Microsoft::UI::Input::InputFocusController::GetForIsland(
            parent.ReactNativeIsland().Island()).HasFocus();
  }

  std::string ManagedRequestStatus(const std::string &generation) const noexcept {
    if (!MenuManaged()) return "unsupported";
    if (!m_mounted || !m_shown || !m_ready || !m_portal.get()) return "not-mounted";
    return m_generation == generation ? "" : "cancelled";
  }

  void EmitManagedResult(const std::string &generation, const std::string &requestId,
                         const std::string &operation, const std::string &status,
                         const std::string &returnFocus = "not-requested") noexcept {
    if (auto emitter = EventEmitter()) {
      emitter->onManagedOperationResult({generation, requestId, operation, status, returnFocus});
    }
  }

  void RemoveManagedSubscriptions() noexcept {
    if (m_keyboardSource && m_keyDownToken.value) m_keyboardSource.KeyDown(m_keyDownToken);
    m_keyDownToken = {};
    m_keyboardSource = nullptr;
    if (m_pointerSource && m_pointerPressedToken.value) m_pointerSource.PointerPressed(m_pointerPressedToken);
    m_pointerPressedToken = {};
    m_pointerSource = nullptr;
    if (auto anchor = m_anchor.get(); anchor && m_anchorUnmountedToken.value) {
      anchor.Unmounted(m_anchorUnmountedToken);
    }
    m_anchorUnmountedToken = {};
  }

  void CloseManaged(const std::string &reason, bool returnFocus,
                    const std::string &requestId = "", bool notifyLegacy = true) noexcept {
    if (!m_ready || !m_shown) return;
    const auto generation = m_generation;
    const bool ownedPopup = OwnsPopupFocus();
    auto anchor = m_anchor.get();
    auto parent = m_parentRoot.get();
    std::string returnStatus = "not-requested";
    if (returnFocus) {
      if (!ownedPopup) returnStatus = "inactive-window";
      else if (!anchor || !parent || !parent.ReactNativeIsland() || anchor.Tag() != m_anchorTag || !Within(anchor, parent)) returnStatus = "not-mounted";
      else if (!Eligible(anchor)) returnStatus = "not-focusable";
      else if (parent.GetFocusedComponent() != m_openingFocus.get()) returnStatus = "focus-moved";
      else returnStatus = "confirmed";
    }
    m_ready = false;
    m_shown = false;
    m_closed = true;
    m_generation.clear();
    RemoveManagedSubscriptions();
    m_popup.Hide();
    const bool closed = !m_popup.IsVisible();
    if (!closed && returnFocus) returnStatus = "failed";
    if (closed && returnFocus && returnStatus == "confirmed") {
      if (!IntendedForeground() || !IsWindow(m_parentHwnd) || !IsWindowVisible(m_parentHwnd) || !IsWindowEnabled(m_parentHwnd)) {
        returnStatus = "inactive-window";
      } else if (!Within(anchor, parent) || anchor.Tag() != m_anchorTag || !Eligible(anchor)) {
        returnStatus = "not-mounted";
      } else if (parent.GetFocusedComponent() != m_openingFocus.get()) {
        returnStatus = "focus-moved";
      } else {
        auto focus = winrt::Microsoft::UI::Input::InputFocusController::GetForIsland(parent.ReactNativeIsland().Island());
        const bool activated = focus.TrySetFocus();
        const bool requested = activated && anchor.TryFocus(winrt::Microsoft::ReactNative::FocusState::Programmatic);
        returnStatus = requested && focus.HasFocus() && IntendedForeground() &&
            parent.GetFocusedComponent() == anchor ? "confirmed" : "failed";
      }
    }
    if (!requestId.empty()) EmitManagedResult(generation, requestId, "close", closed ? "confirmed" : "failed", returnStatus);
    if (auto emitter = EventEmitter(); closed && emitter) {
      emitter->onDismissContext({generation, reason, returnStatus});
      if (notifyLegacy) emitter->onDismiss({});
    }
  }

  void TryShowManaged() noexcept {
    if (!MenuManaged() || !m_mounted || m_shown || m_closed || !m_popup || !EventEmitter()) return;
    auto portal = m_portal.get();
    auto content = m_content.get();
    if (!portal || !content || !Within(content, portal.ContentRoot())) return;
    const auto frame = content.LayoutMetrics().Frame;
    if (frame.Width <= 0 || frame.Height <= 0 ||
        Props()->target.Type() != winrt::Microsoft::ReactNative::JSValueType::Int64) return;
    auto anchor = winrt::Microsoft::ReactNative::Composition::CompositionUIService::ComponentFromReactTag(
        m_reactContext.Handle(), Props()->target.AsInt64());
    if (!anchor || !anchor.Parent()) return;
    auto parent = anchor.as<winrt::Microsoft::ReactNative::Composition::ComponentView>().Root();
    if (!parent || parent != m_parentRoot.get()) return;
    m_anchor = anchor;
    m_anchorTag = anchor.Tag();
    m_openingFocus = parent.GetFocusedComponent();
    static std::atomic_uint64_t nextGeneration{0};
    m_generation = std::to_string(++nextGeneration);
    m_ready = true;
    m_shown = true;
    m_initialFocusSuperseded = false;
    m_anchorUnmountedToken = anchor.Unmounted([weakThis = get_weak()](const auto &, const auto &) {
      if (auto self = weakThis.get()) self->CloseManaged("host-detached", false);
    });
    m_keyboardSource = winrt::Microsoft::UI::Input::InputKeyboardSource::GetForIsland(m_rnWindow.ReactNativeIsland().Island());
    m_keyDownToken = m_keyboardSource.KeyDown(
        [weakThis = get_weak()](const winrt::Microsoft::UI::Input::InputKeyboardSource &source,
                               const winrt::Microsoft::UI::Input::KeyEventArgs &args) {
          if (auto self = weakThis.get()) {
            using winrt::Windows::System::VirtualKey;
            const auto down = winrt::Microsoft::UI::Input::VirtualKeyStates::Down;
            const bool modified = (source.GetKeyState(VirtualKey::Shift) & down) == down ||
                (source.GetKeyState(VirtualKey::Control) & down) == down ||
                (source.GetKeyState(VirtualKey::Menu) & down) == down ||
                (source.GetKeyState(VirtualKey::LeftWindows) & down) == down ||
                (source.GetKeyState(VirtualKey::RightWindows) & down) == down;
            if (self->m_ready) self->m_initialFocusSuperseded = true;
            if (args.VirtualKey() == VirtualKey::Escape && !modified && self->m_ready && self->OwnsPopupFocus()) {
              args.Handled(true);
              if (!args.KeyStatus().WasKeyDown) self->CloseManaged("escape", true);
            }
          }
        });
    m_pointerSource = winrt::Microsoft::UI::Input::InputPointerSource::GetForIsland(m_rnWindow.ReactNativeIsland().Island());
    m_pointerPressedToken = m_pointerSource.PointerPressed([weakThis = get_weak()](const auto &, const auto &) {
      if (auto self = weakThis.get(); self && self->m_ready) self->m_initialFocusSuperseded = true;
    });
    const bool canActivate = OwnsParentFocus();
    AdjustWindowSize(m_content.get().LayoutMetrics());
    m_popup.Show();
    if (canActivate && m_ready) {
      winrt::Microsoft::UI::Input::InputFocusController::GetForIsland(
          m_rnWindow.ReactNativeIsland().Island()).TrySetFocus();
    }
    if (m_ready) {
      if (auto emitter = EventEmitter()) {
        emitter->onShow({});
        emitter->onReady({m_generation});
      }
    }
  }

  void
  OnMounted(const winrt::Microsoft::ReactNative::ComponentView &view) noexcept {
    assert(!m_mounted);
    m_mounted = true;
    const auto lifetime = ++m_lifetime;
    m_closed = false;

    CreatePopup(view);

    m_showQueued = true;

    m_reactContext.UIDispatcher().Post(
        [wkThis = get_weak(), wkView = winrt::weak_ref(view), lifetime]() {
          if (auto strongThis = wkThis.get()) {
            strongThis->m_showQueued = false;

            if (!strongThis->m_mounted || strongThis->m_lifetime != lifetime) {
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
    if (!m_mounted) return;
    if (MenuManaged()) CloseManaged("host-detached", false, "", false);
    m_mounted = false;
    ++m_lifetime;
    if (MenuManaged()) {
      if (m_lightDismiss && m_lightDismissToken.value) m_lightDismiss.Dismissed(m_lightDismissToken);
      m_lightDismissToken = {};
      m_lightDismiss = nullptr;
      if (auto content = m_content.get(); content && m_childLayoutMetricsToken.value) {
        content.LayoutMetricsChanged(m_childLayoutMetricsToken);
      }
      m_childLayoutMetricsToken = {};
      if (m_rnWindow) m_rnWindow.Close();
      if (m_popup && !m_popup.IsClosed()) m_popup.Close();
      m_rnWindow = nullptr;
      m_popup = nullptr;
    }
  }

  void OnLightDismissDismissed(
      const winrt::Microsoft::UI::Input::InputLightDismissAction &sender,
      const winrt::Microsoft::UI::Input::InputLightDismissEventArgs &) {
    if (sender == m_lightDismiss) HidePopup();
  }

  void HidePopup() {
    if (MenuManaged()) {
      CloseManaged("native-light-dismiss", false);
      return;
    }
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
    m_parentRoot = portal.Parent().as<winrt::Microsoft::ReactNative::Composition::ComponentView>().Root();
    m_parentHwnd = view.as<::Microsoft::ReactNative::Composition::Experimental::IComponentViewInterop>()->GetHwndForParenting();
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

    m_lightDismiss =
        winrt::Microsoft::UI::Input::InputLightDismissAction::GetForWindowId(
            m_rnWindow.AppWindow().Id());
    m_lightDismissToken = m_lightDismiss.Dismissed(
        {get_weak(), &CalloutComponentView::OnLightDismissDismissed});

    if (portal.ContentRoot().Children().Size()) {
      AdjustWindowSize(
          portal.ContentRoot().Children().GetAt(0).LayoutMetrics());
    }
  }

  void RegisterLightDismissAction() noexcept {}

  void Show() noexcept {
    if (MenuManaged()) {
      TryShowManaged();
      return;
    }
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
      if (MenuManaged() && (!targetView || !targetView.Parent())) return;
      auto targetPos = ViewToScreenOffset(targetView);
      auto targetScaleFactor =
          targetView.LayoutMetrics().PointScaleFactor;
      auto targetWidthPx = static_cast<int32_t>(
          targetView.LayoutMetrics().Frame.Width * targetScaleFactor);
      auto targetHeightPx = static_cast<int32_t>(
          targetView.LayoutMetrics().Frame.Height * targetScaleFactor);
      auto targetRight = targetPos.X + targetWidthPx;
      auto targetBottom = targetPos.Y + targetHeightPx;
      auto targetCenterX = targetPos.X + targetWidthPx / 2;
      auto targetCenterY = targetPos.Y + targetHeightPx / 2;

      POINT anchorPoint{targetPos.X, targetPos.Y};
      SIZE windowSize{clientWidthPx, clientHeightPx};

      RECT excludeRect{targetPos.X, targetPos.Y, targetRight, targetBottom};

      UINT flags = 0;

      if (m_directionalHint == DirectionalHint::LeftTopEdge) {
        anchorPoint = {targetPos.X, targetPos.Y};
        flags = TPM_RIGHTALIGN | TPM_TOPALIGN | TPM_HORIZONTAL;
      } else if (m_directionalHint == DirectionalHint::LeftCenter) {
        anchorPoint = {targetPos.X, targetCenterY};
        flags = TPM_RIGHTALIGN | TPM_VCENTERALIGN | TPM_HORIZONTAL;
      } else if (m_directionalHint == DirectionalHint::LeftBottomEdge) {
        anchorPoint = {targetPos.X, targetBottom};
        flags = TPM_RIGHTALIGN | TPM_BOTTOMALIGN | TPM_HORIZONTAL;
      } else if (m_directionalHint == DirectionalHint::TopLeftEdge) {
        anchorPoint = {targetPos.X, targetPos.Y};
        flags = TPM_LEFTALIGN | TPM_BOTTOMALIGN | TPM_VERTICAL;
      } else if (m_directionalHint == DirectionalHint::TopAutoEdge) {
        anchorPoint = {targetPos.X, targetPos.Y};
        flags = TPM_LEFTALIGN | TPM_BOTTOMALIGN | TPM_VERTICAL;
      } else if (m_directionalHint == DirectionalHint::TopCenter) {
        anchorPoint = {targetCenterX, targetPos.Y};
        flags = TPM_CENTERALIGN | TPM_BOTTOMALIGN | TPM_VERTICAL;
      } else if (m_directionalHint == DirectionalHint::TopRightEdge) {
        anchorPoint = {targetRight, targetPos.Y};
        flags = TPM_RIGHTALIGN | TPM_BOTTOMALIGN | TPM_VERTICAL;
      } else if (m_directionalHint == DirectionalHint::RightTopEdge) {
        anchorPoint = {targetRight, targetPos.Y};
        flags = TPM_LEFTALIGN | TPM_TOPALIGN | TPM_HORIZONTAL;
      } else if (m_directionalHint == DirectionalHint::RightCenter) {
        anchorPoint = {targetRight, targetCenterY};
        flags = TPM_LEFTALIGN | TPM_VCENTERALIGN | TPM_HORIZONTAL;
      } else if (m_directionalHint == DirectionalHint::RightBottomEdge) {
        anchorPoint = {targetRight, targetBottom};
        flags = TPM_LEFTALIGN | TPM_BOTTOMALIGN | TPM_HORIZONTAL;
      } else if (m_directionalHint == DirectionalHint::BottomLeftEdge) {
        anchorPoint = {targetPos.X, targetBottom};
        flags = TPM_LEFTALIGN | TPM_TOPALIGN | TPM_VERTICAL;
      } else if (m_directionalHint == DirectionalHint::BottomAutoEdge) {
        anchorPoint = {targetPos.X, targetBottom};
        flags = TPM_LEFTALIGN | TPM_TOPALIGN | TPM_VERTICAL;
      } else if (m_directionalHint == DirectionalHint::BottomCenter) {
        anchorPoint = {targetCenterX, targetBottom};
        flags = TPM_CENTERALIGN | TPM_TOPALIGN | TPM_VERTICAL;
      } else if (m_directionalHint == DirectionalHint::BottomRightEdge) {
        anchorPoint = {targetRight, targetBottom};
        flags = TPM_RIGHTALIGN | TPM_TOPALIGN | TPM_VERTICAL;
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
  bool m_ready{false};
  bool m_shown{false};
  bool m_closed{false};
  bool m_initialFocusSuperseded{false};
  uint64_t m_lifetime{0};
  std::string m_generation;
  int64_t m_anchorTag{0};
  HWND m_parentHwnd{nullptr};
  winrt::weak_ref<winrt::Microsoft::ReactNative::Composition::PortalComponentView> m_portal;
  winrt::weak_ref<winrt::Microsoft::ReactNative::Composition::RootComponentView> m_parentRoot;
  winrt::weak_ref<winrt::Microsoft::ReactNative::ComponentView> m_content;
  winrt::weak_ref<winrt::Microsoft::ReactNative::ComponentView> m_anchor;
  winrt::weak_ref<winrt::Microsoft::ReactNative::ComponentView> m_openingFocus;
  winrt::Microsoft::UI::Input::InputKeyboardSource m_keyboardSource{nullptr};
  winrt::event_token m_keyDownToken{};
  winrt::event_token m_anchorUnmountedToken{};
  winrt::Microsoft::UI::Input::InputPointerSource m_pointerSource{nullptr};
  winrt::event_token m_pointerPressedToken{};
  winrt::Microsoft::UI::Input::InputLightDismissAction m_lightDismiss{nullptr};
  winrt::event_token m_lightDismissToken{};
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