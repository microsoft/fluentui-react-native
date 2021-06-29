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

        auto expander = Microsoft::UI::Xaml::Controls::Expander();
        this->Content(expander);

        RegisterEvents();
    }

    void ExpanderView::RegisterEvents() {
        // TODO: this might now work, need to access the content here (Expander)
        auto expander = (this->Content()).try_as<Microsoft::UI::Xaml::Controls::Expander>();

        //m_expanderCollapsedRevoker = expander.Collapsed(winrt::auto_revoke,
        //    [ref = get_weak()](auto const& sender, auto const& args) {
        //    if (auto self = ref.get()) {
        //        // TODO: issue here - pass in self as an argument to the OnCollapsed method
        //        self->OnCollapsed(sender, args);
        //    }
        //});

        //m_expanderExpandingRevoker = expander.Expanding(winrt::auto_revoke,
        //    [ref = get_weak()](auto const& sender, auto const& args) {
        //    if (auto self = ref.get()) {
        //        // TODO: issue here - pass in self as an argument to the OnExpanding method
        //        self->OnExpanding(sender, args);
        //    }
        //});
    }

    void ExpanderView::UpdateProperties(winrt::IJSValueReader const& reader) {
        m_updating = true;

        auto const& propertyMap = JSValueObject::ReadFrom(reader);
        auto content = this->Content();
        auto expander = content.try_as<Microsoft::UI::Xaml::Controls::Expander>();

        for (auto const& pair : propertyMap) {
            auto const& propertyName = pair.first;
            auto const& propertyValue = pair.second;

            if (propertyName == "expandDirection") {
                if (propertyValue.IsNull()) {
                    expander.ClearValue(Microsoft::UI::Xaml::Controls::Expander::ExpandDirectionProperty());
                }
                else {
                    auto direction = propertyValue.AsString();

                    if (direction == "up") {
                        expander.ExpandDirection(Microsoft::UI::Xaml::Controls::ExpandDirection::Up);
                    }
                    else {
                        expander.ExpandDirection(Microsoft::UI::Xaml::Controls::ExpandDirection::Down);
                    }
                }
            }
            else if (propertyName == "expanded") {
                if (propertyValue.IsNull()) {
                    expander.ClearValue(Microsoft::UI::Xaml::Controls::Expander::IsExpandedProperty());
                }
                else {
                    expander.IsExpanded(propertyValue.AsBoolean());
                }
            }
            else if (propertyName == "headerTitle") {
                if (propertyValue.IsNull()) {
                    expander.ClearValue(Microsoft::UI::Xaml::Controls::Expander::HeaderProperty());
                }
                else {
                    expander.Header(winrt::box_value(to_hstring(propertyValue.AsString())));
                }
            }
            else if (propertyName == "headerImage") {
                // do stuff
            }
            else if (propertyName == "enabled") {
                if (propertyValue.IsNull()) {
                    expander.IsEnabled(true);
                }
                else {
                    expander.IsEnabled(propertyValue.AsBoolean());
                }
            }
            else if (propertyName == "expanderStyle") {
                // do stuff
            }
            else if (propertyName == "accentColor") {
                // do stuff
            }
        }

        m_updating = false;
    }

    void ExpanderView::OnCollapsed(winrt::Windows::Foundation::IInspectable const& sender,
                          Microsoft::UI::Xaml::Controls::ExpanderCollapsedEventArgs const& args) {
        if (!m_updating) {

            m_reactContext.DispatchEvent(
                *this,
                L"topCollapsed",
                [&](winrt::Microsoft::ReactNative::IJSValueWriter const& eventDataWriter) noexcept {});
        }
    }

    void ExpanderView::OnExpanding(winrt::Windows::Foundation::IInspectable const& sender,
                          Microsoft::UI::Xaml::Controls::ExpanderExpandingEventArgs const& args) {
        if (!m_updating) {

            m_reactContext.DispatchEvent(
                *this,
                L"topExpanding",
                [&](winrt::Microsoft::ReactNative::IJSValueWriter const& eventDataWriter) noexcept {});

        }
    }

}
