#include "pch.h"
#include "ReactPackageProvider.h"
#if __has_include("ReactPackageProvider.g.cpp")
#include "ReactPackageProvider.g.cpp"
#endif

#include "ExpanderViewManager.h"

using namespace winrt::Microsoft::ReactNative;

namespace winrt::ReactNativeExpander::implementation
{

void ReactPackageProvider::CreatePackage(IReactPackageBuilder const &packageBuilder) noexcept
{
    packageBuilder.AddViewManager(L"ExpanderViewManager", []() { return winrt::make<ExpanderViewManager>(); });
}

} // namespace winrt::ReactNativeExpander::implementation
