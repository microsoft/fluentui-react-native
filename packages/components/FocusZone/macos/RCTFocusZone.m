#import "KeyCodes.h"
#import "RCTFocusZone.h"

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

static inline NSPoint GetCenterOfRect(NSRect rect)
{
	return NSMakePoint(NSMidX(rect), NSMidY(rect));
}

static inline CGFloat GetDistanceBetweenCentersOfRects(NSRect rect1, NSRect rect2)
{
	return GetDistanceBetweenPoints(GetCenterOfRect(rect1), GetCenterOfRect(rect2));
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

static NSView *GetFirstResponder(NSWindow *window)
{
	NSResponder *responder = [window firstResponder];
	while (responder != nil && ![responder isKindOfClass:[NSView class]])
		responder = [responder nextResponder];
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

static BOOL IsAdvanceWithinZoneAction(FocusZoneAction action)
{
	return action == FocusZoneActionRightArrow || action == FocusZoneActionDownArrow;
}

static BOOL IsHorizontalNavigationWithinZoneAction(FocusZoneAction action)
{
	return action == FocusZoneActionRightArrow || action == FocusZoneActionLeftArrow;
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

		if ([candidateView canBecomeKeyView] && isLeadingCandidate(candidateView))
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

	__block CGFloat closestDistance = CGFLOAT_MAX;

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
			CGFloat distance = GetDistanceBetweenCentersOfRects(firstResponderRect, candidateRect);
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

	if (action == FocusZoneActionTab)  // Advance to next zone
	{
		IsViewLeadingCandidateForNextFocus block = ^BOOL(NSView *candidateView)
		{
			return YES;
		};

		nextViewToFocus = [([self nextViewToFocusForCondition:block] ?: self) nextValidKeyView];
	}
	else
	{
		nextViewToFocus = [self previousValidKeyView];
	}

	if ([nextViewToFocus isDescendantOf:self])
	{
		nextViewToFocus = nil;
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
		// do nothing
	}
	else
	{
		viewToFocus = [self nextViewToFocusWithFallback:action];
	}

	if (passthrough)
	{
		[super keyDown:event];
	}
	else if (viewToFocus != nil)
	{
		[[self window] makeFirstResponder:viewToFocus];
	}
	else
	{
		NSBeep();
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
