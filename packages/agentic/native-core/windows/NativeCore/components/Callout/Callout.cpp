// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
#include "pch.h"

#include "Callout.h"
#include "../../shared/FocusRequest.h"
#include "../../shared/FocusTree.h"

#include <winrt/Microsoft.UI.Content.h>
#include <winrt/Microsoft.UI.Input.h>
#include <winrt/Microsoft.UI.Windowing.h>
#include <winrt/Microsoft.UI.interop.h>
#include <winrt/Windows.System.h>

#include <dwmapi.h>

#include <algorithm>
#include <functional>
#include <string_view>
#include <unordered_map>
#include <utility>
#include <vector>

namespace winrt::FluentUI::Callout {

// How long a light dismissal over the live view anchor waits for the owner to route that press to the anchor.
constexpr UINT kAnchorPressRoutingMs = 250;

// Runs a callback on the UI thread after a delay, without a window to own the timer.
class ThreadTimer {
 public:
  static void Run(UINT delayMs, std::function<void()> callback) noexcept {
    const auto id = ::SetTimer(nullptr, 0, delayMs, &TimerProc);
    if (!id) {
      callback();
      return;
    }
    Callbacks().emplace(id, std::move(callback));
  }

 private:
  static std::unordered_map<UINT_PTR, std::function<void()>> &Callbacks() noexcept {
    thread_local std::unordered_map<UINT_PTR, std::function<void()>> callbacks;
    return callbacks;
  }

  static void CALLBACK TimerProc(HWND, UINT, UINT_PTR id, DWORD) noexcept {
    ::KillTimer(nullptr, id);
    auto &callbacks = Callbacks();
    const auto found = callbacks.find(id);
    if (found == callbacks.end()) return;
    auto callback = std::move(found->second);
    callbacks.erase(found);
    callback();
  }
};

// Observes thread input for shown popups, like the macOS local mouse monitor and CalloutWindow.sendEvent. It reports
// pointer-down input outside a popup's owner family, since InputLightDismissAction only reports outside input while
// the popup island has focus. It also offers Tab key-downs to the popups before the focused island handles them, since
// a FocusZone in the popup can consume Tab. A UI-thread message hook exists only while a Callout on that thread is
// shown, and each Callout registers only while it is shown.
class PopupInputMonitor {
 public:
  static uint64_t Add(HWND popup, std::function<void()> onOutside, std::function<bool(bool backward)> onTab) noexcept {
    auto &state = State();
    const auto id = ++state.nextId;
    state.entries.push_back({id, popup, std::move(onOutside), std::move(onTab)});
    if (!state.hook) state.hook = ::SetWindowsHookExW(WH_GETMESSAGE, &HookProc, nullptr, ::GetCurrentThreadId());
    return id;
  }

  static void Remove(uint64_t id) noexcept {
    if (!id) return;
    auto &state = State();
    state.entries.erase(
        std::remove_if(state.entries.begin(), state.entries.end(), [id](const Entry &entry) { return entry.id == id; }),
        state.entries.end());
    if (state.entries.empty() && state.hook) {
      ::UnhookWindowsHookEx(state.hook);
      state.hook = nullptr;
    }
  }

 private:
  struct Entry {
    uint64_t id;
    HWND popup;
    std::function<void()> onOutside;
    std::function<bool(bool backward)> onTab;
  };
  struct ThreadState {
    HHOOK hook{nullptr};
    uint64_t nextId{0};
    std::vector<Entry> entries;
  };

  static ThreadState &State() noexcept {
    thread_local ThreadState state;
    return state;
  }

  static bool IsPointerDown(UINT message) noexcept {
    switch (message) {
      case WM_LBUTTONDOWN:
      case WM_RBUTTONDOWN:
      case WM_MBUTTONDOWN:
      case WM_XBUTTONDOWN:
      case WM_NCLBUTTONDOWN:
      case WM_NCRBUTTONDOWN:
      case WM_NCMBUTTONDOWN:
      case WM_NCXBUTTONDOWN:
      case WM_POINTERDOWN:
      case WM_NCPOINTERDOWN:
        return true;
      default:
        return false;
    }
  }

