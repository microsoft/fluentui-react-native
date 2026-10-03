#pragma once

#include <ComponentView.Experimental.interop.h>

namespace FRNNativeCore {
namespace rn = winrt::Microsoft::ReactNative;
namespace comp = winrt::Microsoft::ReactNative::Composition;

inline rn::ComponentView FindDescendant(const rn::ComponentView &root, int64_t tag) noexcept {
  for (const auto &child : root.Children()) {
    if (child.Tag() == tag) return child;
    if (auto found = FindDescendant(child, tag)) return found;
  }
  return nullptr;
}

inline bool Eligible(const rn::ComponentView &view) noexcept {
  if (!view) return false;
  auto eligible = comp::FocusManager::FindFirstFocusableElement(view);
  return eligible && eligible.Tag() == view.Tag();
}

inline std::string FocusWithin(
    const rn::ComponentView &container, int64_t tag,
    const std::string &strategy, int64_t defaultTag = 0, HWND allowedOwner = nullptr) noexcept {
  if (!container) return "not-mounted";
  auto root = container.as<comp::ComponentView>().Root();
  if (!root) return "not-ready";
  auto hwnd = container.as<::Microsoft::ReactNative::Composition::Experimental::IComponentViewInterop>()->GetHwndForParenting();
  auto foreground = ::GetForegroundWindow();
  if (!foreground || (::GetAncestor(hwnd, GA_ROOT) != foreground &&
                      (!allowedOwner || ::GetAncestor(allowedOwner, GA_ROOT) != foreground))) return "inactive-window";

  rn::ComponentView target{nullptr};
  if (strategy == "target") target = FindDescendant(container, tag);
  else if (strategy == "default" && defaultTag) {
    target = FindDescendant(container, defaultTag);
    if (!target) return "not-mounted";
  }
  else if (strategy != "default" && strategy != "first" && strategy != "last") return "unsupported";
  if (!target && strategy != "target") {
    target = strategy == "last" ? comp::FocusManager::FindLastFocusableElement(container)
                                : comp::FocusManager::FindFirstFocusableElement(container);
    if (target && target.Tag() == container.Tag()) target = nullptr;
  }
  if (!target) return "not-mounted";
  if (!Eligible(target)) return "not-focusable";
  if (!target.TryFocus(rn::FocusState::Programmatic)) return "refused";
  auto focused = root.GetFocusedComponent();
  return focused && focused.Tag() == target.Tag() ? "confirmed" : "refused";
}
}
