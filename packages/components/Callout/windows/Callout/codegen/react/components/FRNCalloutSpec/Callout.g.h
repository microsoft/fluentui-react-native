
/*
 * This file is auto-generated from CalloutNativeComponent spec file in flow / TypeScript.
 */
// clang-format off
#pragma once

#include <NativeModules.h>

#ifdef RNW_NEW_ARCH
#include <JSValueComposition.h>

#include <winrt/Microsoft.ReactNative.Composition.h>
#include <winrt/Microsoft.UI.Composition.h>
#endif // #ifdef RNW_NEW_ARCH

#ifdef RNW_NEW_ARCH

namespace winrt::FluentUI::Callout::Codegen {

REACT_STRUCT(CalloutSpec_CalloutProps_anchorRect)
struct CalloutSpec_CalloutProps_anchorRect {
  REACT_FIELD(screenX)
  double screenX{};

  REACT_FIELD(screenY)
  double screenY{};

  REACT_FIELD(width)
  double width{};

  REACT_FIELD(height)
  double height{};
};

REACT_STRUCT(CalloutProps)
struct CalloutProps : winrt::implements<CalloutProps, winrt::Microsoft::ReactNative::IComponentProps> {
  CalloutProps(winrt::Microsoft::ReactNative::ViewProps props, const winrt::Microsoft::ReactNative::IComponentProps& cloneFrom)
    : ViewProps(props)
  {
     if (cloneFrom) {
       auto cloneFromProps = cloneFrom.as<CalloutProps>();
       accessibilityLabel = cloneFromProps->accessibilityLabel;
       accessibilityOnShowAnnouncement = cloneFromProps->accessibilityOnShowAnnouncement;
       anchorRect = cloneFromProps->anchorRect;
       beakWidth = cloneFromProps->beakWidth;
       dismissBehaviors = cloneFromProps->dismissBehaviors;
       doNotTakePointerCapture = cloneFromProps->doNotTakePointerCapture;
       focusable = cloneFromProps->focusable;
       gapSpace = cloneFromProps->gapSpace;
       isBeakVisible = cloneFromProps->isBeakVisible;
       maxHeight = cloneFromProps->maxHeight;
       maxWidth = cloneFromProps->maxWidth;
       minPadding = cloneFromProps->minPadding;
       minWidth = cloneFromProps->minWidth;
       setInitialFocus = cloneFromProps->setInitialFocus;
       testID = cloneFromProps->testID;
       directionalHint = cloneFromProps->directionalHint;
       target = cloneFromProps->target.Copy();
       onRestoreFocus = cloneFromProps->onRestoreFocus;
       onDismiss = cloneFromProps->onDismiss;
       onShow = cloneFromProps->onShow;  
     }
  }

  void SetProp(uint32_t hash, winrt::hstring propName, winrt::Microsoft::ReactNative::IJSValueReader value) noexcept {
    winrt::Microsoft::ReactNative::ReadProp(hash, propName, value, *this);
  }

  REACT_FIELD(accessibilityLabel)
  std::optional<std::string> accessibilityLabel;

  REACT_FIELD(accessibilityOnShowAnnouncement)
  std::optional<std::string> accessibilityOnShowAnnouncement;

  REACT_FIELD(anchorRect)
  std::optional<CalloutSpec_CalloutProps_anchorRect> anchorRect;

  REACT_FIELD(beakWidth)
  std::optional<int32_t> beakWidth{};

  REACT_FIELD(dismissBehaviors)
  std::optional<std::vector<std::string>> dismissBehaviors;

  REACT_FIELD(doNotTakePointerCapture)
  std::optional<bool> doNotTakePointerCapture{};

  REACT_FIELD(focusable)
  std::optional<bool> focusable{};

  REACT_FIELD(gapSpace)
  std::optional<int32_t> gapSpace{};

  REACT_FIELD(isBeakVisible)
  std::optional<bool> isBeakVisible{};

  REACT_FIELD(maxHeight)
  std::optional<int32_t> maxHeight{};

