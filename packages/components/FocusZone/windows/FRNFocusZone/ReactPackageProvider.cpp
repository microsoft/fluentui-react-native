#include "pch.h"

#include "ReactPackageProvider.h"
#if __has_include("ReactPackageProvider.g.cpp")
#include "ReactPackageProvider.g.cpp"
#endif

#include "FocusZoneComponentView.h"

using namespace winrt::Microsoft::ReactNative;

namespace winrt::FRNFocusZone::implementation
{

void ReactPackageProvider::CreatePackage(IReactPackageBuilder const &packageBuilder) noexcept
{
#ifdef RNW_NEW_ARCH
  RegisterFocusZoneComponentView(packageBuilder);
#else
  UNREFERENCED_PARAMETER(packageBuilder);
#endif
}

} // namespace winrt::FRNFocusZone::implementation
