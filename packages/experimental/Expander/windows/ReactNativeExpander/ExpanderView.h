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

        Microsoft::UI::Xaml::Controls::Expander::Collapsed_revoker m_expanderCollapsedRevoker{};
        Microsoft::UI::Xaml::Controls::Expander::Expanding_revoker m_expanderExpandingRevoker{};
        // Microsoft::UI::Xaml::Controls::Expander m_expander{ nullptr };

        void OnCollapsed(winrt::Windows::Foundation::IInspectable const& sender,
                          Microsoft::UI::Xaml::Controls::ExpanderCollapsedEventArgs const& args,
                          Microsoft::UI::Xaml::Controls::Expander const& expander);
        void OnExpanding(winrt::Windows::Foundation::IInspectable const& sender,
                          Microsoft::UI::Xaml::Controls::ExpanderExpandingEventArgs const& args,
                          Microsoft::UI::Xaml::Controls::Expander const& expander);

        void RegisterEvents();
    };
}

namespace winrt::ReactNativeExpander::factory_implementation {
    struct ExpanderView : ExpanderViewT<ExpanderView, implementation::ExpanderView> {};
}
