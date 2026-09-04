# Label interaction

Label is non-interactive. It is not a keyboard target, it never takes focus, and it draws no focus visual. It does not respond to press, hover, or pointer state, and it exposes no press handlers of its own.

Label does not forward activation to the control it names. React Native has no implicit association between a label and a control, so a press on the label text does nothing. A caller that wants press-to-focus behavior composes Label inside its own pressable and moves focus with the control's own ref.

Disabled is a visual mirror of the associated control. It changes the label foreground and the required indicator foreground and nothing else. There is no transition or animation between rest and disabled, so behavior is already identical under reduced-motion settings.

The required indicator toggles instantly with the `required` prop and does not animate in or out. Layout reflows normally when it appears, so a caller that needs a stable width reserves it in the surrounding layout.
