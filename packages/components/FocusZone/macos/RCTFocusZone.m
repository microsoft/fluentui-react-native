#import "KeyCodes.h"
#import "RCTFocusZone.h"
#import "RCTi18nUtil.h"

typedef enum {
	FocusZoneActionNone,
	FocusZoneActionTab,
	FocusZoneActionShiftTab,
	FocusZoneActionRightArrow,
	FocusZoneActionLeftArrow,
	FocusZoneActionDownArrow,
	FocusZoneActionUpArrow,
} FocusZoneAction;

typedef BOOL (^IsViewLeadingCandidateForNextFocus)(NSView *candidateView);

// Maximum vertical (or horizontal) displacement for a candidate view to be
// enumerated in the same row (or column) as the current focused view
static const CGFloat FocusZoneBuffer = 3;

@implementation RCTFocusZone

static inline CGFloat GetDistanceBetweenPoints(NSPoint point1, NSPoint point2)
{
	NSPoint delta = NSMakePoint(point1.x - point2.x, point1.y - point2.y);
	return sqrt(delta.x * delta.x + delta.y * delta.y);
}

static inline CGFloat GetDistanceBetweenRects(NSRect rect1, NSRect rect2)
{
	// Get the top left corner of the rect, top right in RTL
	bool isRTL = [[RCTI18nUtil sharedInstance] isRTL];

	CGFloat rect1Offset = isRTL ? rect1.size.width : 0;
	CGFloat rect2Offset = isRTL ? rect2.size.width : 0;
	
	NSPoint rect1Corner = NSMakePoint(rect1.origin.x + rect1Offset , rect1.origin.y);
	NSPoint rect2Corner = NSMakePoint(rect2.origin.x + rect2Offset , rect2.origin.y);

	return GetDistanceBetweenPoints(rect1Corner, rect2Corner);
}

static inline CGFloat GetMinDistanceBetweenRectVerticesAndPoint(NSRect rect, NSPoint point)
{
	return fmin(
		fmin(GetDistanceBetweenPoints(point, NSMakePoint(NSMinX(rect), NSMinY(rect))),
			GetDistanceBetweenPoints(point, NSMakePoint(NSMaxX(rect), NSMaxY(rect)))),
		fmin(GetDistanceBetweenPoints(point, NSMakePoint(NSMaxX(rect), NSMinY(rect))),
			GetDistanceBetweenPoints(point, NSMakePoint(NSMinX(rect), NSMaxY(rect))))
	);
}

/// Performs a depth first search looking for the first key view in a parent view's view hierarchy.
/// This function does not take into account the geometric position of the view.
static NSView *GetFirstKeyViewWithin(NSView *parentView)
{
    if ([[parentView subviews] count] < 1)
    {
        return nil;
    }

	for (NSView *view in [parentView subviews]) {
		if ([view canBecomeKeyView]) {
			return view;
		}

		NSView *match = GetFirstKeyViewWithin(view);
		if (match) {
			return match;
		}
	}
	return nil;
}

/// Performs a depth first search looking for the last key view in a parent view's view hierarchy.
/// We find the last view by simply reversing the order of the subview array.
/// This function does not take into account the geometric position of the view.
static NSView *GetLastKeyViewWithin(NSView *parentView)
{
	for (NSView *view in [[parentView subviews] reverseObjectEnumerator]) {
		if ([view canBecomeKeyView]) {
			return view;
		}

		NSView *match = GetLastKeyViewWithin(view);
		if (match) {
			return match;
		}
	}
	return nil;
}

static NSView *GetFirstResponder(NSWindow *window)
{
	NSResponder *responder = [window firstResponder];
	while (responder != nil && ![responder isKindOfClass:[NSView class]])
	{
		responder = [responder nextResponder];
	}
	return [responder isKindOfClass:[NSView class]] ? (NSView *)responder : nil;
}

