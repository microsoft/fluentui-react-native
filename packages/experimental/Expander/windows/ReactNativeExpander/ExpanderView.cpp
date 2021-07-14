#include "pch.h"
#include "JSValueXaml.h"
#include "ExpanderView.h"
#include "ExpanderView.g.cpp"

#include <limits>
#include <stdexcept>

namespace winrt {
    using namespace Microsoft::ReactNative;
    using namespace Windows::Foundation;
    using namespace Windows::UI::Xaml::Media;
}

namespace winrt::ReactNativeExpander::implementation {

    ExpanderView::ExpanderView(winrt::IReactContext const& reactContext) : m_reactContext(reactContext) {
        auto expander = Microsoft::UI::Xaml::Controls::Expander();
        this->VerticalContentAlignment(Windows::UI::Xaml::VerticalAlignment::Top);
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
        auto expander = (this->Content()).try_as<Microsoft::UI::Xaml::Controls::Expander>();

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
            else if (propertyName == "enabled") {
                if (propertyValue.IsNull()) {
                    expander.IsEnabled(true);
                }
                else {
                    expander.IsEnabled(propertyValue.AsBoolean());
                }
            }
            else if (propertyName == "width") {
                if (!propertyValue.IsNull()) {
                    expander.Width(propertyValue.AsDouble());
                }
            }
            else if (propertyName == "height") {
                if (!propertyValue.IsNull()) {
                    expander.Height(propertyValue.AsDouble());
                }
            }
            else if (propertyName == "contentHorizontalAlignment") {
                if (!propertyValue.IsNull()) {
                    auto alignment = propertyValue.AsString();
                    if (alignment == "center") {
                        expander.HorizontalContentAlignment(Windows::UI::Xaml::HorizontalAlignment::Center);
                    }
                    else if (alignment == "left") {
                        expander.HorizontalContentAlignment(Windows::UI::Xaml::HorizontalAlignment::Left);
                    }
                    else if (alignment == "right") {
                        expander.HorizontalContentAlignment(Windows::UI::Xaml::HorizontalAlignment::Right);
                    }
                    else if (alignment == "stretch") {
                        expander.HorizontalContentAlignment(Windows::UI::Xaml::HorizontalAlignment::Stretch);
                    }
                }
            }
            else if (propertyName == "contentVerticalAlignment") {
                if (!propertyValue.IsNull()) {
                    auto alignment = propertyValue.AsString();
                    if (alignment == "bottom") {
                        expander.VerticalContentAlignment(Windows::UI::Xaml::VerticalAlignment::Bottom);
                    }
                    else if (alignment == "center") {
                        expander.VerticalContentAlignment(Windows::UI::Xaml::VerticalAlignment::Center);
                    }
                    else if (alignment == "stretch") {
                        expander.VerticalContentAlignment(Windows::UI::Xaml::VerticalAlignment::Stretch);
                    }
                    else if (alignment == "top") {
                        expander.VerticalContentAlignment(Windows::UI::Xaml::VerticalAlignment::Top);
                    }
                }
            }
            else if (propertyName == "headerBackground") {
                this->SetResourceColor(propertyValue, L"ExpanderHeaderBackground");
            }
            else if (propertyName == "headerForeground") {
                this->SetResourceColor(propertyValue, L"ExpanderHeaderForeground");
            }
            else if (propertyName == "headerBorderThickness") {
                if (!propertyValue.IsNull()) {
                    auto resDict = expander.Resources();
                    Windows::UI::Xaml::Thickness thickness = Windows::UI::Xaml::ThicknessHelper::FromUniformLength(propertyValue.AsDouble());
                    resDict.Insert(winrt::box_value(L"ExpanderHeaderBorderThickness"), winrt::box_value(thickness));
                }
            }
            else if (propertyName == "headerForegroundPointerOver") {
                this->SetResourceColor(propertyValue, L"ExpanderHeaderForegroundPointerOver");
            }
            else if (propertyName == "headerForegroundPressed") {
                this->SetResourceColor(propertyValue, L"ExpanderHeaderForegroundPressed");
            }
            else if (propertyName == "headerBorderBrush") {
                this->SetResourceColor(propertyValue, L"ExpanderHeaderBorderBrush");
            }
            else if (propertyName == "headerBorderPointerOverBrush") {
                this->SetResourceColor(propertyValue, L"ExpanderHeaderBorderPointerOverBrush");
            }
            else if (propertyName == "headerBorderPressedBrush") {
                this->SetResourceColor(propertyValue, L"ExpanderHeaderBorderPressedBrush");
            }
            else if (propertyName == "headerDisabledForeground") {
                this->SetResourceColor(propertyValue, L"ExpanderHeaderDisabledForeground");
            }
            else if (propertyName == "headerDisabledBorderBrush") {
                this->SetResourceColor(propertyValue, L"ExpanderHeaderDisabledBorderBrush");
            }
            else if (propertyName == "contentBackground") {
                this->SetResourceColor(propertyValue, L"ExpanderContentBackground");
            }
            else if (propertyName == "contentBorderBrush") {
                this->SetResourceColor(propertyValue, L"ExpanderContentBorderBrush");
            }
            else if (propertyName == "chevronBackground") {
                this->SetResourceColor(propertyValue, L"ExpanderChevronBackground");
            }
            else if (propertyName == "chevronForeground") {
                this->SetResourceColor(propertyValue, L"ExpanderChevronForeground");
            }
            else if (propertyName == "chevronPointerOverBackground") {
                this->SetResourceColor(propertyValue, L"ExpanderChevronPointerOverBackground");
            }
            else if (propertyName == "chevronPointerOverForeground") {
                this->SetResourceColor(propertyValue, L"ExpanderChevronPointerOverForeground");
            }
            else if (propertyName == "chevronPressedBackground") {
                this->SetResourceColor(propertyValue, L"ExpanderChevronPressedBackground");
            }
            else if (propertyName == "chevronPressedForeground") {
                this->SetResourceColor(propertyValue, L"ExpanderChevronPressedForeground");
            }
            else if (propertyName == "chevronBorderThickness") {
                if (!propertyValue.IsNull()) {
                    auto resDict = expander.Resources();
                    Windows::UI::Xaml::Thickness thickness = Windows::UI::Xaml::ThicknessHelper::FromUniformLength(propertyValue.AsDouble());
                    resDict.Insert(winrt::box_value(L"ExpanderChevronBorderThickness"), winrt::box_value(thickness));
                }
            }
            else if (propertyName == "chevronBorderBrush") {
                this->SetResourceColor(propertyValue, L"ExpanderChevronBorderBrush");
            }
            else if (propertyName == "chevronBorderPointerOverBrush") {
                this->SetResourceColor(propertyValue, L"ExpanderChevronBorderPointerOverBrush");
            }
            else if (propertyName == "chevronBorderPressedBrush") {
                this->SetResourceColor(propertyValue, L"ExpanderChevronBorderPressedBrush");
            }
        }
        m_updating = false;
    }

    void ExpanderView::SetResourceColor(Microsoft::ReactNative::JSValue const& value, hstring key) {
        if (!value.IsNull()) {
            auto expander = (this->Content()).try_as<Microsoft::UI::Xaml::Controls::Expander>();
            auto color = value.To<winrt::Brush>();
            auto resDict = expander.Resources();
            resDict.Insert(winrt::box_value(key), color);
        }
    }

    void ExpanderView::OnCollapsed(winrt::Windows::Foundation::IInspectable const& sender,
                          Microsoft::UI::Xaml::Controls::ExpanderCollapsedEventArgs const& args) {
        if (!m_updating) {
            m_reactContext.DispatchEvent(
                *this,
                L"topCollapsed",
                [&](winrt::Microsoft::ReactNative::IJSValueWriter const& eventDataWriter) noexcept {});
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
