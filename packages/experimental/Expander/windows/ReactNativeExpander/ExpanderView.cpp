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
        this->VerticalContentAlignment(xaml::VerticalAlignment::Top);
        this->Content(expander);

        RegisterEvents();
    }

    void ExpanderView::RegisterEvents() {
        auto expander = this->Content().try_as<Microsoft::UI::Xaml::Controls::Expander>();

        m_expanderCollapsingRevoker = expander.Collapsed(winrt::auto_revoke,
            [ref = get_weak()](auto const& sender, auto const& args) {
            if (auto self = ref.get()) {
                self->OnCollapsing(sender, args);
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

        if (auto expander = this->Content().try_as<Microsoft::UI::Xaml::Controls::Expander>()) {
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
                    else if (expander.IsExpanded() != propertyValue.AsBoolean()) {
                        expander.IsExpanded(propertyValue.AsBoolean());
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
                        this->Width(propertyValue.AsDouble());
                    } else {
                      expander.ClearValue(xaml::FrameworkElement::WidthProperty());
                      this->ClearValue(xaml::FrameworkElement::WidthProperty());
                    }
                }
                else if (propertyName == "height") {
                    if (!propertyValue.IsNull()) {
                        expander.Height(propertyValue.AsDouble());
                        this->Height(propertyValue.AsDouble());
                    } else {
                      expander.ClearValue(xaml::FrameworkElement::HeightProperty());
                      this->ClearValue(xaml::FrameworkElement::HeightProperty());
                    }
                }
                else if (propertyName == "contentHorizontalAlignment") {
                    if (!propertyValue.IsNull()) {
                        auto alignment = propertyValue.AsString();
                        if (alignment == "center") {
                            expander.HorizontalContentAlignment(xaml::HorizontalAlignment::Center);
                        }
                        else if (alignment == "left") {
                            expander.HorizontalContentAlignment(xaml::HorizontalAlignment::Left);
                        }
                        else if (alignment == "right") {
                            expander.HorizontalContentAlignment(xaml::HorizontalAlignment::Right);
                        }
                        else if (alignment == "stretch") {
                            expander.HorizontalContentAlignment(xaml::HorizontalAlignment::Stretch);
                        }
                    } else {
                        expander.ClearValue(xaml::Controls::Control::HorizontalContentAlignmentProperty());
                    }
                }
                else if (propertyName == "contentVerticalAlignment") {
                    if (!propertyValue.IsNull()) {
                        auto alignment = propertyValue.AsString();
                        if (alignment == "bottom") {
                            expander.VerticalContentAlignment(xaml::VerticalAlignment::Bottom);
                        }
                        else if (alignment == "center") {
                            expander.VerticalContentAlignment(xaml::VerticalAlignment::Center);
                        }
                        else if (alignment == "stretch") {
                            expander.VerticalContentAlignment(xaml::VerticalAlignment::Stretch);
                        }
                        else if (alignment == "top") {
                            expander.VerticalContentAlignment(xaml::VerticalAlignment::Top);
                        }
                    } else {
                      expander.ClearValue(xaml::Controls::Control::VerticalContentAlignmentProperty());
                    }
                }
                else if (propertyName == "headerBackground") {
                    this->SetResourceColor(L"ExpanderHeaderBackground", propertyValue);
                }
                else if (propertyName == "headerForeground") {
                    this->SetResourceColor(L"ExpanderHeaderForeground", propertyValue);
                }
                else if (propertyName == "headerBorderThickness") {
                    auto resDict = expander.Resources();
                    if (!propertyValue.IsNull()) {
                        auto thickness = xaml::ThicknessHelper::FromUniformLength(propertyValue.AsDouble());
                        resDict.Insert(winrt::box_value(L"ExpanderHeaderBorderThickness"), winrt::box_value(thickness));
                    } else {
                        resDict.Remove(winrt::box_value(L"ExpanderHeaderBorderThickness"));
                    }
                    m_updateResDict = true;
                }
                else if (propertyName == "headerForegroundPointerOver") {
                    this->SetResourceColor(L"ExpanderHeaderForegroundPointerOver", propertyValue);
                }
                else if (propertyName == "headerForegroundPressed") {
                    this->SetResourceColor(L"ExpanderHeaderForegroundPressed", propertyValue);
                }
                else if (propertyName == "headerBorderBrush") {
                    this->SetResourceColor(L"ExpanderHeaderBorderBrush", propertyValue);
                }
                else if (propertyName == "headerBorderPointerOverBrush") {
                    this->SetResourceColor(L"ExpanderHeaderBorderPointerOverBrush", propertyValue);
                }
                else if (propertyName == "headerBorderPressedBrush") {
                    this->SetResourceColor(L"ExpanderHeaderBorderPressedBrush", propertyValue);
                }
                else if (propertyName == "headerDisabledForeground") {
                    this->SetResourceColor(L"ExpanderHeaderDisabledForeground", propertyValue);
                }
                else if (propertyName == "headerDisabledBorderBrush") {
                    this->SetResourceColor(L"ExpanderHeaderDisabledBorderBrush", propertyValue);
                }
                else if (propertyName == "contentBackground") {
                    this->SetResourceColor(L"ExpanderContentBackground", propertyValue);
                }
                else if (propertyName == "contentBorderBrush") {
                    this->SetResourceColor(L"ExpanderContentBorderBrush", propertyValue);
                }
                else if (propertyName == "chevronBackground") {
                    this->SetResourceColor(L"ExpanderChevronBackground", propertyValue);
                }
                else if (propertyName == "chevronForeground") {
                    this->SetResourceColor(L"ExpanderChevronForeground", propertyValue);
                }
                else if (propertyName == "chevronPointerOverBackground") {
                    this->SetResourceColor(L"ExpanderChevronPointerOverBackground", propertyValue);
                }
                else if (propertyName == "chevronPointerOverForeground") {
                    this->SetResourceColor(L"ExpanderChevronPointerOverForeground", propertyValue);
                }
                else if (propertyName == "chevronPressedBackground") {
                    this->SetResourceColor(L"ExpanderChevronPressedBackground", propertyValue);
                }
                else if (propertyName == "chevronPressedForeground") {
                    this->SetResourceColor(L"ExpanderChevronPressedForeground", propertyValue);
                }
                else if (propertyName == "chevronBorderThickness") {
                    auto resDict = expander.Resources();
                    if (!propertyValue.IsNull()) {
                        auto thickness = xaml::ThicknessHelper::FromUniformLength(propertyValue.AsDouble());
                        resDict.Insert(winrt::box_value(L"ExpanderChevronBorderThickness"), winrt::box_value(thickness));
                    } else {
                        resDict.Remove(winrt::box_value(L"ExpanderChevronBorderThickness"));
                    }
                    m_updateResDict = true;
                }
                else if (propertyName == "chevronBorderBrush") {
                    this->SetResourceColor(L"ExpanderChevronBorderBrush", propertyValue);
                }
                else if (propertyName == "chevronBorderPointerOverBrush") {
                    this->SetResourceColor(L"ExpanderChevronBorderPointerOverBrush", propertyValue);
                }
                else if (propertyName == "chevronBorderPressedBrush") {
                    this->SetResourceColor(L"ExpanderChevronBorderPressedBrush", propertyValue);
                }
            }
            if (m_updateResDict) {
                auto currTheme = expander.ActualTheme();
                if (currTheme == xaml::ElementTheme::Dark) {
                    expander.RequestedTheme(xaml::ElementTheme::Light);
                }
                else {
                    expander.RequestedTheme(xaml::ElementTheme::Dark);
                }
                expander.RequestedTheme(currTheme);
                m_updateResDict = false;
            }
        }
        m_updating = false;
    }

    void ExpanderView::SetResourceColor(hstring key, Microsoft::ReactNative::JSValue const& value) {
        if (auto expander = this->Content().try_as<Microsoft::UI::Xaml::Controls::Expander>()) {
            auto resDict = expander.Resources();
            if (!value.IsNull()) {
                auto color = value.To<winrt::Brush>();
                resDict.Insert(winrt::box_value(key), color);
            } else {
                resDict.Remove(winrt::box_value(key));
            }
            m_updateResDict = true;
        }
    }

    void ExpanderView::OnCollapsing(winrt::Windows::Foundation::IInspectable const& sender,
                          Microsoft::UI::Xaml::Controls::ExpanderCollapsedEventArgs const& args) {
        if (!m_updating) {
              m_reactContext.DispatchEvent(
                  *this,
                  L"topCollapsing",
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
