# ToggleButton interaction

One enabled activation requests the inverse of the current selection. In controlled mode report the request but
keep rendering the prop, including when a parent declines to change it. In uncontrolled mode commit it and notify
once. Do not reapply `defaultSelected` on rerender or notify for a prop-driven change.

Use the pressable's activation path for pointer and keyboard. Do not install an additional key-up toggle.
For a recognized accessibility Toggle, request the same change and forward the original accessibility event;
do not call the pointer handler. Other custom action events are forwarded without changing selection.
`onPress` may observe ordinary activation but is not a second selection owner. A disabled control must not change.

Persistent selection survives release, pointer exit and blur; temporary pressed feedback does not. Do not move
focus on activation or intercept arrows owned by a parent toolbar. Apply the normal native focus policy independently
of selection. Keep the label, indicator swap and color changes immediate.
