
/*
 * This file is auto-generated from FRNNativeCoreSpinEditorNativeComponent spec file in flow / TypeScript.
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

namespace FRNNativeCoreCodegen {

REACT_STRUCT(FRNNativeCoreSpinEditorProps)
struct FRNNativeCoreSpinEditorProps : winrt::implements<FRNNativeCoreSpinEditorProps, winrt::Microsoft::ReactNative::IComponentProps> {
  FRNNativeCoreSpinEditorProps(winrt::Microsoft::ReactNative::ViewProps props, const winrt::Microsoft::ReactNative::IComponentProps& cloneFrom)
    : ViewProps(props)
  {
     if (cloneFrom) {
       auto cloneFromProps = cloneFrom.as<FRNNativeCoreSpinEditorProps>();
       targetLabel = cloneFromProps->targetLabel;
       targetTestID = cloneFromProps->targetTestID;
       incrementLabel = cloneFromProps->incrementLabel;
       decrementLabel = cloneFromProps->decrementLabel;
       draft = cloneFromProps->draft;
       numericValue = cloneFromProps->numericValue;
       minimum = cloneFromProps->minimum;
       maximum = cloneFromProps->maximum;
       canIncrement = cloneFromProps->canIncrement;
       canDecrement = cloneFromProps->canDecrement;
       hasLargeStep = cloneFromProps->hasLargeStep;
       disabled = cloneFromProps->disabled;
       readOnly = cloneFromProps->readOnly;
       invalid = cloneFromProps->invalid;
       onEditorInput = cloneFromProps->onEditorInput;  
     }
  }

  void SetProp(uint32_t hash, winrt::hstring propName, winrt::Microsoft::ReactNative::IJSValueReader value) noexcept {
    winrt::Microsoft::ReactNative::ReadProp(hash, propName, value, *this);
  }

  REACT_FIELD(targetLabel)
  std::string targetLabel;

  REACT_FIELD(targetTestID)
  std::optional<std::string> targetTestID;

  REACT_FIELD(incrementLabel)
  std::string incrementLabel;

  REACT_FIELD(decrementLabel)
  std::string decrementLabel;

  REACT_FIELD(draft)
  std::string draft;

  REACT_FIELD(numericValue)
  double numericValue{};

  REACT_FIELD(minimum)
  double minimum{};

  REACT_FIELD(maximum)
  double maximum{};

  REACT_FIELD(canIncrement)
  std::optional<bool> canIncrement{};

  REACT_FIELD(canDecrement)
  std::optional<bool> canDecrement{};

  REACT_FIELD(hasLargeStep)
  std::optional<bool> hasLargeStep{};

  REACT_FIELD(disabled)
  std::optional<bool> disabled{};

  REACT_FIELD(readOnly)
  std::optional<bool> readOnly{};

  REACT_FIELD(invalid)
  std::optional<bool> invalid{};

   // These fields can be used to determine if JS has registered for this event
  REACT_FIELD(onEditorInput)
  bool onEditorInput{false};

  const winrt::Microsoft::ReactNative::ViewProps ViewProps;
};

REACT_STRUCT(FRNNativeCoreSpinEditorSpec_onEditorInput)
struct FRNNativeCoreSpinEditorSpec_onEditorInput {
  REACT_FIELD(kind)
  std::string kind;

  REACT_FIELD(text)
  std::string text;

  REACT_FIELD(value)
  double value{};
};

struct FRNNativeCoreSpinEditorEventEmitter {
  FRNNativeCoreSpinEditorEventEmitter(const winrt::Microsoft::ReactNative::EventEmitter &eventEmitter)
      : m_eventEmitter(eventEmitter) {}

  using OnEditorInput = FRNNativeCoreSpinEditorSpec_onEditorInput;

  void onEditorInput(OnEditorInput &&value) const {
    m_eventEmitter.DispatchEvent(L"editorInput", [value = std::move(value)](const winrt::Microsoft::ReactNative::IJSValueWriter writer) {
      winrt::Microsoft::ReactNative::WriteValue(writer, value);
    });
  }

 private:
  winrt::Microsoft::ReactNative::EventEmitter m_eventEmitter{nullptr};
};

template<typename TUserData>
struct BaseFRNNativeCoreSpinEditor {

  virtual void UpdateProps(
    const winrt::Microsoft::ReactNative::ComponentView &/*view*/,
    const winrt::com_ptr<FRNNativeCoreSpinEditorProps> &newProps,
    const winrt::com_ptr<FRNNativeCoreSpinEditorProps> &/*oldProps*/) noexcept {
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

  virtual void UpdateEventEmitter(const std::shared_ptr<FRNNativeCoreSpinEditorEventEmitter> &eventEmitter) noexcept {
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

  

  const std::shared_ptr<FRNNativeCoreSpinEditorEventEmitter>& EventEmitter() const { return m_eventEmitter; }
  const winrt::com_ptr<FRNNativeCoreSpinEditorProps>& Props() const { return m_props; }

private:
  winrt::com_ptr<FRNNativeCoreSpinEditorProps> m_props;
  std::shared_ptr<FRNNativeCoreSpinEditorEventEmitter> m_eventEmitter;
};

template <typename TUserData>
void RegisterFRNNativeCoreSpinEditorNativeComponent(
    winrt::Microsoft::ReactNative::IReactPackageBuilder const &packageBuilder,
    std::function<void(const winrt::Microsoft::ReactNative::Composition::IReactCompositionViewComponentBuilder&)> builderCallback) noexcept {
  packageBuilder.as<winrt::Microsoft::ReactNative::IReactPackageBuilderFabric>().AddViewComponent(
      L"FRNNativeCoreSpinEditor", [builderCallback](winrt::Microsoft::ReactNative::IReactViewComponentBuilder const &builder) noexcept {
        auto compBuilder = builder.as<winrt::Microsoft::ReactNative::Composition::IReactCompositionViewComponentBuilder>();

        builder.SetCreateProps([](winrt::Microsoft::ReactNative::ViewProps props,
                              const winrt::Microsoft::ReactNative::IComponentProps& cloneFrom) noexcept {
            return winrt::make<FRNNativeCoreSpinEditorProps>(props, cloneFrom); 
        });

        builder.SetUpdatePropsHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                     const winrt::Microsoft::ReactNative::IComponentProps &newProps,
                                     const winrt::Microsoft::ReactNative::IComponentProps &oldProps) noexcept {
            auto userData = view.UserData().as<TUserData>();
            userData->UpdateProps(view, newProps ? newProps.as<FRNNativeCoreSpinEditorProps>() : nullptr, oldProps ? oldProps.as<FRNNativeCoreSpinEditorProps>() : nullptr);
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
          userData->UpdateEventEmitter(std::make_shared<FRNNativeCoreSpinEditorEventEmitter>(eventEmitter));
        });

        if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::FinalizeUpdate != &BaseFRNNativeCoreSpinEditor<TUserData>::FinalizeUpdate) {
            builder.SetFinalizeUpdateHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                     winrt::Microsoft::ReactNative::ComponentViewUpdateMask mask) noexcept {
            auto userData = view.UserData().as<TUserData>();
            userData->FinalizeUpdate(view, mask);
          });
        } 

        if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::UpdateState != &BaseFRNNativeCoreSpinEditor<TUserData>::UpdateState) {
          builder.SetUpdateStateHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                     const winrt::Microsoft::ReactNative::IComponentState &newState) noexcept {
            auto userData = view.UserData().as<TUserData>();
            userData->UpdateState(view, newState);
          });
        }

        if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::MountChildComponentView != &BaseFRNNativeCoreSpinEditor<TUserData>::MountChildComponentView) {
          builder.SetMountChildComponentViewHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                      const winrt::Microsoft::ReactNative::MountChildComponentViewArgs &args) noexcept {
            auto userData = view.UserData().as<TUserData>();
            return userData->MountChildComponentView(view, args);
          });
        }

        if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::UnmountChildComponentView != &BaseFRNNativeCoreSpinEditor<TUserData>::UnmountChildComponentView) {
          builder.SetUnmountChildComponentViewHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                      const winrt::Microsoft::ReactNative::UnmountChildComponentViewArgs &args) noexcept {
            auto userData = view.UserData().as<TUserData>();
            return userData->UnmountChildComponentView(view, args);
          });
        }

        if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::CreateAutomationPeer != &BaseFRNNativeCoreSpinEditor<TUserData>::CreateAutomationPeer) {
            builder.SetCreateAutomationPeerHandler([](const winrt::Microsoft::ReactNative::ComponentView &view,
                                     const winrt::Microsoft::ReactNative::CreateAutomationPeerArgs& args) noexcept {
            auto userData = view.UserData().as<TUserData>();
            return userData->CreateAutomationPeer(view, args);
          });
        } 

        compBuilder.SetViewComponentViewInitializer([](const winrt::Microsoft::ReactNative::ComponentView &view) noexcept {
          auto userData = winrt::make_self<TUserData>();
          if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::Initialize != &BaseFRNNativeCoreSpinEditor<TUserData>::Initialize) {
            userData->Initialize(view);
          }
          view.UserData(*userData);
        });

        if CONSTEXPR_SUPPORTED_ON_VIRTUAL_FN_ADDRESS (&TUserData::CreateVisual != &BaseFRNNativeCoreSpinEditor<TUserData>::CreateVisual) {
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

} // namespace FRNNativeCoreCodegen

#endif // #ifdef RNW_NEW_ARCH
