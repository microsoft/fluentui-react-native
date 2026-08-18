#include "pch.h"

#include "FocusZoneComponentView.h"

#ifdef RNW_NEW_ARCH

#include "codegen/react/components/FRNFocusZoneSpec/RCTFocusZone.g.h"

namespace winrt::FRNFocusZone {

namespace winrtComp = winrt::Microsoft::ReactNative::Composition;
namespace winrtInput = winrt::Microsoft::ReactNative::Composition::Input;
namespace winrtRN = winrt::Microsoft::ReactNative;

void CollectDescendants(const winrtRN::ComponentView &view, std::vector<winrtRN::ComponentView> &descendants) {
  auto children = view.Children();
  for (uint32_t index = 0; index < children.Size(); ++index) {
    auto child = children.GetAt(index);
    descendants.push_back(child);
    CollectDescendants(child, descendants);
  }
}

struct FocusZoneComponentView
    : winrt::implements<FocusZoneComponentView, winrt::Windows::Foundation::IInspectable>,
      FRNFocusZoneCodegen::BaseRCTFocusZone<FocusZoneComponentView> {
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
    bool moveToStart = false;
    bool moveToEnd = false;

    switch (args.Key()) {
      case VirtualKey::Down:
        if (!IsVertical()) {
          return;
        }
        direction = 1;
        break;
      case VirtualKey::Up:
        if (!IsVertical()) {
          return;
        }
        direction = -1;
        break;
      case VirtualKey::Right:
        if (!IsHorizontal()) {
          return;
        }
        direction = 1;
        break;
      case VirtualKey::Left:
        if (!IsHorizontal()) {
          return;
        }
        direction = -1;
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

    if (MoveFocus(view, direction, moveToStart, moveToEnd, ShouldWrap())) {
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
      const bool moved = MoveFocus(view, forward ? 1 : -1, false, false, wrap);
      if (moved || !wrap) {
        args.Handled(true);
      }
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
    CollectDescendants(view, candidates);
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
        if (node.TryFocus(winrtRN::FocusState::Keyboard)) {
          return true;
        }
      }
    } else {
      for (auto node = PreOrderPrevious(container); node; node = PreOrderPrevious(node)) {
        if (node.TryFocus(winrtRN::FocusState::Keyboard)) {
          return true;
        }
      }
    }
    return false;
  }

  bool FocusEdgeDescendant(const winrtRN::ComponentView &view, bool last) noexcept {
    std::vector<winrtRN::ComponentView> candidates;
    CollectDescendants(view, candidates);
    if (last) {
      for (auto candidate = candidates.rbegin(); candidate != candidates.rend(); ++candidate) {
        if (candidate->TryFocus(winrtRN::FocusState::Keyboard)) {
          return true;
        }
      }
    } else {
      for (const auto &candidate : candidates) {
        if (candidate.TryFocus(winrtRN::FocusState::Keyboard)) {
          return true;
        }
      }
    }
    return false;
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
    CollectDescendants(container, candidates);
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
  namespace winrtComp = winrt::Microsoft::ReactNative::Composition;
  namespace winrtRN = winrt::Microsoft::ReactNative;
  using ComponentView = winrt::FRNFocusZone::FocusZoneComponentView;

  packageBuilder.as<winrtRN::IReactPackageBuilderFabric>().AddViewComponent(
      L"FocusZone", [](const winrtRN::IReactViewComponentBuilder &builder) noexcept {
        auto compositionBuilder = builder.as<winrtComp::IReactCompositionViewComponentBuilder>();

        builder.SetCreateProps(
            [](winrtRN::ViewProps props, const winrtRN::IComponentProps &cloneFrom) noexcept {
              return winrt::make<FRNFocusZoneCodegen::RCTFocusZoneProps>(props, cloneFrom);
            });
        builder.SetUpdatePropsHandler(
            [](const winrtRN::ComponentView &view,
               const winrtRN::IComponentProps &newProps,
               const winrtRN::IComponentProps &oldProps) noexcept {
              view.UserData().as<ComponentView>()->UpdateProps(
                  view,
                  newProps ? newProps.as<FRNFocusZoneCodegen::RCTFocusZoneProps>() : nullptr,
                  oldProps ? oldProps.as<FRNFocusZoneCodegen::RCTFocusZoneProps>() : nullptr);
            });
        builder.SetUpdateEventEmitterHandler(
            [](const winrtRN::ComponentView &view, const winrtRN::EventEmitter &eventEmitter) noexcept {
              view.UserData().as<ComponentView>()->UpdateEventEmitter(
                  std::make_shared<FRNFocusZoneCodegen::RCTFocusZoneEventEmitter>(eventEmitter));
            });
        compositionBuilder.SetViewComponentViewInitializer([](const winrtRN::ComponentView &view) noexcept {
          auto userData = winrt::make_self<ComponentView>();
          userData->Initialize(view);
          view.UserData(*userData);
        });
      });
}

#endif