  // A popup family is the chain of owned popups below the unowned application window, so input in a nested popup
  // does not dismiss the popups that own it. Input in an owning popup's island still dismisses its nested popups.
  static bool InFamily(HWND popup, HWND window) noexcept {
    HWND familyRoot = popup;
    for (HWND owner = ::GetWindow(familyRoot, GW_OWNER); owner && ::GetWindow(owner, GW_OWNER);
         owner = ::GetWindow(owner, GW_OWNER)) {
      familyRoot = owner;
    }
    for (HWND current = ::GetAncestor(window, GA_ROOT); current; current = ::GetWindow(current, GW_OWNER)) {
      if (current == familyRoot) return true;
    }
    return false;
  }

  static bool IsKeyDown(int key) noexcept { return (::GetKeyState(key) & 0x8000) != 0; }

  static LRESULT CALLBACK HookProc(int code, WPARAM wParam, LPARAM lParam) noexcept {
    if (code == HC_ACTION && wParam == PM_REMOVE) {
      auto &message = *reinterpret_cast<MSG *>(lParam);
      if (message.hwnd && IsPointerDown(message.message)) {
        std::vector<std::function<void()>> outside;
        for (const auto &entry : State().entries) {
          if (!InFamily(entry.popup, message.hwnd)) outside.push_back(entry.onOutside);
        }
        for (const auto &onOutside : outside) onOutside();
      } else if (message.message == WM_KEYDOWN && message.wParam == VK_TAB && !IsKeyDown(VK_CONTROL) &&
                 !IsKeyDown(VK_MENU)) {
        std::vector<std::function<bool(bool)>> handlers;
        for (const auto &entry : State().entries) handlers.push_back(entry.onTab);
        const bool backward = IsKeyDown(VK_SHIFT);
        for (const auto &onTab : handlers) {
          // A handled Tab never reaches the island, and no character message is translated from it.
          if (onTab && onTab(backward)) {
            message.message = WM_NULL;
            break;
          }
        }
      }
    }
    return ::CallNextHookEx(nullptr, code, wParam, lParam);
  }
};

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
  ~CalloutComponentView() { ReleasePopup(); }

