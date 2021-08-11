#pragma once

#include "ExpanderView.g.h"
#include "winrt/Microsoft.ReactNative.h"
#include "NativeModules.h"

namespace winrt::ReactNativeExpander::implementation {

class ExpanderView : public ExpanderViewT<ExpanderView> {
public:
    ExpanderView(Microsoft::ReactNative::IReactContext const& reactContext);
    void UpdateProperties(Microsoft::ReactNative::IJSValueReader const& reader);

private:
    Microsoft::ReactNative::IReactContext m_reactContext{ nullptr };
    bool m_updating{ false };
    bool m_updateResDict{ false };

    // The Expander Collapsed event is misnamed. The event is fired when Expander begins collapsing
    Microsoft::UI::Xaml::Controls::Expander::Collapsed_revoker m_expanderCollapsingRevoker{};
    Microsoft::UI::Xaml::Controls::Expander::Expanding_revoker m_expanderExpandingRevoker{};

    void SetResourceColor(hstring key, Microsoft::ReactNative::JSValue const& value);
    void OnCollapsing(winrt::Windows::Foundation::IInspectable const& sender,
                      Microsoft::UI::Xaml::Controls::ExpanderCollapsedEventArgs const& args);
    void OnExpanding(winrt::Windows::Foundation::IInspectable const& sender,
                      Microsoft::UI::Xaml::Controls::ExpanderExpandingEventArgs const& args);
    void RegisterEvents();
};
}

namespace winrt::ReactNativeExpander::factory_implementation {
struct ExpanderView : ExpanderViewT<ExpanderView, implementation::ExpanderView> {};
}
