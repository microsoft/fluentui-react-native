#pragma once

namespace FRNNativeCore {
namespace rn = winrt::Microsoft::ReactNative;
namespace comp = winrt::Microsoft::ReactNative::Composition;

// Preorder walks of an island's component tree, which matches its Tab order.

inline int SiblingIndex(const rn::ComponentView &node, const rn::ComponentView &parent) noexcept {
  auto siblings = parent.Children();
  for (uint32_t index = 0; index < siblings.Size(); ++index) {
    if (siblings.GetAt(index).Tag() == node.Tag()) {
      return static_cast<int>(index);
    }
  }
  return -1;
}

inline rn::ComponentView NextSkippingSubtree(const rn::ComponentView &node) noexcept {
  auto current = node;
  while (current) {
    auto parent = current.Parent();
    if (!parent) {
      return nullptr;
    }
    auto siblings = parent.Children();
    const int index = SiblingIndex(current, parent);
    if (index >= 0 && static_cast<uint32_t>(index + 1) < siblings.Size()) {
      return siblings.GetAt(index + 1);
    }
    current = parent;
  }
  return nullptr;
}

inline rn::ComponentView PreOrderNext(const rn::ComponentView &node) noexcept {
  auto children = node.Children();
  return children.Size() > 0 ? children.GetAt(0) : NextSkippingSubtree(node);
}

inline rn::ComponentView RightmostDescendant(const rn::ComponentView &node) noexcept {
  auto current = node;
  while (true) {
    auto children = current.Children();
    if (children.Size() == 0) {
      return current;
    }
    current = children.GetAt(children.Size() - 1);
  }
}

inline rn::ComponentView PreOrderPrevious(const rn::ComponentView &node) noexcept {
  auto parent = node.Parent();
  if (!parent) {
    return nullptr;
  }
  const int index = SiblingIndex(node, parent);
  return index <= 0 ? parent : RightmostDescendant(parent.Children().GetAt(index - 1));
}

// Focuses the nearest focusable component after (or before) `view` and its subtree, without wrapping.
inline bool FocusOutside(const rn::ComponentView &view, bool forward) noexcept {
  if (forward) {
    for (auto node = NextSkippingSubtree(view); node; node = PreOrderNext(node)) {
      auto candidate = comp::FocusManager::FindFirstFocusableElement(node);
      if (candidate && candidate.TryFocus(rn::FocusState::Keyboard)) {
        return true;
      }
    }
  } else {
    for (auto node = PreOrderPrevious(view); node; node = PreOrderPrevious(node)) {
      // Reverse preorder already visits descendants. Only focus the node itself,
      // since searching an ancestor's subtree can re-enter `view` or move forward.
      auto candidate = comp::FocusManager::FindFirstFocusableElement(node);
      if (candidate && candidate.Tag() == node.Tag() && candidate.TryFocus(rn::FocusState::Keyboard)) {
        return true;
      }
    }
  }
  return false;
}
}
