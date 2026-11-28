#include "pch.h"
#include "RangeTarget.h"

#ifdef RNW_NEW_ARCH
#include "codegen/react/components/FRNNativeCoreSpec/FRNNativeCoreRangeTarget.g.h"
#include <UIAutomation.h>
#include <limits>

namespace winrt::FRNNativeCore::implementation {
namespace {
namespace rn = winrt::Microsoft::ReactNative;
namespace codegen = FRNNativeCoreCodegen;

struct RangeTarget;

struct RangePeer : winrt::implements<
                             RangePeer,
                             winrt::Windows::Foundation::IInspectable,
                             IRawElementProviderSimple,
                             IRawElementProviderFragment,
                             IRangeValueProvider,
                             winrt::non_agile> {
  RangePeer(const winrt::Windows::Foundation::IInspectable &peer, winrt::weak_ref<RangeTarget> target)
      : m_simple(peer.as<IRawElementProviderSimple>()),
        m_fragment(peer.as<IRawElementProviderFragment>()),
        m_target(std::move(target)) {}

  HRESULT __stdcall get_ProviderOptions(ProviderOptions *value) noexcept override {
    return m_simple->get_ProviderOptions(value);
  }
  HRESULT __stdcall get_HostRawElementProvider(IRawElementProviderSimple **value) noexcept override {
    return m_simple->get_HostRawElementProvider(value);
  }
  HRESULT __stdcall GetPatternProvider(PATTERNID pattern, IUnknown **value) noexcept override;
  HRESULT __stdcall GetPropertyValue(PROPERTYID property, VARIANT *value) noexcept override;

  HRESULT __stdcall Navigate(NavigateDirection direction, IRawElementProviderFragment **value) noexcept override {
    return m_fragment->Navigate(direction, value);
  }
  HRESULT __stdcall GetRuntimeId(SAFEARRAY **value) noexcept override { return m_fragment->GetRuntimeId(value); }
  HRESULT __stdcall get_BoundingRectangle(UiaRect *value) noexcept override {
    return m_fragment->get_BoundingRectangle(value);
  }
  HRESULT __stdcall GetEmbeddedFragmentRoots(SAFEARRAY **value) noexcept override {
    return m_fragment->GetEmbeddedFragmentRoots(value);
  }
  HRESULT __stdcall SetFocus() noexcept override;
  HRESULT __stdcall get_FragmentRoot(IRawElementProviderFragmentRoot **value) noexcept override {
    return m_fragment->get_FragmentRoot(value);
  }

  HRESULT __stdcall SetValue(double value) noexcept override;
  HRESULT __stdcall get_Value(double *value) noexcept override;
  HRESULT __stdcall get_IsReadOnly(BOOL *value) noexcept override;
  HRESULT __stdcall get_Maximum(double *value) noexcept override;
  HRESULT __stdcall get_Minimum(double *value) noexcept override;
  HRESULT __stdcall get_LargeChange(double *value) noexcept override;
  HRESULT __stdcall get_SmallChange(double *value) noexcept override;

  void NotifyNumber(PROPERTYID property, double before, double after) noexcept {
    if (before == after || (std::isnan(before) && std::isnan(after)) || !UiaClientsAreListening()) return;
    VARIANT oldValue{}, newValue{};
    oldValue.vt = newValue.vt = VT_R8;
    oldValue.dblVal = before;
    newValue.dblVal = after;
    UiaRaiseAutomationPropertyChangedEvent(this, property, oldValue, newValue);
  }

 private:
  winrt::com_ptr<IRawElementProviderSimple> m_simple;
  winrt::com_ptr<IRawElementProviderFragment> m_fragment;
  winrt::weak_ref<RangeTarget> m_target;
};

struct RangeTarget : winrt::implements<RangeTarget, winrt::Windows::Foundation::IInspectable>,
                           codegen::BaseFRNNativeCoreRangeTarget<RangeTarget> {
  void Initialize(const rn::ComponentView &view) noexcept override {
    m_mountedEvent = view.Mounted(winrt::auto_revoke, [weak = get_weak()](const auto &, const auto &) {
      if (auto self = weak.get()) self->m_mounted = true;
    });
    m_unmountedEvent = view.Unmounted(winrt::auto_revoke, [weak = get_weak()](const auto &, const auto &) {
      if (auto self = weak.get()) self->m_mounted = false;
    });
    m_keyDown = view.KeyDown(winrt::auto_revoke, [weak = get_weak()](const auto &, const auto &args) {
      if (auto self = weak.get()) self->OnKeyDown(args);
    });
  }

  void UpdateProps(const rn::ComponentView &view,
                   const winrt::com_ptr<codegen::FRNNativeCoreRangeTargetProps> &next,
                   const winrt::com_ptr<codegen::FRNNativeCoreRangeTargetProps> &previous) noexcept override {
    BaseFRNNativeCoreRangeTarget::UpdateProps(view, next, previous);
    if (m_peer && m_mounted && previous && next) {
      m_peer->NotifyNumber(UIA_RangeValueValuePropertyId, Number(*previous), Number(*next));
      m_peer->NotifyNumber(UIA_RangeValueMinimumPropertyId, previous->minimum, next->minimum);
      m_peer->NotifyNumber(UIA_RangeValueMaximumPropertyId, previous->maximum, next->maximum);
      m_peer->NotifyNumber(UIA_RangeValueSmallChangePropertyId, previous->step, next->step);
    }
  }

  winrt::Windows::Foundation::IInspectable CreateAutomationPeer(
      const rn::ComponentView &, const rn::CreateAutomationPeerArgs &args) noexcept override {
    m_peer = winrt::make_self<RangePeer>(args.DefaultAutomationPeer(), get_weak());
    return *m_peer;
  }

  static double Number(const codegen::FRNNativeCoreRangeTargetProps &props) noexcept {
    return props.hasValue ? props.value : std::numeric_limits<double>::quiet_NaN();
  }

  bool Available() const noexcept { return m_mounted && Props(); }
  bool HasValidRange() const noexcept {
    const auto &props = *Props();
    return std::isfinite(props.minimum) && std::isfinite(props.maximum) && props.minimum <= props.maximum &&
        std::isfinite(props.step) && props.step > 0;
  }
  bool Disabled() const noexcept { return Props()->disabled.value_or(false); }
  bool IsReadOnly() const noexcept { return Disabled() || Props()->readOnly.value_or(false) || !Props()->onValueRequest; }

  HRESULT Request(double value, const char *kind) noexcept {
    if (!Available()) return UIA_E_ELEMENTNOTAVAILABLE;
    if (Disabled()) return UIA_E_ELEMENTNOTENABLED;
    if (IsReadOnly() || !HasValidRange() || !EventEmitter()) return UIA_E_INVALIDOPERATION;
    const auto &props = *Props();
    if (!std::isfinite(value) || value < props.minimum || value > props.maximum) return E_INVALIDARG;
    if (!props.hasValue || value != props.value) EventEmitter()->onValueRequest({kind, value});
    return S_OK;
  }

 private:
  void OnKeyDown(const rn::Composition::Input::KeyRoutedEventArgs &args) noexcept {
    using winrt::Windows::System::VirtualKey;
    if (args.Handled() || !Available() || IsReadOnly() || !HasValidRange() || !EventEmitter()) return;
    if ((GetKeyState(VK_CONTROL) | GetKeyState(VK_MENU) | GetKeyState(VK_SHIFT) |
         GetKeyState(VK_LWIN) | GetKeyState(VK_RWIN)) & 0x8000) return;
    const auto &props = *Props();
    const double current = props.hasValue ? props.value : props.minimum;
    const double horizontalStep = props.horizontalReversed.value_or(false) ? -props.step : props.step;
    double next = current;
    switch (args.Key()) {
      case VirtualKey::Left: next -= horizontalStep; break;
      case VirtualKey::Right: next += horizontalStep; break;
      case VirtualKey::Down: next -= props.step; break;
      case VirtualKey::Up: next += props.step; break;
      case VirtualKey::Home: next = props.minimum; break;
      case VirtualKey::End: next = props.maximum; break;
      case VirtualKey::Delete:
      case VirtualKey::Back:
        if (!props.clearable.value_or(false)) return;
        if (props.hasValue) EventEmitter()->onValueRequest({"clear", props.value});
        args.Handled(true);
        return;
      default: return;
    }
    Request(std::clamp(next, props.minimum, props.maximum), "keyboard");
    args.Handled(true);
  }

  bool m_mounted{false};
  rn::ComponentView::Mounted_revoker m_mountedEvent;
  rn::ComponentView::Unmounted_revoker m_unmountedEvent;
  rn::ComponentView::KeyDown_revoker m_keyDown;
  winrt::com_ptr<RangePeer> m_peer;
};

HRESULT RangePeer::GetPatternProvider(PATTERNID pattern, IUnknown **value) noexcept {
  if (!value) return E_POINTER;
  *value = nullptr;
  auto target = m_target.get();
  if (!target || !target->Available()) return UIA_E_ELEMENTNOTAVAILABLE;
  if (pattern == UIA_RangeValuePatternId) {
    if (!target->HasValidRange()) return S_OK;
    *value = static_cast<IRangeValueProvider *>(this);
    AddRef();
    return S_OK;
  }
  if (pattern == UIA_ValuePatternId) return S_OK;
  return m_simple->GetPatternProvider(pattern, value);
}

HRESULT RangePeer::GetPropertyValue(PROPERTYID property, VARIANT *value) noexcept {
  if (!value) return E_POINTER;
  auto target = m_target.get();
  if (!target || !target->Available()) return UIA_E_ELEMENTNOTAVAILABLE;
  if (property == UIA_ItemStatusPropertyId && target->Props()->valueDescription) {
    VariantInit(value);
    const auto description = winrt::to_hstring(*target->Props()->valueDescription);
    value->bstrVal = SysAllocStringLen(description.data(), description.size());
    if (!value->bstrVal) return E_OUTOFMEMORY;
    value->vt = VT_BSTR;
    return S_OK;
  }
  return m_simple->GetPropertyValue(property, value);
}

HRESULT RangePeer::SetFocus() noexcept {
  auto target = m_target.get();
  if (!target || !target->Available()) return UIA_E_ELEMENTNOTAVAILABLE;
  if (target->Disabled()) return UIA_E_ELEMENTNOTENABLED;
  return m_fragment->SetFocus();
}

HRESULT RangePeer::SetValue(double value) noexcept {
  auto target = m_target.get();
  return target ? target->Request(value, "accessibility") : UIA_E_ELEMENTNOTAVAILABLE;
}

HRESULT RangePeer::get_Value(double *value) noexcept {
  if (!value) return E_POINTER;
  auto target = m_target.get();
  if (!target || !target->Available()) return UIA_E_ELEMENTNOTAVAILABLE;
  *value = RangeTarget::Number(*target->Props());
  return S_OK;
}

HRESULT RangePeer::get_IsReadOnly(BOOL *value) noexcept {
  if (!value) return E_POINTER;
  auto target = m_target.get();
  if (!target || !target->Available()) return UIA_E_ELEMENTNOTAVAILABLE;
  *value = target->IsReadOnly();
  return S_OK;
}

HRESULT RangePeer::get_Maximum(double *value) noexcept {
  if (!value) return E_POINTER;
  auto target = m_target.get();
  if (!target || !target->Available()) return UIA_E_ELEMENTNOTAVAILABLE;
  *value = target->Props()->maximum;
  return S_OK;
}

HRESULT RangePeer::get_Minimum(double *value) noexcept {
  if (!value) return E_POINTER;
  auto target = m_target.get();
  if (!target || !target->Available()) return UIA_E_ELEMENTNOTAVAILABLE;
  *value = target->Props()->minimum;
  return S_OK;
}

HRESULT RangePeer::get_LargeChange(double *value) noexcept {
  if (!value) return E_POINTER;
  auto target = m_target.get();
  if (!target || !target->Available()) return UIA_E_ELEMENTNOTAVAILABLE;
  *value = std::numeric_limits<double>::quiet_NaN();
  return S_OK;
}

HRESULT RangePeer::get_SmallChange(double *value) noexcept {
  if (!value) return E_POINTER;
  auto target = m_target.get();
  if (!target || !target->Available()) return UIA_E_ELEMENTNOTAVAILABLE;
  *value = target->Props()->step;
  return S_OK;
}
} // namespace

void RegisterRangeTargetComponentView(const rn::IReactPackageBuilder &builder) noexcept {
  codegen::RegisterFRNNativeCoreRangeTargetNativeComponent<RangeTarget>(builder, nullptr);
}
} // namespace winrt::FRNNativeCore::implementation
#endif