  REACT_FIELD(maxWidth)
  std::optional<int32_t> maxWidth{};

  REACT_FIELD(minPadding)
  std::optional<int32_t> minPadding{};

  REACT_FIELD(minWidth)
  std::optional<int32_t> minWidth{};

  REACT_FIELD(setInitialFocus)
  std::optional<bool> setInitialFocus{};

  REACT_FIELD(testID)
  std::optional<std::string> testID;

  REACT_FIELD(directionalHint)
  std::optional<std::string> directionalHint;

  REACT_FIELD(target)
  winrt::Microsoft::ReactNative::JSValue target{nullptr};

   // These fields can be used to determine if JS has registered for this event
  REACT_FIELD(onRestoreFocus)
  bool onRestoreFocus{false};

  REACT_FIELD(onDismiss)
  bool onDismiss{false};

  REACT_FIELD(onShow)
  bool onShow{false};

  const winrt::Microsoft::ReactNative::ViewProps ViewProps;
};

REACT_STRUCT(CalloutSpec_onShow)
struct CalloutSpec_onShow {
  REACT_FIELD(target)
  int32_t target{};
};

REACT_STRUCT(CalloutSpec_onDismiss)
struct CalloutSpec_onDismiss {
  REACT_FIELD(target)
  int32_t target{};
};

REACT_STRUCT(CalloutSpec_onRestoreFocus)
struct CalloutSpec_onRestoreFocus {
  REACT_FIELD(target)
  int32_t target{};

  REACT_FIELD(containsFocus)
  bool containsFocus{};
};

struct CalloutEventEmitter {
  CalloutEventEmitter(const winrt::Microsoft::ReactNative::EventEmitter &eventEmitter)
      : m_eventEmitter(eventEmitter) {}

  using OnRestoreFocus = CalloutSpec_onRestoreFocus;
  using OnDismiss = CalloutSpec_onDismiss;
  using OnShow = CalloutSpec_onShow;

  void onRestoreFocus(OnRestoreFocus &&value) const {
    m_eventEmitter.DispatchEvent(L"restoreFocus", [value = std::move(value)](const winrt::Microsoft::ReactNative::IJSValueWriter writer) {
      winrt::Microsoft::ReactNative::WriteValue(writer, value);
    });
  }

  void onDismiss(OnDismiss &&value) const {
    m_eventEmitter.DispatchEvent(L"dismiss", [value = std::move(value)](const winrt::Microsoft::ReactNative::IJSValueWriter writer) {
      winrt::Microsoft::ReactNative::WriteValue(writer, value);
    });
  }

  void onShow(OnShow &&value) const {
    m_eventEmitter.DispatchEvent(L"show", [value = std::move(value)](const winrt::Microsoft::ReactNative::IJSValueWriter writer) {
      winrt::Microsoft::ReactNative::WriteValue(writer, value);
    });
  }

 private:
  winrt::Microsoft::ReactNative::EventEmitter m_eventEmitter{nullptr};
};

template<typename TUserData>
struct BaseCallout {

  virtual void UpdateProps(
    const winrt::Microsoft::ReactNative::ComponentView &/*view*/,
    const winrt::com_ptr<CalloutProps> &newProps,
    const winrt::com_ptr<CalloutProps> &/*oldProps*/) noexcept {
    m_props = newProps;
  }

  // UpdateLayoutMetrics will only be called if this method is overridden
  virtual void UpdateLayoutMetrics(
    const winrt::Microsoft::ReactNative::ComponentView &/*view*/,
    const winrt::Microsoft::ReactNative::LayoutMetrics &/*newLayoutMetrics*/,
    const winrt::Microsoft::ReactNative::LayoutMetrics &/*oldLayoutMetrics*/) noexcept {
  }

  // UpdateState will only be called if this method is overridden
  virtual void UpdateState(
    const winrt::Microsoft::ReactNative::ComponentView &/*view*/,
    const winrt::Microsoft::ReactNative::IComponentState &/*newState*/) noexcept {
  }

