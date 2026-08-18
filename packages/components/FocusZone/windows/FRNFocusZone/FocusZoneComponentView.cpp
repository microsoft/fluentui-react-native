#include "pch.h"

#include "FocusZoneComponentView.h"

#ifdef RNW_NEW_ARCH

#include "codegen/react/components/FRNFocusZoneSpec/FocusZone.g.h"

namespace winrt::FRNFocusZone {

namespace winrtComp = winrt::Microsoft::ReactNative::Composition;
namespace winrtInput = winrt::Microsoft::ReactNative::Composition::Input;
namespace winrtRN = winrt::Microsoft::ReactNative;

void CollectFocusableDescendants(
    const winrtRN::ComponentView &view,
    std::vector<winrtRN::ComponentView> &descendants) {
  auto children = view.Children();
  for (uint32_t index = 0; index < children.Size(); ++index) {
    auto child = children.GetAt(index);
    auto firstFocusable = winrtComp::FocusManager::FindFirstFocusableElement(child);
    if (firstFocusable && firstFocusable.Tag() == child.Tag()) {
      descendants.push_back(child);
      continue;
    }
    CollectFocusableDescendants(child, descendants);
  }
}

struct FocusZoneComponentView
    : winrt::implements<FocusZoneComponentView, winrt::Windows::Foundation::IInspectable>,
      FRNFocusZoneCodegen::BaseFocusZone<FocusZoneComponentView> {
  void Initialize(const winrtRN::ComponentView &view) noexcept override {
    m_containerTag = view.Tag();

    view.KeyDown(
        [weakThis = get_weak()](
            const winrt::Windows::Foundation::IInspectable &sender,
            const winrtInput::KeyRoutedEventArgs &args) noexcept {
          if (auto strongThis = weakThis.get()) {
            if (auto componentView = sender.try_as<winrtRN::ComponentView>()) {
              strongThis->HandleKeyDown(componentView, args);
            }
          }
        });

    view.GotFocus(
        [weakThis = get_weak()](
            const winrt::Windows::Foundation::IInspectable &sender,
            const winrtInput::RoutedEventArgs &) noexcept {
          if (auto strongThis = weakThis.get()) {
            if (auto componentView = sender.try_as<winrtRN::ComponentView>()) {
              strongThis->HandleGotFocus(componentView);
            }
          }
        });

    view.GettingFocus(
        [weakThis = get_weak()](
            const winrt::Windows::Foundation::IInspectable &sender,
            const winrtRN::GettingFocusEventArgs &args) noexcept {
          if (auto strongThis = weakThis.get()) {
            if (auto componentView = sender.try_as<winrtRN::ComponentView>()) {
              strongThis->HandleGettingFocus(componentView, args);
            }
          }
        });
  }

 private:
  void HandleKeyDown(const winrtRN::ComponentView &view, const winrtInput::KeyRoutedEventArgs &args) noexcept {
    using winrt::Windows::System::VirtualKey;

    if (Disabled()) {
      return;
    }

    if (args.Key() == VirtualKey::Tab) {
      HandleTabKey(view, args);
      return;
    }

    int direction = 0;
    bool horizontalNavigation = false;
    bool moveToStart = false;
    bool moveToEnd = false;

    switch (args.Key()) {
      case VirtualKey::Down:
        if (!IsVertical()) {
          return;
        }
        direction = 1;
        horizontalNavigation = false;
        break;
      case VirtualKey::Up:
        if (!IsVertical()) {
          return;
        }
        direction = -1;
        horizontalNavigation = false;
        break;
      case VirtualKey::Right:
        if (!IsHorizontal()) {
          return;
        }
        direction = 1;
        horizontalNavigation = true;
        break;
      case VirtualKey::Left:
        if (!IsHorizontal()) {
          return;
        }
        direction = -1;
        horizontalNavigation = true;
        break;
      case VirtualKey::Home:
        moveToStart = true;
        break;
      case VirtualKey::End:
        moveToEnd = true;
        break;
      default:
        return;
    }

    const bool moved =
        Use2DNavigation() && direction != 0
        ? MoveFocus2D(view, direction, horizontalNavigation, ShouldWrap())
        : MoveFocus(view, direction, moveToStart, moveToEnd, ShouldWrap());
    if (moved) {
      args.Handled(true);
    }
  }

  void HandleTabKey(const winrtRN::ComponentView &view, const winrtInput::KeyRoutedEventArgs &args) noexcept {
    const bool forward = (::GetKeyState(VK_SHIFT) & 0x8000) == 0;
    const auto tabNavigation = TabNavigation();

    if (tabNavigation == "Normal") {
      return;
    }

    if (tabNavigation == "NavigateWrap" || tabNavigation == "NavigateStopAtEnds") {
      const bool wrap = tabNavigation == "NavigateWrap";
      MoveFocus(view, forward ? 1 : -1, false, false, wrap);
      args.Handled(true);
      return;
    }

    if (FocusOutsideZone(view, forward)) {
      args.Handled(true);
      return;
    }

    // If the manual island walk cannot find an outside target, place focus at
    // the zone edge and let RNW's default Tab navigation complete the exit.
    m_inTabTrap = true;
    FocusEdgeDescendant(view, !forward);
    m_inTabTrap = false;
  }

  bool MoveFocus(
      const winrtRN::ComponentView &view,
      int direction,
      bool moveToStart,
      bool moveToEnd,
      bool wrap) noexcept {
    std::vector<winrtRN::ComponentView> candidates;
    CollectFocusableDescendants(view, candidates);
    if (candidates.empty()) {
      return false;
    }

    auto root = view.as<winrtComp::ComponentView>().Root();
    int64_t focusedTag = 0;
    int focusedIndex = -1;
    if (root) {
      if (auto focused = root.GetFocusedComponent()) {
        focusedTag = focused.Tag();
        for (int index = 0; index < static_cast<int>(candidates.size()); ++index) {
          if (candidates[index].Tag() == focusedTag) {
            focusedIndex = index;
            break;
          }
        }
      }
    }

    auto tryFocusFrom = [&](int startIndex, int step) noexcept {
      const int count = static_cast<int>(candidates.size());
      for (int offset = 0; offset < count; ++offset) {
        int index = startIndex + step * offset;
        if (wrap) {
          index = ((index % count) + count) % count;
        } else if (index < 0 || index >= count) {
          break;
        }

        if (root) {
          if (auto focused = root.GetFocusedComponent()) {
            if (IsWithinContainer(focused, candidates[index]) ||
                IsWithinContainer(candidates[index], focused) ||
                OverlapsFocusedComponent(view, focused, candidates[index])) {
              continue;
            }
          }
        }

        if (!candidates[index].TryFocus(winrtRN::FocusState::Keyboard)) {
          continue;
        }

        int64_t newFocusedTag = 0;
        if (root) {
          if (auto focused = root.GetFocusedComponent()) {
            newFocusedTag = focused.Tag();
          }
        }
        if (focusedTag != 0 && newFocusedTag == focusedTag) {
          continue;
        }
        return true;
      }
      return false;
    };

    const int count = static_cast<int>(candidates.size());
    if (moveToStart) {
      return tryFocusFrom(0, 1);
    }
    if (moveToEnd) {
      return tryFocusFrom(count - 1, -1);
    }
    if (focusedIndex < 0) {
      return direction > 0 ? tryFocusFrom(0, 1) : tryFocusFrom(count - 1, -1);
    }
    return tryFocusFrom(focusedIndex + direction, direction);
  }

  struct RelativeRect {
    double x;
    double y;
    double width;
    double height;
  };

  static std::optional<RelativeRect> RelativeRectWithin(
      const winrtRN::ComponentView &container,
      const winrtRN::ComponentView &node) noexcept {
    const auto metrics = node.LayoutMetrics();
    RelativeRect rect{
        metrics.Frame.X,
        metrics.Frame.Y,
        metrics.Frame.Width,
        metrics.Frame.Height};

    auto current = node.Parent();
    while (current && current.Tag() != container.Tag()) {
      const auto parentMetrics = current.LayoutMetrics();
      rect.x += parentMetrics.Frame.X;
      rect.y += parentMetrics.Frame.Y;
      current = current.Parent();
    }
    return current ? std::optional<RelativeRect>{rect} : std::nullopt;
  }

  static bool OverlapsFocusedComponent(
      const winrtRN::ComponentView &container,
      const winrtRN::ComponentView &focused,
      const winrtRN::ComponentView &candidate) noexcept {
    const auto focusedRect = RelativeRectWithin(container, focused);
    const auto candidateRect = RelativeRectWithin(container, candidate);
    if (!focusedRect || !candidateRect) {
      return false;
    }

    const double overlapWidth =
        std::min(focusedRect->x + focusedRect->width, candidateRect->x + candidateRect->width) -
        std::max(focusedRect->x, candidateRect->x);
    const double overlapHeight =
        std::min(focusedRect->y + focusedRect->height, candidateRect->y + candidateRect->height) -
        std::max(focusedRect->y, candidateRect->y);
    return overlapWidth > 0.5 && overlapHeight > 0.5;
  }

  bool MoveFocus2D(
      const winrtRN::ComponentView &view,
      int direction,
      bool horizontal,
      bool wrap) noexcept {
    auto root = view.as<winrtComp::ComponentView>().Root();
    if (!root) {
      return false;
    }

    auto focused = root.GetFocusedComponent();
    if (!focused || !IsWithinContainer(view, focused)) {
      return MoveFocus(view, direction, false, false, wrap);
    }

    const auto focusedRect = RelativeRectWithin(view, focused);
    if (!focusedRect) {
      return MoveFocus(view, direction, false, false, wrap);
    }

    const double focusedPrimary =
        horizontal ? focusedRect->x + focusedRect->width / 2 : focusedRect->y + focusedRect->height / 2;
    const double focusedCross =
        horizontal ? focusedRect->y + focusedRect->height / 2 : focusedRect->x + focusedRect->width / 2;

    struct Candidate {
      winrtRN::ComponentView view;
      double primary;
      double cross;
      double distance;
      size_t order;
    };

    std::vector<winrtRN::ComponentView> descendants;
    CollectFocusableDescendants(view, descendants);
    std::vector<Candidate> directionalCandidates;
    std::vector<Candidate> allCandidates;
    allCandidates.reserve(descendants.size());

    for (size_t order = 0; order < descendants.size(); ++order) {
      const auto &candidate = descendants[order];
      if (candidate.Tag() == focused.Tag()) {
        continue;
      }
      const auto rect = RelativeRectWithin(view, candidate);
      if (!rect) {
        continue;
      }

      const double primary = horizontal ? rect->x + rect->width / 2 : rect->y + rect->height / 2;
      const double cross = horizontal ? rect->y + rect->height / 2 : rect->x + rect->width / 2;
      const double primaryDelta = primary - focusedPrimary;
      const double crossDelta = cross - focusedCross;
      Candidate ranked{
          candidate,
          primary,
          cross,
          std::hypot(primaryDelta, crossDelta),
          order};
      allCandidates.push_back(ranked);
      if (direction * primaryDelta > 0.5) {
        directionalCandidates.push_back(ranked);
      }
    }

    auto tryRankedCandidates = [&](std::vector<Candidate> &candidates) noexcept {
      std::sort(candidates.begin(), candidates.end(), [focusedCross](const Candidate &left, const Candidate &right) {
        if (left.distance != right.distance) {
          return left.distance < right.distance;
        }
        const double leftCross = std::abs(left.cross - focusedCross);
        const double rightCross = std::abs(right.cross - focusedCross);
        return leftCross != rightCross ? leftCross < rightCross : left.order < right.order;
      });

      for (const auto &candidate : candidates) {
        if (!candidate.view.TryFocus(winrtRN::FocusState::Keyboard)) {
          continue;
        }
        if (auto newlyFocused = root.GetFocusedComponent(); newlyFocused && newlyFocused.Tag() != focused.Tag()) {
          return true;
        }
      }
      return false;
    };

    if (tryRankedCandidates(directionalCandidates)) {
      return true;
    }
    if (!wrap || allCandidates.empty()) {
      return false;
    }

    const auto edge = std::minmax_element(
        allCandidates.begin(),
        allCandidates.end(),
        [](const Candidate &left, const Candidate &right) { return left.primary < right.primary; });
    const double wrapEdge = direction > 0 ? edge.first->primary : edge.second->primary;
    for (auto &candidate : allCandidates) {
      const double edgeDistance = std::abs(candidate.primary - wrapEdge);
      const double crossDistance = std::abs(candidate.cross - focusedCross);
      candidate.distance = edgeDistance * 10000 + crossDistance;
    }
    return tryRankedCandidates(allCandidates);
  }

  static int SiblingIndex(const winrtRN::ComponentView &node, const winrtRN::ComponentView &parent) noexcept {
    auto siblings = parent.Children();
    for (uint32_t index = 0; index < siblings.Size(); ++index) {
      if (siblings.GetAt(index).Tag() == node.Tag()) {
        return static_cast<int>(index);
      }
    }
    return -1;
  }

  static winrtRN::ComponentView NextSkippingSubtree(const winrtRN::ComponentView &node) noexcept {
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

  static winrtRN::ComponentView PreOrderNext(const winrtRN::ComponentView &node) noexcept {
    auto children = node.Children();
    return children.Size() > 0 ? children.GetAt(0) : NextSkippingSubtree(node);
  }

  static winrtRN::ComponentView RightmostDescendant(const winrtRN::ComponentView &node) noexcept {
    auto current = node;
    while (true) {
      auto children = current.Children();
      if (children.Size() == 0) {
        return current;
      }
      current = children.GetAt(children.Size() - 1);
    }
  }

  static winrtRN::ComponentView PreOrderPrevious(const winrtRN::ComponentView &node) noexcept {
    auto parent = node.Parent();
    if (!parent) {
      return nullptr;
    }
    const int index = SiblingIndex(node, parent);
    return index <= 0 ? parent : RightmostDescendant(parent.Children().GetAt(index - 1));
  }

  bool FocusOutsideZone(const winrtRN::ComponentView &container, bool forward) noexcept {
    if (forward) {
      for (auto node = NextSkippingSubtree(container); node; node = PreOrderNext(node)) {
        auto candidate = winrtComp::FocusManager::FindFirstFocusableElement(node);
        if (candidate && candidate.TryFocus(winrtRN::FocusState::Keyboard)) {
          return true;
        }
      }
    } else {
      for (auto node = PreOrderPrevious(container); node; node = PreOrderPrevious(node)) {
        auto candidate = winrtComp::FocusManager::FindLastFocusableElement(node);
        if (candidate && candidate.TryFocus(winrtRN::FocusState::Keyboard)) {
          return true;
        }
      }
    }
    return false;
  }

  bool FocusEdgeDescendant(const winrtRN::ComponentView &view, bool last) noexcept {
    auto candidate =
        last
        ? winrtComp::FocusManager::FindLastFocusableElement(view)
        : winrtComp::FocusManager::FindFirstFocusableElement(view);
    return candidate && candidate.TryFocus(winrtRN::FocusState::Keyboard);
  }

  void HandleGotFocus(const winrtRN::ComponentView &container) noexcept {
    if (m_inTabTrap) {
      return;
    }
    if (auto root = container.as<winrtComp::ComponentView>().Root()) {
      if (auto focused = root.GetFocusedComponent()) {
        if (focused.Tag() != m_containerTag && IsWithinContainer(container, focused)) {
          m_lastFocusedTag = focused.Tag();
        }
      }
    }
  }

  void HandleGettingFocus(
      const winrtRN::ComponentView &container,
      const winrtRN::GettingFocusEventArgs &args) noexcept {
    if (Disabled()) {
      return;
    }

    const int64_t preferredTag = m_lastFocusedTag != 0 ? m_lastFocusedTag : DefaultTabbableTag();
    if (preferredTag == 0) {
      return;
    }
    if (auto oldFocus = args.OldFocusedComponent(); oldFocus && IsWithinContainer(container, oldFocus)) {
      return;
    }
    if (auto newFocus = args.NewFocusedComponent(); newFocus && newFocus.Tag() == preferredTag) {
      return;
    }

    std::vector<winrtRN::ComponentView> candidates;
    CollectFocusableDescendants(container, candidates);
    for (const auto &candidate : candidates) {
      if (candidate.Tag() == preferredTag) {
        args.TrySetNewFocusedComponent(candidate);
        return;
      }
    }
  }

  static bool IsWithinContainer(
      const winrtRN::ComponentView &container,
      const winrtRN::ComponentView &node) noexcept {
    auto current = node;
    while (current) {
      if (current.Tag() == container.Tag()) {
        return true;
      }
      current = current.Parent();
    }
    return false;
  }

  bool Disabled() const noexcept {
    auto props = Props();
    return props && props->disabled.value_or(false);
  }

  std::string Direction() const noexcept {
    auto props = Props();
    return props && props->focusZoneDirection ? *props->focusZoneDirection : "bidirectional";
  }

  bool IsVertical() const noexcept {
    const auto direction = Direction();
    return direction == "vertical" || direction == "bidirectional";
  }

  bool IsHorizontal() const noexcept {
    const auto direction = Direction();
    return direction == "horizontal" || direction == "bidirectional";
  }

  bool ShouldWrap() const noexcept {
    auto props = Props();
    return props && props->navigateAtEnd && *props->navigateAtEnd == "NavigateWrap";
  }

  bool Use2DNavigation() const noexcept {
    auto props = Props();
    return props && props->use2DNavigation.value_or(false);
  }

  std::string TabNavigation() const noexcept {
    auto props = Props();
    return props && props->tabKeyNavigation ? *props->tabKeyNavigation : "None";
  }

  int64_t DefaultTabbableTag() const noexcept {
    auto props = Props();
    if (!props) {
      return 0;
    }

    const auto &value = props->defaultTabbableElement;
    if (value.Type() == winrtRN::JSValueType::Int64) {
      return value.AsInt64();
    }
    if (value.Type() == winrtRN::JSValueType::Double) {
      return static_cast<int64_t>(value.AsDouble());
    }
    return 0;
  }

  int64_t m_containerTag{0};
  int64_t m_lastFocusedTag{0};
  bool m_inTabTrap{false};
};

} // namespace winrt::FRNFocusZone

void RegisterFocusZoneComponentView(const winrt::Microsoft::ReactNative::IReactPackageBuilder &packageBuilder) noexcept {
  using ComponentView = winrt::FRNFocusZone::FocusZoneComponentView;

  FRNFocusZoneCodegen::RegisterFocusZoneNativeComponent<ComponentView>(packageBuilder, {});
}

#endif
