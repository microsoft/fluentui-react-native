#include "pch.h"
#include "ExpanderViewManager.h"
#include "NativeModules.h"
#include "ExpanderView.h"

namespace winrt {
    using namespace Microsoft::ReactNative;
    using namespace Windows::Foundation::Collections;
}

namespace winrt::ReactNativeExpander::implementation {

    ExpanderViewManager::ExpanderViewManager() {}

    // IViewManager
    winrt::hstring ExpanderViewManager::Name() noexcept {
        return L"MSFExpanderView";
    }

    xaml::FrameworkElement ExpanderViewManager::CreateView() noexcept {
        return winrt::ReactNativeExpander::ExpanderView(m_reactContext);
    }

    // IViewManagerWithReactContext
    winrt::IReactContext ExpanderViewManager::ReactContext() noexcept {
        return m_reactContext;
    }

    void ExpanderViewManager::ReactContext(IReactContext reactContext) noexcept {
        m_reactContext = reactContext;
    }

    // IViewManagerWithNativeProperties
    IMapView<hstring, ViewManagerPropertyType> ExpanderViewManager::NativeProps() noexcept {
        auto nativeProps = winrt::single_threaded_map<hstring, ViewManagerPropertyType>();

        // TODO: finish updating props when Expander.types are further defined
        nativeProps.Insert(L"expandDirection", ViewManagerPropertyType::String);
        nativeProps.Insert(L"expanded", ViewManagerPropertyType::Boolean);
        nativeProps.Insert(L"headerRef", ViewManagerPropertyType::Number);
        nativeProps.Insert(L"contentRef", ViewManagerPropertyType::Number);
        nativeProps.Insert(L"enabled", ViewManagerPropertyType::Boolean);
        nativeProps.Insert(L"expanderStyle", ViewManagerPropertyType::String);
        nativeProps.Insert(L"accentColor", ViewManagerPropertyType::String);
        nativeProps.Insert(L"expandedHeight", ViewManagerPropertyType::Number);
        nativeProps.Insert(L"collapsedHeight", ViewManagerPropertyType::Number);

        return nativeProps.GetView();
    }

    void ExpanderViewManager::UpdateProperties(xaml::FrameworkElement const& view,
        IJSValueReader const& propertyMapReader) noexcept {
        if (auto expanderView = view.try_as<ExpanderView>()) {
           expanderView->UpdateProperties(propertyMapReader);
        }
        else {
           OutputDebugStringW(L"Type deduction for ExpanderView failed.");
        }
    }

    // IViewManagerWithExportedEventTypeConstants
    ConstantProviderDelegate ExpanderViewManager::ExportedCustomBubblingEventTypeConstants() noexcept {
        return nullptr;
    }

    ConstantProviderDelegate ExpanderViewManager::ExportedCustomDirectEventTypeConstants() noexcept {
        return [](winrt::IJSValueWriter const& constantWriter) {
            WriteCustomDirectEventTypeConstant(constantWriter, "onChange");
            WriteCustomDirectEventTypeConstant(constantWriter, L"Collapsed");
            WriteCustomDirectEventTypeConstant(constantWriter, L"Expanding");
        };
    }

    int32_t ExpanderViewManager::ReplaceChild(winrt::Windows::UI::Xaml::FrameworkElement const& parent, winrt::Windows::UI::Xaml::UIElement const& oldChild, winrt::Windows::UI::Xaml::UIElement const& newChild) noexcept {
        return 0;
    }

    void ExpanderViewManager::AddView(winrt::Windows::UI::Xaml::FrameworkElement const& parent, winrt::Windows::UI::Xaml::UIElement const& child, int64_t index) noexcept {
        auto contentPresenter = parent.try_as<winrt::Windows::UI::Xaml::Controls::ContentPresenter>();
        auto expanderWrapper = contentPresenter.Content();
        auto expander = expanderWrapper.try_as<Microsoft::UI::Xaml::Controls::Expander>();

        if (auto content = child.try_as<winrt::Windows::UI::Xaml::FrameworkElement>()) {
            if (index == 0) {
                expander.Header(content);
            }
            else if (index == 1) {
                expander.Content(content);
            }
            else {
                m_reactContext.CallJSFunction(
                    L"RCTLog",
                    L"logToConsole",
                    MakeJSValueArgWriter("warn", "React Native for Windows does not yet support nesting more than two components under <Expander>.\nThe first component will be the Expander header, and the second will be the Expander content."));
            }
        }
        else {
            m_reactContext.CallJSFunction(
                L"RCTLog",
                L"logToConsole",
                MakeJSValueArgWriter("warn", "React Native for Windows does not yet support nesting non-FrameworkElement components under <Expander>"));
        }

        return;
    }

    void ExpanderViewManager::RemoveAllChildren(winrt::Windows::UI::Xaml::FrameworkElement const& parent) noexcept {
        return;
    }

    void ExpanderViewManager::RemoveChildAt(winrt::Windows::UI::Xaml::FrameworkElement const& parent, int64_t index) noexcept {
        return;
    }
}