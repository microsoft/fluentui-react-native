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

        auto expander = (this->Content()).try_as<Microsoft::UI::Xaml::Controls::Expander>();

        m_expanderCollapsedRevoker = expander.Collapsed(winrt::auto_revoke,
            [ref = get_weak()](auto const& sender, auto const& args) {
            if (auto self = ref.get()) {
                self->OnCollapsed(sender, args);
            }
        });

        m_expanderExpandingRevoker = expander.Expanding(winrt::auto_revoke,
            [ref = get_weak()](auto const& sender, auto const& args) {
            if (auto self = ref.get()) {
                self->OnExpanding(sender, args);
            }
        });
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

                    m_expanded = false;
                }
                else if (expander.IsExpanded() != propertyValue.AsBoolean()) {

                    m_expanded = propertyValue.AsBoolean();

                    expander.IsExpanded(m_expanded);
                }
            }
            /*else if (propertyName == "headerRef") {
                if (propertyValue.IsNull()) {
                    expander.ClearValue(Microsoft::UI::Xaml::Controls::Expander::HeaderProperty());
                }
                else {
                    expander.Header(winrt::box_value(to_hstring(propertyValue.AsString())));
                }
            }*/
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
            else if (propertyName == "width") {
                if (!propertyValue.IsNull()) {
                    expander.Width(propertyValue.AsDouble());
                }
            }
            //else if (propertyName == "collapsedHeight") {
            //    if (!propertyValue.IsNull()) {
            //        m_collapsedHeight = propertyValue.AsInt64();

            //        this->Height(m_collapsedHeight);
            //    }
            //}
            //else if (propertyName == "expandedHeight") {
            //    if (!propertyValue.IsNull()) {
            //        m_expandedHeight = propertyValue.AsInt64();
            //    }
            //}
        }

        m_updating = false;
    }

    void ExpanderView::OnCollapsed(winrt::Windows::Foundation::IInspectable const& sender,
                          Microsoft::UI::Xaml::Controls::ExpanderCollapsedEventArgs const& args) {
        if (!m_updating) {

            m_reactContext.DispatchEvent(
                *this,
                L"topChange",
                [&](winrt::Microsoft::ReactNative::IJSValueWriter const& eventDataWriter) noexcept {
                    eventDataWriter.WriteObjectBegin();
                    {
                        WriteProperty(eventDataWriter, L"expanded", false);
                    }
                    eventDataWriter.WriteObjectEnd();
                });

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
                L"topChange",
                [&](winrt::Microsoft::ReactNative::IJSValueWriter const& eventDataWriter) noexcept {
                    eventDataWriter.WriteObjectBegin();
                    {
                        WriteProperty(eventDataWriter, L"expanded", true);
                    }
                    eventDataWriter.WriteObjectEnd();
                });

            m_reactContext.DispatchEvent(
                *this,
                L"topExpanding",
                [&](winrt::Microsoft::ReactNative::IJSValueWriter const& eventDataWriter) noexcept {});

        }
    }

}
