import type { DesktopTarget } from '../host/types.js';

export class TargetRegistry {
  private readonly targets = new Map<string, DesktopTarget>();

  constructor(targets: readonly DesktopTarget[] = []) {
    for (const target of targets) {
      this.register(target);
    }
  }

  register(target: DesktopTarget): void {
    if (!target.id) {
      throw new TypeError('Desktop targets require a non-empty id.');
    }
    if (this.targets.has(target.id)) {
      throw new Error(`Desktop target "${target.id}" is already registered.`);
    }
    this.targets.set(target.id, target);
  }

  get(id: string): DesktopTarget | undefined {
    return this.targets.get(id);
  }

  list(): readonly DesktopTarget[] {
    return [...this.targets.values()];
  }
}
