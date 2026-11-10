import type { DesktopTarget } from '../host/types.js';

export class TargetRegistry {
  private readonly targets = new Map<string, DesktopTarget>();
  private readonly listeners: ((target: DesktopTarget) => void)[] = [];

  constructor(targets: readonly DesktopTarget[] = []) {
    for (const target of targets) {
      this.register(target);
    }
  }

  /** Calls `listener` for every target registered from now on, so a service can prepare a target that arrives late. */
  onRegister(listener: (target: DesktopTarget) => void): void {
    this.listeners.push(listener);
  }

  register(target: DesktopTarget): void {
    if (!target.id) {
      throw new TypeError('Desktop targets require a non-empty id.');
    }
    if (this.targets.has(target.id)) {
      throw new Error(`Desktop target "${target.id}" is already registered.`);
    }
    if (
      target.launchTimeoutMs !== undefined &&
      (!Number.isSafeInteger(target.launchTimeoutMs) || target.launchTimeoutMs < 1 || target.launchTimeoutMs > 2_147_483_647)
    ) {
      throw new TypeError('Target launchTimeoutMs must be a positive bounded integer.');
    }
    if (target.launchModes && (!target.launchModes.length || target.launchModes.some((mode) => mode !== 'attach' && mode !== 'launch'))) {
      throw new TypeError('Target launchModes must contain attach and/or launch.');
    }
    this.targets.set(target.id, target);
    for (const listener of this.listeners) {
      listener(target);
    }
  }

  get(id: string): DesktopTarget | undefined {
    return this.targets.get(id);
  }

  list(): readonly DesktopTarget[] {
    return [...this.targets.values()];
  }
}