  void UpdateProps(const winrt::Microsoft::ReactNative::ComponentView &view,
                   const winrt::com_ptr<Codegen::CalloutProps> &newProps,
                   const winrt::com_ptr<Codegen::CalloutProps>
                       &oldProps) noexcept override {
    const auto generation = newProps->commandGeneration.value_or(0);
    if (!oldProps || generation != oldProps->commandGeneration.value_or(0)) {
      m_closed = false;
      m_ready = false;
    }
    if (!oldProps || newProps->directionalHint != oldProps->directionalHint) {
      m_directionalHint =
          newProps->directionalHint
              ? parseDirectionHint(newProps->directionalHint.value())
              : DirectionalHint::LeftTopEdge;
    }

    __super::UpdateProps(view, newProps, oldProps);
    if (auto portal = m_portal.get(); portal && portal.ContentRoot().Children().Size()) {
      AdjustWindowSize(portal.ContentRoot().Children().GetAt(0).LayoutMetrics());
    }
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
    // Escape bubbles from focused popup content to the portal root; macOS dismisses through cancelOperation.
    portalComponentView.ContentRoot().KeyDown(
        [wkThis = get_weak()](
            const winrt::Windows::Foundation::IInspectable & /*sender*/,
            const winrt::Microsoft::ReactNative::Composition::Input::KeyRoutedEventArgs &args) noexcept {
          if (args.Handled() || args.Key() != winrt::Windows::System::VirtualKey::Escape) return;
          if (auto strongThis = wkThis.get()) {
            if (!strongThis->m_shown || strongThis->PreventsDismiss("preventDismissOnKeyDown")) return;
            args.Handled(true);
            strongThis->DismissPresentation("escape");
          }
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

  void HandleRequestFocusCommand(
      int32_t generation, int32_t requestId, int32_t targetTag, std::string strategy) noexcept override {
    auto status = OperationStatus(generation);
    auto portal = m_portal.get();
    if (status.empty() && !portal) status = "not-mounted";
    if (status.empty()) {
      // Focusing a component also moves keyboard focus into the popup island.
      status = ::FRNNativeCore::FocusWithin(portal.ContentRoot(), targetTag, strategy);
    }
    EmitResult(generation, requestId, status);
  }
  void HandleCloseCommand(int32_t generation, int32_t requestId) noexcept override {
    auto status = OperationStatus(generation);
    if (status.empty() && !m_shown) status = "not-ready";
    if (!status.empty()) { EmitResult(generation, requestId, status); return; }
    DismissPresentation("programmatic", requestId);
  }
  void HandleRepositionCommand(int32_t generation, int32_t requestId) noexcept override {
    auto status = OperationStatus(generation);
    if (status.empty()) {
      auto portal = m_portal.get();
      if (portal && portal.ContentRoot().Children().Size()) AdjustWindowSize(portal.ContentRoot().Children().GetAt(0).LayoutMetrics());
      status = m_positioned ? "confirmed" : "not-ready";
    }
    EmitResult(generation, requestId, status);
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
    m_childLayoutMetricsToken = {};
  }

private:
  bool Modern() const noexcept { return Props() && Props()->commandGeneration.value_or(0) > 0; }
  std::string OperationStatus(int32_t generation) const noexcept {
    if (!Props() || generation <= 0 || Props()->commandGeneration.value_or(0) != generation) return "stale";
    if (!m_mounted || !m_ready || m_closed) return "not-ready";
    return {};
  }
  void EmitResult(int32_t generation, int32_t requestId, const std::string &status) noexcept {
    if (auto emitter = EventEmitter()) emitter->onOperationResult({generation, requestId, status});
  }
  // Hides a shown presentation and reports that transition once. Modern views also latch their generation closed.
  void DismissPresentation(const std::string &reason, int32_t requestId = 0) noexcept {
    if (!m_shown) return;
    const bool hadFocus = FamilyHasFocus();
    m_shown = false;
    Unregister();
    StopWatchingOutsidePointer();
    // Like AppKit child windows, presentations nested in this popup close first and keep their own reason.
    DismissNestedPresentations();
    if (m_popup && m_popup.IsVisible()) m_popup.Hide();
    // Like AppKit's owner-window key restoration, return keyboard focus to the owner island so its retained focused
    // component regains input. Input that already moved elsewhere is not overridden.
    if (hadFocus && m_ownerIsland) {
      winrt::Microsoft::UI::Input::InputFocusController::GetForIsland(m_ownerIsland).TrySetFocus();
    }
    const auto generation = Props() ? Props()->commandGeneration.value_or(0) : 0;
    const bool modern = Modern();
    if (modern) {
      m_closed = true;
      m_ready = false;
    }
    if (requestId) EmitResult(generation, requestId, "confirmed");
    if (auto emitter = EventEmitter()) {
      if (modern) emitter->onClosed({generation, reason});
      emitter->onDismiss({});
    }
  }

  void
  OnMounted(const winrt::Microsoft::ReactNative::ComponentView &view) noexcept {
    assert(!m_mounted);
    m_mounted = true;
    const auto lifetime = ++m_lifetime;

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
    assert(m_mounted);
    // A detached host cannot keep a visible popup. Each mount owns a fresh popup, window, and dismissal subscription.
    DismissPresentation("host-detached");
    m_mounted = false;
    ++m_lifetime;
    ReleasePopup();
  }

  void OnLightDismissDismissed(
      const winrt::Microsoft::UI::Input::InputLightDismissAction &,
      const winrt::Microsoft::UI::Input::InputLightDismissEventArgs &) {
    if (!m_shown || PreventsDismiss("preventDismissOnClickOutside")) return;
    if (HasShownDescendant()) {
      // A press in a nested popup, or focus moving into one, also reports light dismissal for its owners. Decide once
      // the input is routed: the family stays open while one of its islands has focus or the press landed in it.
      const bool pressInNested = IsCursorOnDescendant();
      const auto presentation = m_presentation;
      m_reactContext.UIDispatcher().Post([wkThis = get_weak(), presentation, pressInNested]() {
        auto strongThis = wkThis.get();
        if (!strongThis || !strongThis->m_shown || strongThis->m_presentation != presentation) return;
        if (strongThis->FamilyHasFocus() ||
            (pressInNested && ::FRNNativeCore::WindowActive(strongThis->PopupHwnd()))) {
          return;
        }
        if (!strongThis->PreventsDismiss("preventDismissOnClickOutside")) {
          strongThis->DismissPresentation("native-light-dismiss");
        }
      });
      return;
    }
    if (!IsCursorOnViewAnchor()) {
      DismissPresentation("native-light-dismiss");
      return;
    }
    // Light dismissal reports a press on the owner before the owner routes it. A press on the live view anchor belongs
    // to the anchor's owner, so a trigger toggles its popup instead of having the popup closed and then reopened by
    // the same press. The popup still closes if the anchor never receives a press.
    const auto presentation = m_presentation;
    m_anchorPressed = false;
    ThreadTimer::Run(kAnchorPressRoutingMs, [wkThis = get_weak(), presentation]() {
      auto strongThis = wkThis.get();
      if (!strongThis || strongThis->m_presentation != presentation || strongThis->m_anchorPressed) return;
      if (!strongThis->PreventsDismiss("preventDismissOnClickOutside")) {
        strongThis->DismissPresentation("native-light-dismiss");
      }
    });
  }

  // Shown presentations on this UI thread. A presentation registers while shown, and its destructor releases it.
  static std::vector<CalloutComponentView *> &ShownCallouts() noexcept {
    thread_local std::vector<CalloutComponentView *> shown;
    return shown;
  }
  void Register() noexcept {
    auto &shown = ShownCallouts();
    if (std::find(shown.begin(), shown.end(), this) == shown.end()) shown.push_back(this);
  }
  void Unregister() noexcept {
    auto &shown = ShownCallouts();
    shown.erase(std::remove(shown.begin(), shown.end(), this), shown.end());
  }

  winrt::Microsoft::UI::Content::ContentIsland Island() const noexcept {
    return m_rnWindow ? m_rnWindow.ReactNativeIsland().Island() : nullptr;
  }
  HWND PopupHwnd() const noexcept {
    return m_popup ? winrt::Microsoft::UI::GetWindowFromWindowId(m_popup.WindowId()) : nullptr;
  }
  static bool IslandHasFocus(const winrt::Microsoft::UI::Content::ContentIsland &island) noexcept {
    return island && winrt::Microsoft::UI::Input::InputFocusController::GetForIsland(island).HasFocus();
  }

  // The shown presentation whose popup content hosts this presentation's anchor, as for a submenu.
  CalloutComponentView *OwnerPresentation() const noexcept {
    if (!m_ownerIsland) return nullptr;
    for (auto *view : ShownCallouts()) {
      if (view != this && view->Island() == m_ownerIsland) return view;
    }
    return nullptr;
  }
  bool IsNestedIn(const CalloutComponentView *ancestor) const noexcept {
    auto remaining = ShownCallouts().size();
    for (auto *owner = OwnerPresentation(); owner && remaining; owner = owner->OwnerPresentation(), --remaining) {
      if (owner == ancestor) return true;
    }
    return false;
  }
  std::vector<CalloutComponentView *> ShownDescendants() const noexcept {
    std::vector<CalloutComponentView *> descendants;
    for (auto *view : ShownCallouts()) {
      if (view != this && view->IsNestedIn(this)) descendants.push_back(view);
    }
    return descendants;
  }
  bool HasShownDescendant() const noexcept { return !ShownDescendants().empty(); }
  bool FamilyHasFocus() const noexcept {
    if (IslandHasFocus(Island())) return true;
    for (auto *view : ShownDescendants()) {
      if (IslandHasFocus(view->Island())) return true;
    }
    return false;
  }
  bool IsCursorOnDescendant() const noexcept {
    POINT cursor{};
    if (!::GetCursorPos(&cursor)) return false;
    for (auto *view : ShownDescendants()) {
      RECT bounds{};
      if (const auto hwnd = view->PopupHwnd(); hwnd && ::GetWindowRect(hwnd, &bounds) && ::PtInRect(&bounds, cursor)) {
        return true;
      }
    }
    return false;
  }
  void DismissNestedPresentations() noexcept {
    const auto island = Island();
    if (!island) return;
    std::vector<winrt::com_ptr<CalloutComponentView>> nested;
    for (auto *view : ShownCallouts()) {
      if (view != this && view->m_ownerIsland == island) nested.push_back(view->get_strong());
    }
    for (const auto &view : nested) view->DismissPresentation("native-light-dismiss");
  }

  bool ExitsByTab() const noexcept {
    return m_shown && Modern() && Props()->tabNavigation.value_or("cycle") != "cycle";
  }

  // Tab in the focused popup of a presentation that exits by Tab belongs to the outermost presentation in its owner
  // chain that also exits by Tab, like macOS calloutHandlesTab. The exit runs after the key message returns.
  bool HandleTab(bool backward) noexcept {
    if (!ExitsByTab() || !IslandHasFocus(Island())) return false;
    CalloutComponentView *exit = this;
    auto remaining = ShownCallouts().size();
    for (auto *owner = OwnerPresentation(); owner && owner->ExitsByTab() && remaining;
         owner = owner->OwnerPresentation(), --remaining) {
      exit = owner;
    }
    const auto presentation = exit->m_presentation;
    m_reactContext.UIDispatcher().Post([wkExit = exit->get_weak(), presentation, backward]() {
      if (auto strongExit = wkExit.get(); strongExit && strongExit->m_shown && strongExit->m_presentation == presentation) {
        strongExit->ExitByTab(backward);
      }
    });
    return true;
  }

  // Continuation treats the popup as inserted after its view anchor in the owner's Tab order.
  void ExitByTab(bool backward) noexcept {
    const bool continues = Props()->tabNavigation.value_or("cycle") == "continue";
    const auto anchor = continues ? ViewAnchor() : nullptr;
    DismissPresentation(backward ? "tab-backward" : "tab-forward");
    if (!anchor) return;
    if (backward) {
      if (::FRNNativeCore::Eligible(anchor)) anchor.TryFocus(winrt::Microsoft::ReactNative::FocusState::Keyboard);
      return;
    }
    if (::FRNNativeCore::FocusOutside(anchor, true)) return;
    if (auto root = anchor.as<winrt::Microsoft::ReactNative::Composition::ComponentView>().Root()) {
      if (auto first = winrt::Microsoft::ReactNative::Composition::FocusManager::FindFirstFocusableElement(root)) {
        first.TryFocus(winrt::Microsoft::ReactNative::FocusState::Keyboard);
      }
    }
  }

  bool PreventsDismiss(std::string_view behavior) const noexcept {
    const auto &props = Props();
    if (!props || !props->dismissBehaviors) return false;
    const auto &behaviors = *props->dismissBehaviors;
    return std::find(behaviors.begin(), behaviors.end(), behavior) != behaviors.end();
  }

  void CreatePopup(
      const winrt::Microsoft::ReactNative::ComponentView &view) noexcept {
    if (m_popup)
      return;

    auto portal = view.as<
        winrt::Microsoft::ReactNative::Composition::PortalComponentView>();
    m_ownerIsland = portal.Parent()
                        .as<winrt::Microsoft::ReactNative::Composition::ComponentView>()
                        .Root()
                        .ReactNativeIsland()
                        .Island();
    m_popup = winrt::Microsoft::UI::Content::DesktopPopupSiteBridge::Create(m_ownerIsland);

    assert(!m_rnWindow);
    m_rnWindow = winrt::Microsoft::ReactNative::ReactNativeWindow::
        CreateFromContentSiteBridgeAndIsland(
            m_popup,
            winrt::Microsoft::ReactNative::ReactNativeIsland::CreatePortal(
                portal));
    m_rnWindow.ResizePolicy(
        winrt::Microsoft::ReactNative::ContentSizePolicy::None);
    if (Modern()) ApplyModernWindowAppearance();

    // InputLightDismissAction does not support weak references, so it cannot use an auto_revoke revoker.
    m_lightDismiss = winrt::Microsoft::UI::Input::InputLightDismissAction::GetForWindowId(m_rnWindow.AppWindow().Id());
    m_lightDismissToken = m_lightDismiss.Dismissed({get_weak(), &CalloutComponentView::OnLightDismissDismissed});

    if (portal.ContentRoot().Children().Size()) {
      AdjustWindowSize(
          portal.ContentRoot().Children().GetAt(0).LayoutMetrics());
    }
  }

  // Modern presentations draw no window backdrop: the popup bridge composes the content island over a transparent
  // window. DWM rounds the window and gives it the platform popup shadow.
  void ApplyModernWindowAppearance() noexcept {
    const auto hwnd = winrt::Microsoft::UI::GetWindowFromWindowId(m_popup.WindowId());
    const DWM_WINDOW_CORNER_PREFERENCE corner = DWMWCP_ROUND;
    ::DwmSetWindowAttribute(hwnd, DWMWA_WINDOW_CORNER_PREFERENCE, &corner, sizeof(corner));
    // The content View draws the visible stroke; DWM keeps only the shadow.
    const COLORREF border = DWMWA_COLOR_NONE;
    ::DwmSetWindowAttribute(hwnd, DWMWA_BORDER_COLOR, &border, sizeof(border));
  }

  void ReleasePopup() noexcept {
    Unregister();
    StopWatchingOutsidePointer();
    if (m_lightDismiss) {
      m_lightDismiss.Dismissed(m_lightDismissToken);
      m_lightDismiss = nullptr;
      m_lightDismissToken = {};
    }
    if (m_popup && !m_popup.IsClosed()) {
      if (m_popup.IsVisible()) m_popup.Hide();
      if (m_rnWindow && m_rnWindow.AppWindow()) m_rnWindow.Close();
      m_popup.Close();
    }
    m_rnWindow = nullptr;
    m_popup = nullptr;
    m_ownerIsland = nullptr;
    m_shown = false;
    m_positioned = false;
  }

  void Show() noexcept {
    if (!m_popup || m_shown) return;
    if (Modern() && (m_closed || !m_positioned)) return;
    m_popup.Show();
    m_shown = true;
    Register();
    m_anchorPressed = false;
    WatchOutsidePointer(++m_presentation);

    if (!Modern()) {
      winrt::Microsoft::UI::Input::InputFocusController::GetForIsland(
        m_rnWindow.ReactNativeIsland().Island())
        .TrySetFocus();
      m_rnWindow.ReactNativeIsland().NavigateFocus(
        winrt::Microsoft::ReactNative::FocusNavigationRequest::
            FocusNavigationRequest(
                winrt::Microsoft::ReactNative::FocusNavigationReason::First));
    }

    if (auto eventEmitter = EventEmitter()) {
      eventEmitter->onShow({});
      if (Modern() && !m_ready) {
        m_ready = true;
        eventEmitter->onReady({Props()->commandGeneration.value_or(0)});
      }
    }
  }

  // Outside input dismisses the presentation shown at the time of the input. Owner-island client input arrives through
  // the island's pointer source; other windows, including the owner's non-client area, arrive through the hook.
  void WatchOutsidePointer(uint64_t presentation) noexcept {
    auto dismiss = [wkThis = get_weak(), presentation, dispatcher = m_reactContext.UIDispatcher()]() {
      // Dismiss after the input notification returns; the input itself is still delivered to its target.
      dispatcher.Post([wkThis, presentation]() {
        if (auto strongThis = wkThis.get(); strongThis && strongThis->m_presentation == presentation) {
          if (!strongThis->PreventsDismiss("preventDismissOnClickOutside")) {
            strongThis->DismissPresentation("outside-pointer");
          }
        }
      });
    };
    auto onTab = [wkThis = get_weak()](bool backward) {
      auto strongThis = wkThis.get();
      return strongThis && strongThis->HandleTab(backward);
    };
    m_outsidePointer = PopupInputMonitor::Add(PopupHwnd(), dismiss, onTab);
    if (m_ownerIsland) {
      m_ownerPointerSource = winrt::Microsoft::UI::Input::InputPointerSource::GetForIsland(m_ownerIsland);
      m_ownerPointerToken = m_ownerPointerSource.PointerPressed([wkThis = get_weak(), dismiss](const auto &, const auto &) {
        if (auto strongThis = wkThis.get(); strongThis && strongThis->IsCursorOnViewAnchor()) return;
        dismiss();
      });
    }
    // RNW routes a press to the anchor from any of its descendants.
    if (auto anchor = ViewAnchor()) {
      m_anchorPointerPressed = anchor.PointerPressed(winrt::auto_revoke, [wkThis = get_weak(), presentation](const auto &, const auto &) {
        if (auto strongThis = wkThis.get(); strongThis && strongThis->m_presentation == presentation) {
          strongThis->m_anchorPressed = true;
        }
      });
    }
  }

  winrt::Microsoft::ReactNative::ComponentView ViewAnchor() const noexcept {
    if (!Modern() || Props()->anchorMode.value_or("legacy") != "view" ||
        Props()->target.Type() != winrt::Microsoft::ReactNative::JSValueType::Int64) {
      return nullptr;
    }
    return winrt::Microsoft::ReactNative::Composition::CompositionUIService::ComponentFromReactTag(
        m_reactContext.Handle(), Props()->target.AsInt64());
  }

  // Whether the pointer is over a modern presentation's live view anchor, tested where the anchor is now.
  bool IsCursorOnViewAnchor() const noexcept {
    const auto anchor = ViewAnchor();
    POINT cursor{};
    if (!anchor || !::GetCursorPos(&cursor)) return false;
    const auto origin = ViewToScreenOffset(anchor);
    const auto metrics = anchor.LayoutMetrics();
    const RECT bounds{
        origin.X,
        origin.Y,
        origin.X + static_cast<LONG>(std::lround(metrics.Frame.Width * metrics.PointScaleFactor)),
        origin.Y + static_cast<LONG>(std::lround(metrics.Frame.Height * metrics.PointScaleFactor))};
    return ::PtInRect(&bounds, cursor) != FALSE;
  }

  void StopWatchingOutsidePointer() noexcept {
    PopupInputMonitor::Remove(std::exchange(m_outsidePointer, 0));
    m_anchorPointerPressed.revoke();
    if (m_ownerPointerSource) {
      m_ownerPointerSource.PointerPressed(m_ownerPointerToken);
      m_ownerPointerSource = nullptr;
      m_ownerPointerToken = {};
    }
  }

  void AdjustWindowSize(const winrt::Microsoft::ReactNative::LayoutMetrics
                            &layoutMetrics) noexcept {
    m_positioned = false;
    if (!m_rnWindow || !Props()) {
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
      if (!targetView) {
        if (Modern()) DismissPresentation("anchor-lost");
        return;
      }
      auto targetPos = ViewToScreenOffset(targetView);
      auto targetScaleFactor =
          targetView.LayoutMetrics().PointScaleFactor;
      auto targetWidthPx = static_cast<int32_t>(
          targetView.LayoutMetrics().Frame.Width * targetScaleFactor);
      auto targetHeightPx = static_cast<int32_t>(
          targetView.LayoutMetrics().Frame.Height * targetScaleFactor);
      const auto anchorMode = Props()->anchorMode.value_or("legacy");
      if (anchorMode == "rect" || anchorMode == "point") {
        if (!Props()->anchorRect) { DismissPresentation("anchor-lost"); return; }
        const auto &rect = Props()->anchorRect.value();
        targetPos.X += static_cast<int32_t>(std::lround(rect.screenX * targetScaleFactor));
        targetPos.Y += static_cast<int32_t>(std::lround(rect.screenY * targetScaleFactor));
        targetWidthPx = static_cast<int32_t>(std::lround(rect.width * targetScaleFactor));
        targetHeightPx = static_cast<int32_t>(std::lround(rect.height * targetScaleFactor));
      }
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
      const auto gap = static_cast<int32_t>(Props()->gapSpace.value_or(0) * targetScaleFactor);
      if (m_directionalHint == DirectionalHint::LeftTopEdge || m_directionalHint == DirectionalHint::LeftCenter || m_directionalHint == DirectionalHint::LeftBottomEdge) anchorPoint.x -= gap;
      else if (m_directionalHint == DirectionalHint::RightTopEdge || m_directionalHint == DirectionalHint::RightCenter || m_directionalHint == DirectionalHint::RightBottomEdge) anchorPoint.x += gap;
      else if (m_directionalHint == DirectionalHint::TopLeftEdge || m_directionalHint == DirectionalHint::TopAutoEdge || m_directionalHint == DirectionalHint::TopCenter || m_directionalHint == DirectionalHint::TopRightEdge) anchorPoint.y -= gap;
      else anchorPoint.y += gap;
      // Expand the excluded anchor along the placement axis so a work-area flip keeps the same gap.
      if (flags & TPM_VERTICAL) {
        excludeRect.top -= gap;
        excludeRect.bottom += gap;
      } else {
        excludeRect.left -= gap;
        excludeRect.right += gap;
      }

      RECT finalPos;

      if (!CalculatePopupWindowPosition(&anchorPoint, &windowSize, flags, &excludeRect, &finalPos)) return;

      m_rnWindow.AppWindow().Move({finalPos.left, finalPos.top});
      m_positioned = true;
      if (Modern() && m_mounted && !m_showQueued && !m_closed && !m_shown) Show();
    } else {
      if (Modern()) return;
      m_rnWindow.AppWindow().Move({0, 0});
    }
  };

  winrt::Windows::Graphics::PointInt32
  ViewToScreenOffset(const winrt::Microsoft::ReactNative::ComponentView &view) const {
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
  bool m_positioned{false};
  bool m_shown{false};
  uint64_t m_presentation{0};
  bool m_anchorPressed{false};
  winrt::Microsoft::ReactNative::ComponentView::PointerPressed_revoker m_anchorPointerPressed;
  uint64_t m_outsidePointer{0};
  winrt::Microsoft::UI::Input::InputPointerSource m_ownerPointerSource{nullptr};
  winrt::event_token m_ownerPointerToken;
  bool m_ready{false};
  bool m_closed{false};
  uint64_t m_lifetime{0};
  winrt::weak_ref<winrt::Microsoft::ReactNative::Composition::PortalComponentView> m_portal;
  winrt::Microsoft::UI::Input::InputLightDismissAction m_lightDismiss{nullptr};
  winrt::event_token m_lightDismissToken;
  winrt::event_token m_childLayoutMetricsToken;
  winrt::Microsoft::UI::Content::DesktopPopupSiteBridge m_popup{nullptr};
  winrt::Microsoft::UI::Content::ContentIsland m_ownerIsland{nullptr};
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