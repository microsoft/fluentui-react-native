// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import AppKit
import Foundation
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FocusZoneViewManager)
class FocusZoneViewManager: RCTViewManager {

	override func view() -> NSView! {
		return RCTFocusZone()
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}
}
