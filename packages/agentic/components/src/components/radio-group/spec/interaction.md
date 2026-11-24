# RadioGroup interaction

Physical navigation updates the active native target, not a private boolean on each Radio. Refusal or removal
cancels stale focus requests. Re-enter a valid selected member; if all are disabled no option becomes a phantom
stop.
