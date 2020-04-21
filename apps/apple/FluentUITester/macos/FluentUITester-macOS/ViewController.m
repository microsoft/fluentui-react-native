#import "ViewController.h"
#import "AppDelegate.h"

#import <React/RCTRootView.h>

@implementation ViewController

- (void)loadView {
  id<NSApplicationDelegate> appDelegate = [NSApp delegate];
  if ([appDelegate isKindOfClass:[AppDelegate class]]) {
    RCTBridge *bridge = [((AppDelegate *)appDelegate) bridge];
    RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge moduleName:@"FluentUITester" initialProperties:nil];

    [self setView:rootView];
    [rootView addConstraint:[NSLayoutConstraint constraintWithItem:rootView attribute:NSLayoutAttributeWidth relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeNotAnAttribute multiplier:1.0 constant:500]];
    [rootView addConstraint:[NSLayoutConstraint constraintWithItem:rootView attribute:NSLayoutAttributeHeight relatedBy:NSLayoutRelationEqual toItem:nil attribute:NSLayoutAttributeNotAnAttribute multiplier:1.0 constant:700]];
    [rootView setAutoresizingMask:(NSViewMinXMargin | NSViewMinXMargin | NSViewMinYMargin | NSViewMaxYMargin | NSViewWidthSizable | NSViewHeightSizable)];
  }
}

@end
