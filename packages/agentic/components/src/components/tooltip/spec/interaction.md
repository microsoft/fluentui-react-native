# Interaction and qualification

The wrapper attaches text; the host owns the transition from idle to pending, visible and dismissed. Do not keep
a second visible flag, add timers, consume press/long press, or draw a second animation. Use system contrast,
scaling, work-area placement and motion preferences; do not assume identical pixel sizes or timeouts across hosts.

| Exercise on a real trigger                                                    | Required observation or review gate                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hover, then leave before the dwell elapses; hover again and wait.             | No late tip after leaving. One readable tip when stationary. Check a long localized string near a window edge at increased scale.                                                                                                                                              |
| Tab to the trigger, read the text, press Escape, then Tab onward.             | No activation, focus transfer, trap, or immediate reopen until a fresh trigger interaction. Record automatic focus opening separately from a platform command; specifically test Ctrl+Shift+F10 on Office Win32.                                                               |
| Move from the trigger onto the visible text with magnification.               | Check that it remains readable under the pointer and can be dismissed without moving focus. Windows Fabric cancels on trigger exit; Office's legacy contract describes dismissal on mouse movement. Record a failure or reviewed divergence, not a pass for hover entry alone. |
| Replace, clear and unmount content, switch windows, then reuse the trigger.   | No stale or duplicate tip, description, pending work or detached anchor. Re-entering shows only current text. No JS visibility callback is implied.                                                                                                                            |
| Press, click, or use the trigger's assistive action while the tip is present. | The underlying action fires exactly once. The tooltip never takes input ownership, including on a disabled trigger.                                                                                                                                                            |

Run the cases independently on RNmacOS Paper and Fabric, Windows Fabric, and Office Win32. Compare the Win32 view
prop against `RCTTooltip` in separate fixtures. Record host version, input modality, accessibility settings and
observed behavior; separate source-only evidence and skipped checks from passes. If the system tip lacks a required
behavior, first investigate the host's existing mechanism. A nonactivating native-core fallback would need its own
review and evidence; Popover's default entry focus and light-dismiss behavior are not a drop-in fallback.
