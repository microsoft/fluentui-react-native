import type { DesktopStoryExpectation, DesktopStorySelector, DesktopStoryStep } from '../authoring/storyTests.js';
import type { FakeDesktopElement, FakeDesktopWindow } from '../hosts/fake/FakeDesktopHost.js';
import type { DesktopStoryManifest } from '../storybook.js';

type MutableFakeElement = Omit<FakeDesktopElement, 'rect'> & {
  rect: FakeDesktopElement['rect'];
};

export function createFakeStoryWindows(manifest: DesktopStoryManifest, storyRootTestId = 'story-root'): FakeDesktopWindow[] {
  const windowId = 'window-1';
  const windowRect = { height: 600, width: 800, x: 0, y: 0 };
  const elements = new Map<string, MutableFakeElement>();
  let elementIndex = 0;

  for (const entry of manifest.entries) {
    for (const test of entry.tests?.tests ?? []) {
      const mutated = new Set<string>();
      for (const step of test.steps) {
        if ('expect' in step) {
          applyExpectation(elements, step.expect, mutated, windowId, () => elementIndex++);
        } else {
          for (const selector of stepSelectors(step)) {
            ensureElement(elements, selector, windowId, () => elementIndex++);
          }
          markMutated(step, mutated);
        }
      }
    }
  }

  return [
    {
      elements: [
        {
          automationId: 'app-root',
          id: 'root',
          rect: windowRect,
          role: 'application',
          scope: 'application',
          windowId,
        },
        {
          automationId: storyRootTestId,
          id: 'story-root',
          name: JSON.stringify({ previewGeneration: 0, storyId: 'initial--story' }),
          parentId: 'root',
          rect: windowRect,
          role: 'group',
          scope: 'preview',
          windowId,
        },
        ...elements.values(),
      ],
      id: windowId,
      rect: windowRect,
      title: 'Desktop Driver Storybook Fake Target',
    },
  ];
}

function applyExpectation(
  elements: Map<string, MutableFakeElement>,
  expectation: DesktopStoryExpectation,
  mutated: ReadonlySet<string>,
  windowId: string,
  nextIndex: () => number,
): void {
  const element = ensureElement(elements, expectation.target, windowId, nextIndex);
  if (mutated.has(selectorIdentity(expectation.target))) {
    return;
  }
  switch (expectation.state) {
    case 'accessibleName':
      element.name = expectation.value as string;
      break;
    case 'checked':
      element.checked = expectation.value as boolean | 'mixed';
      break;
    case 'displayed':
      element.visible = expectation.value === undefined ? true : (expectation.value as boolean);
      break;
    case 'enabled':
      element.enabled = expectation.value === undefined ? true : (expectation.value as boolean);
      break;
    case 'expanded':
      element.expanded = expectation.value === undefined ? true : (expectation.value as boolean);
      break;
    case 'focused':
      element.focused = expectation.value === undefined ? true : (expectation.value as boolean);
      break;
    case 'role':
      element.role = expectation.value as string;
      break;
    case 'selected':
      element.selected = expectation.value === undefined ? true : (expectation.value as boolean);
      break;
    case 'text':
      element.text = expectation.value as string;
      break;
    case 'value':
      element.value = expectation.value as string;
      break;
    case 'count':
    case 'exists':
      break;
  }
}

function ensureElement(
  elements: Map<string, MutableFakeElement>,
  selector: DesktopStorySelector,
  windowId: string,
  nextIndex: () => number,
): MutableFakeElement {
  const identity = selectorIdentity(selector);
  const existing = elements.get(identity);
  if (existing) {
    return existing;
  }
  const index = nextIndex();
  const element: MutableFakeElement = {
    id: `story-element-${index}`,
    parentId: 'story-root',
    rect: { height: 36, width: 180, x: 16, y: 16 + index * 44 },
    role: 'group',
    scope: 'preview',
    windowId,
    ...('testId' in selector ? { automationId: selector.testId } : {}),
    ...('accessibleName' in selector ? { name: selector.accessibleName } : {}),
    ...('role' in selector ? { name: selector.name, role: selector.role } : {}),
    ...('text' in selector ? { name: selector.text, text: selector.text } : {}),
  };
  elements.set(identity, element);
  return element;
}

function selectorIdentity(selector: DesktopStorySelector): string {
  if ('testId' in selector) {
    return `testId:${selector.testId}`;
  }
  if ('role' in selector) {
    return `role:${selector.role}:${selector.name ?? ''}`;
  }
  if ('accessibleName' in selector) {
    return `name:${selector.accessibleName}`;
  }
  return `text:${selector.text}`;
}

function stepSelectors(step: Exclude<DesktopStoryStep, { expect: DesktopStoryExpectation }>): DesktopStorySelector[] {
  if ('target' in step && step.target) {
    return [step.target];
  }
  if (step.action === 'wait' && step.until) {
    return [step.until.target];
  }
  return [];
}

function markMutated(step: Exclude<DesktopStoryStep, { expect: DesktopStoryExpectation }>, mutated: Set<string>): void {
  if (!('target' in step) || !step.target) {
    return;
  }
  if (
    step.action === 'click' ||
    step.action === 'doubleClick' ||
    step.action === 'focus' ||
    step.action === 'clear' ||
    step.action === 'type'
  ) {
    mutated.add(selectorIdentity(step.target));
  }
}
