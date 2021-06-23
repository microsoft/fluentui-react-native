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

        // TODO: finish updating props when Expander.types are furhter defined
        // TODO: specifically, need to update header and content
        nativeProps.Insert(L"expandDirection", ViewManagerPropertyType::String);
        nativeProps.Insert(L"expanded", ViewManagerPropertyType::Boolean);
        nativeProps.Insert(L"header", ViewManagerPropertyType::String);
        nativeProps.Insert(L"content", ViewManagerPropertyType::String);
        nativeProps.Insert(L"enabled", ViewManagerPropertyType::Boolean);
        nativeProps.Insert(L"expanderStyle", ViewManagerPropertyType::String);
        nativeProps.Insert(L"accentColor", ViewManagerPropertyType::String);

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
            WriteCustomDirectEventTypeConstant(constantWriter, L"topCollapsed");
            WriteCustomDirectEventTypeConstant(constantWriter, L"topExpanding");
        };
    }

}