static FocusZoneAction GetActionForEvent(NSEvent *event)
{
	FocusZoneAction action = FocusZoneActionNone;

	NSEventModifierFlags modifierFlags = [event modifierFlags]
		& (NSEventModifierFlagShift | NSEventModifierFlagControl
			| NSEventModifierFlagOption | NSEventModifierFlagCommand);

	switch ([event keyCode])
	{
		case kVK_UpArrow:
			action = FocusZoneActionUpArrow;
			break;

		case kVK_DownArrow:
			action = FocusZoneActionDownArrow;
			break;

		case kVK_LeftArrow:
			action = FocusZoneActionLeftArrow;
			break;

		case kVK_RightArrow:
			action = FocusZoneActionRightArrow;
			break;

		case kVK_Tab:
			if (modifierFlags == 0)
			{
				action = FocusZoneActionTab;
				break;
			}
			else if (modifierFlags == NSEventModifierFlagShift)
			{
				action = FocusZoneActionShiftTab;
				break;
			}
	}

	return action;
}

static inline BOOL IsAdvanceWithinZoneAction(FocusZoneAction action)
{
	return action == FocusZoneActionRightArrow || action == FocusZoneActionDownArrow;
}

static inline BOOL IsHorizontalNavigationWithinZoneAction(FocusZoneAction action)
{
	return action == FocusZoneActionRightArrow || action == FocusZoneActionLeftArrow;
}

/// Returns the topmost view of the given view's superview heirarchy that is a FocusZone.
/// Returns nil if no FocusZone is found.
static RCTFocusZone *GetFocusZoneAncestor(NSView *view)
{
	NSView *candidateView = view;
	NSView *topLevelView = [[view window] contentView];
	RCTFocusZone *focusZoneAncestor = nil;
	while (candidateView != nil && candidateView != topLevelView)
	{
		if ([candidateView isKindOfClass:[RCTFocusZone class]])
		{
			focusZoneAncestor = (RCTFocusZone *)candidateView;
		}
		candidateView = [candidateView superview];
	}
	return focusZoneAncestor;
}

/// Bypass FocusZone if it's empty or has no focusable elements
static BOOL ShouldSkipFocusZone(NSView *view)
{
	if([view isKindOfClass:[RCTFocusZone class]])
	{
		NSView *keyView = GetFirstKeyViewWithin(view);
		// FocusZone is empty or has no focusable elements
		if (keyView == nil)
		{
			return YES;
		}
	}

	return NO;
}

/// Accept firstResponder on FocusZone itself in order to reassign it within the FocusZone.
- (BOOL)acceptsFirstResponder
{
    // Reject first responder if FocusZone is disabled or should be skipped.
    return !_disabled && !ShouldSkipFocusZone(self);
}

- (BOOL)becomeFirstResponder
{
	NSView *keyView = _defaultKeyView ?: GetFirstKeyViewWithin(self);
	return !_disabled && [[self window] makeFirstResponder:keyView];
}

- (NSView *)nextViewToFocusForCondition:(IsViewLeadingCandidateForNextFocus)isLeadingCandidate
{
	NSView *nextViewToFocus;
	NSMutableArray<NSView *> *queue = [NSMutableArray array];
	[queue addObject:self];

	while ([queue count] > 0)
	{
		NSView *candidateView = [queue firstObject];
		[queue removeObjectAtIndex:0];

		if ([candidateView isNotEqualTo:self] && [candidateView canBecomeKeyView] && isLeadingCandidate(candidateView))
		{
			nextViewToFocus = candidateView;
		}
		[queue addObjectsFromArray:[candidateView subviews]];
	}

	return nextViewToFocus;
}

