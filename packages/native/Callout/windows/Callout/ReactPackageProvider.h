// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
#pragma once

#include "ReactPackageProvider.g.h"

using namespace winrt::Microsoft::ReactNative;

namespace winrt::FluentUI::Callout::implementation {

struct ReactPackageProvider : ReactPackageProviderT<ReactPackageProvider> {
  ReactPackageProvider() = default;

  void CreatePackage(IReactPackageBuilder const &packageBuilder) noexcept;
};

} // namespace winrt::FluentUI::Callout::implementation

namespace winrt::FluentUI::Callout::factory_implementation {

struct ReactPackageProvider
    : ReactPackageProviderT<ReactPackageProvider,
                            implementation::ReactPackageProvider> {};

} // namespace winrt::FluentUI::Callout::factory_implementation
