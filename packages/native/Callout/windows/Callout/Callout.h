// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
#pragma once

#include "pch.h"

#include "NativeModules.h"

#include "codegen/react/components/FRNCalloutSpec/Callout.g.h"

#include <winrt/Microsoft.ReactNative.Composition.Experimental.h>
#include <winrt/Microsoft.ReactNative.Composition.Input.h>
#include <winrt/Microsoft.ReactNative.Composition.h>
#include <winrt/Microsoft.ReactNative.h>
#include <winrt/Microsoft.UI.Composition.h>
#include <winrt/Microsoft.UI.Content.h>
#include <winrt/Microsoft.UI.interop.h>
#include <winrt/Windows.UI.h>

namespace winrt::FluentUI::Callout {

} // namespace winrt::FluentUI::Callout

void RegisterCalloutComponentView(
    winrt::Microsoft::ReactNative::IReactPackageBuilder const &packageBuilder);