- (NSView *)nextViewToFocusForAction:(FocusZoneAction)action
{
	BOOL isAdvance = IsAdvanceWithinZoneAction(action);
	BOOL isHorizontal = IsHorizontalNavigationWithinZoneAction(action);

	NSView *firstResponder = GetFirstResponder([self window]);
	NSRect firstResponderRect = [firstResponder convertRect:[firstResponder bounds] toView:self];
	NSScrollView * firstResponderEnclosingScrollView = [firstResponder enclosingScrollView];

	__block CGFloat closestDistance = CGFLOAT_MAX;
	__block CGFloat closestDistanceWithinEnclosingScrollView = CGFLOAT_MAX;

	IsViewLeadingCandidateForNextFocus block = ^BOOL(NSView *candidateView)
	{
		BOOL isLeadingCandidate = NO;
		BOOL skip = candidateView == firstResponder;
		NSRect candidateRect = [candidateView convertRect:[candidateView bounds] toView:self];
		BOOL subviewRelationExists = [candidateView isDescendantOf:firstResponder] || [firstResponder isDescendantOf:candidateView];

		if (isHorizontal)
		{
			if (subviewRelationExists)
			{
				skip = skip
					|| (isAdvance && NSMinX(candidateRect) < NSMinX(firstResponderRect))
					|| (!isAdvance && NSMaxX(candidateRect) > NSMaxX(firstResponderRect))
					|| NSMinY(candidateRect) > NSMaxY(firstResponderRect) - FocusZoneBuffer
					|| NSMaxY(candidateRect) < NSMinY(firstResponderRect) + FocusZoneBuffer;
			}
			else
			{
				skip = skip
					|| (isAdvance && NSMidX(candidateRect) < NSMidX(firstResponderRect))
					|| (!isAdvance && NSMidX(candidateRect) > NSMidX(firstResponderRect))
					|| NSMinY(candidateRect) > NSMaxY(firstResponderRect) - FocusZoneBuffer
					|| NSMaxY(candidateRect) < NSMinY(firstResponderRect) + FocusZoneBuffer;
			}
		}
		else
		{
			if (subviewRelationExists)
			{
				skip = skip
					|| (isAdvance && NSMinY(candidateRect) < NSMinY(firstResponderRect))
					|| (!isAdvance && NSMaxY(candidateRect) > NSMaxY(firstResponderRect))
					|| NSMaxX(candidateRect) < NSMinX(firstResponderRect) + FocusZoneBuffer
					|| NSMinX(candidateRect) > NSMaxX(firstResponderRect) - FocusZoneBuffer;
			}
			else
			{
				skip = skip
					|| (isAdvance && NSMidY(candidateRect) < NSMidY(firstResponderRect))
					|| (!isAdvance && NSMidY(candidateRect) > NSMidY(firstResponderRect))
					|| NSMaxX(candidateRect) < NSMinX(firstResponderRect) + FocusZoneBuffer
					|| NSMinX(candidateRect) > NSMaxX(firstResponderRect) - FocusZoneBuffer;
			}
		}

		if (!skip)
		{
			CGFloat distance = GetDistanceBetweenRects(firstResponderRect, candidateRect);
			
			// If there are other candidate views inside the same ScrollView as the firstResponder,
			// prefer those views over other views outside the scrollview, even if they are closer.
			if ([firstResponderEnclosingScrollView isEqualTo:[candidateView enclosingScrollView]])
			{
				if (closestDistanceWithinEnclosingScrollView > distance)
				{
					closestDistanceWithinEnclosingScrollView = distance;
					isLeadingCandidate = YES;
				}
			}
			else
			{
				if (closestDistance > distance)
				{
					closestDistance = distance;
					isLeadingCandidate = YES;
				}
			}
		}

		return isLeadingCandidate;
	};

	return [self nextViewToFocusForCondition:block];
}

- (NSView *)nextViewToFocusForHorizontalNavigation:(FocusZoneAction)action
{
	BOOL isAdvance = IsAdvanceWithinZoneAction(action);

	NSView *firstResponder = GetFirstResponder([self window]);
	NSRect firstResponderRect = [firstResponder convertRect:[firstResponder bounds] toView:self];

	__block CGFloat closestDistance = CGFLOAT_MAX;

	NSRect selfBounds = [self bounds];
	NSPoint targetPoint = isAdvance
		? NSMakePoint(0, NSMaxY(firstResponderRect))
		: NSMakePoint(selfBounds.size.width, NSMinY(firstResponderRect));

	IsViewLeadingCandidateForNextFocus block = ^BOOL(NSView *candidateView)
	{
		BOOL isLeadingCandidate = NO;
		NSRect candidateRect = [candidateView convertRect:[candidateView bounds] toView:self];

		BOOL skip = candidateView == firstResponder
			|| (isAdvance && NSMinY(candidateRect) < NSMaxY(firstResponderRect) - FocusZoneBuffer)
			|| (!isAdvance && NSMaxY(candidateRect) > NSMinY(firstResponderRect) + FocusZoneBuffer);

		if (!skip)
		{
			CGFloat distance = GetMinDistanceBetweenRectVerticesAndPoint(candidateRect, targetPoint);
			if (closestDistance > distance)
			{
				closestDistance = distance;
				isLeadingCandidate = YES;
			}
		}

		return isLeadingCandidate;
	};

	return [self nextViewToFocusForCondition:block];
}

