// Copyright (c) 2018 Microsoft Corporation. All rights reserved.

#import "PLYCalloutWindow_mac.h"
#import "RCTCalloutView_mac.h"
#import "PLYCalloutProtocols.h"

@implementation PLYCalloutWindow {
  id _mouseEventMonitor;
}

- (instancetype)initWithContentRect:(NSRect)contentRect styleMask:(NSWindowStyleMask)style backing:(NSBackingStoreType)backingStoreType defer:(BOOL)flag {
  self = [super initWithContentRect:contentRect styleMask:style backing:backingStoreType defer:flag];
  if (self) {
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(appDidChangeActive:) name:NSApplicationDidResignActiveNotification
                                               object:nil];
    _mouseEventMonitor = [NSEvent addLocalMonitorForEventsMatchingMask:NSEventMaskLeftMouseUp handler:^NSEvent *(NSEvent * theEvent) {
      if ([theEvent window] != self) {
		[_calloutWindowLifeCycle didDetectHitOutsideCallout:self];
      }
      return theEvent;
    }];
  }
  return self;
}

- (void)dealloc {
  [[NSNotificationCenter defaultCenter] removeObserver:self
                                                  name:NSApplicationDidResignActiveNotification
                                                object:nil];
}

- (void)appDidChangeActive:(__unused NSNotification*)notification {
  [_calloutWindowLifeCycle applicationDidResignActiveForCalloutWindow:self];
}

@end
