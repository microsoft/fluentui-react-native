#include "pch.h"

#include "ReactPackageProvider.h"
#if __has_include("ReactPackageProvider.g.cpp")
#include "ReactPackageProvider.g.cpp"
#endif

#include "components/Callout/Callout.h"
#include "components/FocusZone/FocusZoneComponentView.h"

using namespace winrt::Microsoft::ReactNative;

namespace winrt::FRNNativeCore::implementation
{

void ReactPackageProvider::CreatePackage(IReactPackageBuilder const &packageBuilder) noexcept
{
#ifdef RNW_NEW_ARCH
  AddAttributedModules(packageBuilder, true);
  RegisterCalloutComponentView(packageBuilder);
  RegisterFocusZoneComponentView(packageBuilder);
#else
  UNREFERENCED_PARAMETER(packageBuilder);
#endif
}

} // namespace winrt::FRNNativeCore::implementation
