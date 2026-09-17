# Popover interaction

## Activation

The trigger is a React Native `Pressable`. Pointer, touch, and platform keyboard activation all produce a press, and a press toggles the open value. A disabled trigger does not activate and cannot open the popover. A consumer `onPress` supplied on the `trigger` slot runs after the component's own toggle, so it observes the interaction without competing for ownership of the state.

Trigger hover, press, and focus are tracked so that styling and the focus visual can react to them. `focused` can force the focus visual for an instance, which is how a story or a test pins the visual without driving real focus.

## Placement

`position` is a preferred anchor edge, not an exact position. Popover passes it to the native surface as a directional hint and adopts the platform result.

On Windows the full directional-hint union is meaningful. On macOS every hint collapses onto one of four screen edges, so alignment variants on the same side are indistinguishable and a surface below the anchor is leading-aligned to the trigger. The default, `bottomLeftEdge`, is the placement both platforms produce for that case in a left-to-right layout.

Viewport containment is native best effort. macOS flips to the opposite side when that side has more room and slides along the cross axis for selected overflow cases, but it does not guarantee that the whole surface is on screen, and Windows does not reposition. Popover does not measure or clamp the surface itself.

## Dismissal

Both platforms dismiss the surface on a light-dismiss interaction outside it and raise the native dismiss event. macOS additionally dismisses on the cancel key and when the application resigns active. Popover treats every dismiss event the same way: it requests the closed value, so an uncontrolled popover closes and a controlled popover reports the request through `onOpenChange`.

Dismissal cannot be suppressed. The native dismiss-behavior properties are unimplemented on both platforms, so Popover does not expose a way to keep the surface open through an outside interaction.

## Focus

Focus movement into the surface is owned by the platform and differs between Windows and macOS, and no platform returns focus to the trigger on dismissal. A caller that needs a deterministic focus path should drive `open` and move focus itself.

Because the surface lives in a separate popup window, focus does not traverse from the trigger into the surface as part of the normal React Native focus order, and a JavaScript key handler placed on the trigger does not receive key events that occur inside the popup.

## Motion

Popover has no motion contract. The surface appears and disappears immediately, because a platform popup window's presentation is not animatable from React Native.