  virtual void UpdateEventEmitter(const std::shared_ptr<CalloutEventEmitter> &eventEmitter) noexcept {
    m_eventEmitter = eventEmitter;
  }

  // MountChildComponentView will only be called if this method is overridden
  virtual void MountChildComponentView(const winrt::Microsoft::ReactNative::ComponentView &/*view*/,
           const winrt::Microsoft::ReactNative::MountChildComponentViewArgs &/*args*/) noexcept {
  }

  // UnmountChildComponentView will only be called if this method is overridden
  virtual void UnmountChildComponentView(const winrt::Microsoft::ReactNative::ComponentView &/*view*/,
           const winrt::Microsoft::ReactNative::UnmountChildComponentViewArgs &/*args*/) noexcept {
  }

  // Initialize will only be called if this method is overridden
  virtual void Initialize(const winrt::Microsoft::ReactNative::ComponentView &/*view*/) noexcept {
  }

  // CreateVisual will only be called if this method is overridden
  virtual winrt::Microsoft::UI::Composition::Visual CreateVisual(const winrt::Microsoft::ReactNative::ComponentView &view) noexcept {
    return view.as<winrt::Microsoft::ReactNative::Composition::ComponentView>().Compositor().CreateSpriteVisual();
  }

  // FinalizeUpdate will only be called if this method is overridden
  virtual void FinalizeUpdate(const winrt::Microsoft::ReactNative::ComponentView &/*view*/,
                                        winrt::Microsoft::ReactNative::ComponentViewUpdateMask /*mask*/) noexcept {
  }

  // CreateAutomationPeer will only be called if this method is overridden
  virtual winrt::Windows::Foundation::IInspectable CreateAutomationPeer(const winrt::Microsoft::ReactNative::ComponentView & /*view*/,
                                        const winrt::Microsoft::ReactNative::CreateAutomationPeerArgs& /*args*/) noexcept {
    return nullptr;
  }

  // You must provide an implementation of this method to handle the "focusWindow" command
  virtual void HandleFocusWindowCommand() noexcept = 0;

  // You must provide an implementation of this method to handle the "blurWindow" command
  virtual void HandleBlurWindowCommand() noexcept = 0;

  void HandleCommand(const winrt::Microsoft::ReactNative::ComponentView &view, const winrt::Microsoft::ReactNative::HandleCommandArgs& args) noexcept {
    auto userData = view.UserData().as<TUserData>();
    auto commandName = args.CommandName();
    if (commandName == L"focusWindow") {

      userData->HandleFocusWindowCommand();
      return;
    }

    if (commandName == L"blurWindow") {

      userData->HandleBlurWindowCommand();
      return;
    }
  }

