#import "RCTFocusZone.h"

// from <HIToolbox/Events.h>
enum {
	kVK_Tab                       = 0x30,
	kVK_LeftArrow                 = 0x7B,
	kVK_RightArrow                = 0x7C,
	kVK_DownArrow                 = 0x7D,
	kVK_UpArrow                   = 0x7E
};

typedef enum {
	FocusZoneActionNone,
	FocusZoneActionTab,
	FocusZoneActionShiftTab,
	FocusZoneActionRightArrow,
	FocusZoneActionLeftArrow,
	FocusZoneActionDownArrow,
	FocusZoneActionUpArrow,
} FocusZoneAction;

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

static void EnumerateFocusableViews(NSView *root, void (^block)(NSView *, BOOL *))
{
	NSMutableArray<NSView *> *queue = [NSMutableArray array];
	[queue addObject:root];

	while ([queue count] > 0)
	{
		NSView *view = [queue firstObject];
		[queue removeObjectAtIndex:0];

		if ([view canBecomeKeyView])
		{
			BOOL stop = NO;
			block(view, &stop);
			if (stop)
			{
				break;
			}
		}
		[queue addObjectsFromArray:[view subviews]];
	}
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

- (NSView *)getNextView:(BOOL)next toFocusInRowOrColumn:(BOOL)horizontal
{
	NSView *firstResponder = GetFirstResponder([self window]);
	NSRect firstResponderRect = [firstResponder convertRect:[firstResponder bounds] toView:self];

	__block NSView *viewToFocus = nil;
	__block CGFloat closestDistance = 1.0e+30;

	EnumerateFocusableViews(self, ^(NSView *candidateView, BOOL *stop)
	{
		BOOL skip = candidateView == firstResponder;
		NSRect candidateRect = [candidateView convertRect:[candidateView bounds] toView:self];
		BOOL subviewRelationExists = [candidateView isDescendantOf:firstResponder] || [firstResponder isDescendantOf:candidateView];

		if (horizontal)
		{
			if (subviewRelationExists)
			{
				skip = skip
					|| (next && NSMinX(candidateRect) < NSMinX(firstResponderRect))
					|| (!next && NSMaxX(candidateRect) > NSMaxX(firstResponderRect))
					|| NSMinY(candidateRect) > NSMaxY(firstResponderRect) - FocusZoneBuffer
					|| NSMaxY(candidateRect) < NSMinY(firstResponderRect) + FocusZoneBuffer;
			}
			else
			{
				skip = skip
					|| (next && NSMidX(candidateRect) < NSMidX(firstResponderRect))
					|| (!next && NSMidX(candidateRect) > NSMidX(firstResponderRect))
					|| NSMinY(candidateRect) > NSMaxY(firstResponderRect) - FocusZoneBuffer
					|| NSMaxY(candidateRect) < NSMinY(firstResponderRect) + FocusZoneBuffer;
			}
		}
		else
		{
			if (subviewRelationExists)
			{
				skip = skip
					|| (next && NSMinY(candidateRect) < NSMinY(firstResponderRect))
					|| (!next && NSMaxY(candidateRect) > NSMaxY(firstResponderRect))
					|| NSMaxX(candidateRect) < NSMinX(firstResponderRect) + FocusZoneBuffer
					|| NSMinX(candidateRect) > NSMaxX(firstResponderRect) - FocusZoneBuffer;
			}
			else
			{
				skip = skip
					|| (next && NSMidY(candidateRect) < NSMidY(firstResponderRect))
					|| (!next && NSMidY(candidateRect) > NSMidY(firstResponderRect))
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
				viewToFocus = candidateView;
			}
		}
	});

	return viewToFocus;
}

- (NSView *)getViewToFocusInNextRow:(BOOL)next
{
	NSView *firstResponder = GetFirstResponder([self window]);
	NSRect firstResponderRect = [firstResponder convertRect:[firstResponder bounds] toView:self];

	__block NSView *viewToFocus = nil;
	__block CGFloat closestDistance = 1.0e+30;

	NSRect selfBounds = [self bounds];
	NSPoint targetPoint = next
		? NSMakePoint(0, NSMaxY(firstResponderRect))
		: NSMakePoint(selfBounds.size.width, NSMinY(firstResponderRect));

	EnumerateFocusableViews(self, ^(NSView *candidateView, BOOL *stop)
	{
		NSRect candidateRect = [candidateView convertRect:[candidateView bounds] toView:self];

		BOOL skip = candidateView == firstResponder
			|| (next && NSMinY(candidateRect) < NSMaxY(firstResponderRect) - FocusZoneBuffer)
			|| (!next && NSMaxY(candidateRect) > NSMinY(firstResponderRect) + FocusZoneBuffer);

		if (!skip)
		{
			CGFloat distance = GetMinDistanceBetweenRectVerticesAndPoint(candidateRect, targetPoint);
			if (closestDistance > distance)
			{
				closestDistance = distance;
				viewToFocus = candidateView;
			}
		}
	});

	return viewToFocus;
}

- (NSView *)getNextViewToFocus:(BOOL)next horizontal:(BOOL)horizontal
{
	NSView *viewToFocus = [self getNextView:next toFocusInRowOrColumn:horizontal];

	if (viewToFocus == nil && horizontal)
	{
		viewToFocus = [self getViewToFocusInNextRow:next];
	}
	else if (viewToFocus == nil && !horizontal)
	{
		viewToFocus = [self getNextViewToFocus:next horizontal:YES];
	}

	return viewToFocus;
}

- (NSView *)getNextViewToFocusOutsideZone:(BOOL)next
{
	__block NSView *lastFocusableView = self;

	[[self window] recalculateKeyViewLoop];

	if (next)
	{
		EnumerateFocusableViews(self, ^(NSView *candidateView, BOOL *stop)
		{
			lastFocusableView = candidateView;
		});

		lastFocusableView = [lastFocusableView nextValidKeyView];
	}
	else
	{
		lastFocusableView = [self previousValidKeyView];
	}

	if ([lastFocusableView isDescendantOf:self])
	{
		lastFocusableView = nil;
	}

	return lastFocusableView;
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
		viewToFocus = [self getNextViewToFocusOutsideZone:action == FocusZoneActionTab];
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
		viewToFocus = [self getNextViewToFocus:action == FocusZoneActionRightArrow || action == FocusZoneActionDownArrow
									horizontal:action == FocusZoneActionRightArrow || action == FocusZoneActionLeftArrow];
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

@end
