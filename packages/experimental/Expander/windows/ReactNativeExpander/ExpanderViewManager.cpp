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
        nativeProps.Insert(L"headerTitle", ViewManagerPropertyType::String);
        nativeProps.Insert(L"headerImage", ViewManagerPropertyType::String);
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

    int32_t ExpanderViewManager::ReplaceChild(winrt::Windows::UI::Xaml::FrameworkElement const& parent, winrt::Windows::UI::Xaml::UIElement const& oldChild, winrt::Windows::UI::Xaml::UIElement const& newChild) noexcept {
        return 0;
    }

    void ExpanderViewManager::AddView(winrt::Windows::UI::Xaml::FrameworkElement const& parent, winrt::Windows::UI::Xaml::UIElement const& child, int64_t index) noexcept {
        auto contentPresenter = parent.try_as<winrt::Windows::UI::Xaml::Controls::ContentPresenter>();
        auto expanderWrapper = contentPresenter.Content();
        auto expander = expanderWrapper.try_as<Microsoft::UI::Xaml::Controls::Expander>();

        if (auto content = child.try_as<winrt::Windows::UI::Xaml::FrameworkElement>()) {
            expander.Content(content);
        }
    //else {
    //    // #6315 Text can embed non-text elements. Fail gracefully instead of crashing if that happens
    //    textBlock.Inlines().InsertAt(static_cast<uint32_t>(index), winrt::Run());
    //    GetReactContext().CallJSFunction(
    //        "RCTLog",
    //        "logToConsole",
    //        folly::dynamic::array(
    //            "warn", "React Native for Windows does not yet support nesting non-Text components under <Text>"));
    //}

        return;
    }

    void ExpanderViewManager::RemoveAllChildren(winrt::Windows::UI::Xaml::FrameworkElement const& parent) noexcept {
        return;
    }

    void ExpanderViewManager::RemoveChildAt(winrt::Windows::UI::Xaml::FrameworkElement const& parent, int64_t index) noexcept {
        return;
    }

}