- (NSView *)nextViewToFocusWithFallback:(FocusZoneAction)action
{

	// Special case if we're currently focused on self
	NSView *firstResponder = GetFirstResponder([self window]);
	if (self == firstResponder)
	{
		if (action == FocusZoneActionDownArrow)
		{
			return GetFirstKeyViewWithin(self);
		}
		else if (action == FocusZoneActionUpArrow)
		{
			return GetLastKeyViewWithin(self);
		}
	}

	NSView *nextViewToFocus = [self nextViewToFocusForAction:action];

	if (nextViewToFocus == nil)
	{
		if (IsHorizontalNavigationWithinZoneAction(action))
		{
			nextViewToFocus = [self nextViewToFocusForHorizontalNavigation:action];
		}
		else
		{
			FocusZoneAction horizontalAction = IsAdvanceWithinZoneAction(action) ? FocusZoneActionRightArrow : FocusZoneActionLeftArrow;
			nextViewToFocus = [self nextViewToFocusWithFallback:horizontalAction];
		}
	}

	return nextViewToFocus;
}

- (NSView *)nextViewToFocusOutsideZone:(FocusZoneAction)action
{
	NSView *nextViewToFocus;

	[[self window] recalculateKeyViewLoop];
	
	// Find the first view outside the FocusZone (or any parent FocusZones) to place focus
	RCTFocusZone *focusZoneAncestor = GetFocusZoneAncestor(self);

	if (action == FocusZoneActionTab)  // Advance to next zone
	{
		nextViewToFocus = [self nextValidKeyView];
		while([nextViewToFocus isDescendantOf:focusZoneAncestor])
		{
			// there are no views left in the key view loop
			if ([nextViewToFocus isEqual:focusZoneAncestor])
			{
				nextViewToFocus = nil;
				break;
			}
			nextViewToFocus = [nextViewToFocus nextValidKeyView];
		}
	}
	else if (action == FocusZoneActionShiftTab)
	{
		nextViewToFocus = [self previousValidKeyView];
		while([nextViewToFocus isDescendantOf:focusZoneAncestor])
		{
			// there are no views left in the key view loop
			if ([nextViewToFocus isEqual:focusZoneAncestor])
			{
				nextViewToFocus = nil;
				break;
			}
			nextViewToFocus = [nextViewToFocus previousValidKeyView];
		}
		
		// If the previous view is in a FocusZone, focus on its defaultKeyView
		// (For FocusZoneActionTab, this is handled by becomeFirstResponder).
		RCTFocusZone *focusZoneAncestor = GetFocusZoneAncestor(nextViewToFocus);
		NSView *ancestorKeyView = [focusZoneAncestor defaultKeyView];
		if (ancestorKeyView != nil) {
			nextViewToFocus = [focusZoneAncestor defaultKeyView];
		}
	}

	return nextViewToFocus;
}

- (BOOL)isFlipped
{
	return YES;
}

- (void)keyDown:(NSEvent *)event
{
	FocusZoneAction action = GetActionForEvent(event);
	FocusZoneDirection focusZoneDirection = [self focusZoneDirection];

	BOOL passthrough = NO;
	NSView *viewToFocus = nil;

	if ([self disabled] || action == FocusZoneActionNone)
	{
		passthrough = YES;
	}
	else if (action == FocusZoneActionTab || action == FocusZoneActionShiftTab)
	{
		viewToFocus = [self nextViewToFocusOutsideZone:action];
	}
	else if ((focusZoneDirection == FocusZoneDirectionVertical
			&& (action == FocusZoneActionRightArrow || action == FocusZoneActionLeftArrow))
		|| (focusZoneDirection == FocusZoneDirectionHorizontal
			&& (action == FocusZoneActionUpArrow || action == FocusZoneActionDownArrow))
		|| (focusZoneDirection == FocusZoneDirectionNone))
	{
		passthrough = YES;
	}
	else
	{
		viewToFocus = [self nextViewToFocusWithFallback:action];
	}

	if (viewToFocus != nil)
	{
		[[self window] makeFirstResponder:viewToFocus];
		[viewToFocus scrollRectToVisible:[viewToFocus bounds]];
	}
	else if (passthrough)
	{
		// Only call super if we explicitly want to passthrough the event
		// I.E: FocusZone don't handle this specific key
		[super keyDown:event];
	}
}

- (void)setNavigateAtEnd:(NSString *)value
{
	// do nothing
}

- (NSString *)navigateAtEnd
{
	return @"NavigateStopAtEnds";
}

@end