  const std::shared_ptr<CalloutEventEmitter>& EventEmitter() const { return m_eventEmitter; }
  const winrt::com_ptr<CalloutProps>& Props() const { return m_props; }

private:
  winrt::com_ptr<CalloutProps> m_props;
  std::shared_ptr<CalloutEventEmitter> m_eventEmitter;
};

template <typename TUserData>
void RegisterCalloutNativeComponent(
    winrt::Microsoft::ReactNative::IReactPackageBuilder const &packageBuilder,
    std::function<void(const winrt::Microsoft::ReactNative::Composition::IReactCompositionViewComponentBuilder&)> builderCallback) noexcept {
  packageBuilder.as<winrt::Microsoft::ReactNative::IReactPackageBuilderFabric>().AddViewComponent(
      L"Callout", [builderCallback](winrt::Microsoft::ReactNative::IReactViewComponentBuilder const &builder) noexcept {
        auto compBuilder = builder.as<winrt::Microsoft::ReactNative::Composition::IReactCompositionViewComponentBuilder>();

        builder.SetCreateProps([](winrt::Microsoft::ReactNative::ViewProps props,
                              const winrt::Microsoft::ReactNative::IComponentProps& cloneFrom) noexcept {
            return winrt::make<CalloutProps>(props, cloneFrom); 
        });

        builder.SetUpdatePropsHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                     const winrt::Microsoft::ReactNative::IComponentProps &newProps,
                                     const winrt::Microsoft::ReactNative::IComponentProps &oldProps) noexcept {
            auto userData = view.UserData().as<TUserData>();
            userData->UpdateProps(view, newProps ? newProps.as<CalloutProps>() : nullptr, oldProps ? oldProps.as<CalloutProps>() : nullptr);
        });

        compBuilder.SetUpdateLayoutMetricsHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                      const winrt::Microsoft::ReactNative::LayoutMetrics &newLayoutMetrics,
                                      const winrt::Microsoft::ReactNative::LayoutMetrics &oldLayoutMetrics) noexcept {
            auto userData = view.UserData().as<TUserData>();
            userData->UpdateLayoutMetrics(view, newLayoutMetrics, oldLayoutMetrics);
        });

        builder.SetUpdateEventEmitterHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                     const winrt::Microsoft::ReactNative::EventEmitter &eventEmitter) noexcept {
          auto userData = view.UserData().as<TUserData>();
          userData->UpdateEventEmitter(std::make_shared<CalloutEventEmitter>(eventEmitter));
        });

        if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::FinalizeUpdate != &BaseCallout<TUserData>::FinalizeUpdate) {
            builder.SetFinalizeUpdateHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                     winrt::Microsoft::ReactNative::ComponentViewUpdateMask mask) noexcept {
            auto userData = view.UserData().as<TUserData>();
            userData->FinalizeUpdate(view, mask);
          });
        } 

        if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::UpdateState != &BaseCallout<TUserData>::UpdateState) {
          builder.SetUpdateStateHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                     const winrt::Microsoft::ReactNative::IComponentState &newState) noexcept {
            auto userData = view.UserData().as<TUserData>();
            userData->UpdateState(view, newState);
          });
        }

        builder.SetCustomCommandHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                          const winrt::Microsoft::ReactNative::HandleCommandArgs& args) noexcept {
          auto userData = view.UserData().as<TUserData>();
          userData->HandleCommand(view, args);
        });

        if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::MountChildComponentView != &BaseCallout<TUserData>::MountChildComponentView) {
          builder.SetMountChildComponentViewHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                      const winrt::Microsoft::ReactNative::MountChildComponentViewArgs &args) noexcept {
            auto userData = view.UserData().as<TUserData>();
            return userData->MountChildComponentView(view, args);
          });
        }

        if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::UnmountChildComponentView != &BaseCallout<TUserData>::UnmountChildComponentView) {
          builder.SetUnmountChildComponentViewHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                      const winrt::Microsoft::ReactNative::UnmountChildComponentViewArgs &args) noexcept {
            auto userData = view.UserData().as<TUserData>();
            return userData->UnmountChildComponentView(view, args);
          });
        }

        if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::CreateAutomationPeer != &BaseCallout<TUserData>::CreateAutomationPeer) {
            builder.SetCreateAutomationPeerHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                     const winrt::Microsoft::ReactNative::CreateAutomationPeerArgs& args) noexcept {
            auto userData = view.UserData().as<TUserData>();
            return userData->CreateAutomationPeer(view, args);
          });
        } 

        compBuilder.SetViewComponentViewInitializer([](const winrt::Microsoft::ReactNative::ComponentView &view) noexcept {
          auto userData = winrt::make_self<TUserData>();
          if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::Initialize != &BaseCallout<TUserData>::Initialize) {
            userData->Initialize(view);
          }
          view.UserData(*userData);
        });

        if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::CreateVisual != &BaseCallout<TUserData>::CreateVisual) {
          compBuilder.SetCreateVisualHandler([](const winrt::Microsoft::ReactNative::ComponentView &view) noexcept {
            auto userData = view.UserData().as<TUserData>();
            return userData->CreateVisual(view);
          });
        }

        // Allow app to further customize the builder
        if (builderCallback) {
          builderCallback(compBuilder);
        }
      });
}

} // namespace winrt::FluentUI::Callout::Codegen

#endif // #ifdef RNW_NEW_ARCH
