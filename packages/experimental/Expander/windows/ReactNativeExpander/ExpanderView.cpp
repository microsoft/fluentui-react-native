#include "pch.h"
#include "JSValueXaml.h"
#include "ExpanderView.h"
#include "ExpanderView.g.cpp"

#include <limits>
#include <stdexcept>

namespace winrt {
    using namespace Microsoft::ReactNative;
    using namespace Windows::Foundation;
}

namespace winrt::ReactNativeExpander::implementation {

    ExpanderView::ExpanderView(winrt::IReactContext const& reactContext) : m_reactContext(reactContext) {

        auto m_expander = Microsoft::UI::Xaml::Controls::Expander();
        this->Content(m_expander);

        RegisterEvents();
    }

    void ExpanderView::RegisterEvents() {
        // TODO: this might now work, need to access the content here (Expander)
        auto expander = (this->Content()).try_as<Microsoft::UI::Xaml::Controls::Expander>();

        m_expanderCollapsedRevoker = expander.Collapsed(winrt::auto_revoke,
            [ref = get_weak()](auto const& sender, auto const& args) {
            if (auto self = ref.get()) {
                // TODO: issue here - pass in self as an argument to the OnCollapsed method
                this->OnCollapsed(sender, args);
            }
        });

        m_expanderExpandingRevoker = expander.Expanding(winrt::auto_revoke,
            [ref = get_weak()](auto const& sender, auto const& args) {
            if (auto self = ref.get()) {
                // TODO: issue here - pass in self as an argument to the OnExpanding method
                this->OnExpanding(sender, args);
            }
        });
    }

    void ExpanderView::UpdateProperties(winrt::IJSValueReader const& reader) {
        m_updating = true;

        auto const& propertyMap = JSValueObject::ReadFrom(reader);

        for (auto const& pair : propertyMap) {
            auto const& propertyName = pair.first;
            auto const& propertyValue = pair.second;

            if (propertyName == "expandDirection") {
                // do stuff
            } else if (propertyName == "expanded") {
                // do stuff
            } else if (propertyName == "header") {
                // do stuff
            } else if (propertyName == "content") {
                // do stuff
            } else if (propertyName == "enabled") {
                // do stuff
            } else if (propertyName == "expanderStyle") {
                // do stuff
            } else if (propertyName == "accentColor") {
                // do stuff
            }
        }

        m_updating = false;
    }

    void ExpanderView::OnCollapsed(winrt::Windows::Foundation::IInspectable const& sender,
                          Microsoft::UI::Xaml::Controls::ExpanderCollapsedEventArgs const& args,
                          Microsoft::UI::Xaml::Controls::Expander const& expander) {
        if (!m_updating) {

            m_reactContext.DispatchEvent(
                expander,
                L"topCollapsed",
                [&](winrt::Microsoft::ReactNative::IJSValueWriter const& eventDataWriter) noexcept {});
        }
    }

    void ExpanderView::OnExpanding(winrt::Windows::Foundation::IInspectable const& sender,
                          Microsoft::UI::Xaml::Controls::ExpanderExpandingEventArgs const& args,
                          Microsoft::UI::Xaml::Controls::Expander const& expander) {
        if (!m_updating) {

            m_reactContext.DispatchEvent(
                expander,
                L"topExpanding",
                [&](winrt::Microsoft::ReactNative::IJSValueWriter const& eventDataWriter) noexcept {});

        }
    }

}
