import { invalidArgument } from './errors.js';
import type { WebDriverAction, WebDriverActionSequence } from './types.js';

export type WebDriverInputState = {
  pressedButtons: Set<number>;
  pressedKeys: Set<string>;
};

export function createInputState(): WebDriverInputState {
  return { pressedButtons: new Set(), pressedKeys: new Set() };
}

export function parseActionSequences(
  value: unknown,
  current: WebDriverInputState,
): {
  actions: WebDriverActionSequence[];
  nextState: WebDriverInputState;
} {
  if (!Array.isArray(value)) {
    throw invalidArgument('"actions" must be an array.');
  }
  const nextState = {
    pressedButtons: new Set(current.pressedButtons),
    pressedKeys: new Set(current.pressedKeys),
  };
  const sourceIds = new Set<string>();
  const actions = value.map((item, index) => parseSource(item, index, sourceIds, nextState));
  return { actions, nextState };
}

function parseSource(value: unknown, index: number, sourceIds: Set<string>, state: WebDriverInputState): WebDriverActionSequence {
  const source = requireObject(value, `actions[${index}]`);
  if (typeof source.id !== 'string' || !source.id) {
    throw invalidArgument(`actions[${index}].id must be a non-empty string.`);
  }
  if (sourceIds.has(source.id)) {
    throw invalidArgument(`Action source id "${source.id}" is duplicated.`);
  }
  sourceIds.add(source.id);
  if (source.type !== 'key' && source.type !== 'none' && source.type !== 'pointer' && source.type !== 'wheel') {
    throw invalidArgument(`actions[${index}].type is not a supported input source.`);
  }
  if (!Array.isArray(source.actions)) {
    throw invalidArgument(`actions[${index}].actions must be an array.`);
  }
  if (source.type === 'pointer' && source.parameters !== undefined) {
    const parameters = requireObject(source.parameters, `actions[${index}].parameters`);
    if (
      parameters.pointerType !== undefined &&
      parameters.pointerType !== 'mouse' &&
      parameters.pointerType !== 'pen' &&
      parameters.pointerType !== 'touch'
    ) {
      throw invalidArgument(`actions[${index}].parameters.pointerType is invalid.`);
    }
  }
  const parsedActions = source.actions.map((action, actionIndex) =>
    parseAction(action, source.type as WebDriverActionSequence['type'], `actions[${index}].actions[${actionIndex}]`, state),
  );
  return {
    id: source.id,
    type: source.type,
    ...(source.parameters === undefined ? {} : { parameters: source.parameters as Record<string, unknown> }),
    actions: parsedActions,
  };
}

function parseAction(
  value: unknown,
  sourceType: WebDriverActionSequence['type'],
  path: string,
  state: WebDriverInputState,
): WebDriverAction {
  const action = requireObject(value, path);
  if (typeof action.type !== 'string') {
    throw invalidArgument(`${path}.type must be a string.`);
  }
  if (action.type === 'pause') {
    validateDuration(action.duration, path);
    return action as WebDriverAction;
  }
  if (sourceType === 'none') {
    throw invalidArgument(`${path}.type must be "pause" for a none input source.`);
  }
  if (sourceType === 'key') {
    if (action.type !== 'keyDown' && action.type !== 'keyUp') {
      throw invalidArgument(`${path}.type is invalid for a key input source.`);
    }
    if (typeof action.value !== 'string' || action.value.length === 0) {
      throw invalidArgument(`${path}.value must be a non-empty string.`);
    }
    if (!isSingleWebDriverKeyValue(action.value)) {
      throw invalidArgument(`${path}.value must contain exactly one Unicode code point.`);
    }
    if (action.type === 'keyDown') {
      state.pressedKeys.add(action.value);
    } else {
      state.pressedKeys.delete(action.value);
    }

    return action as WebDriverAction;
  }
  if (sourceType === 'pointer') {
    if (action.type === 'pointerCancel') {
      state.pressedButtons.clear();
      return action as WebDriverAction;
    }
    if (action.type === 'pointerDown' || action.type === 'pointerUp') {
      if (!Number.isInteger(action.button) || (action.button as number) < 0) {
        throw invalidArgument(`${path}.button must be a non-negative integer.`);
      }
      if (action.type === 'pointerDown') {
        state.pressedButtons.add(action.button as number);
      } else {
        state.pressedButtons.delete(action.button as number);
      }
      return action as WebDriverAction;
    }
    if (action.type === 'pointerMove') {
      validateCoordinates(action, path);
      validateDuration(action.duration, path);
      validateOrigin(action.origin, path);
      return action as WebDriverAction;
    }
    throw invalidArgument(`${path}.type is invalid for a pointer input source.`);
  }
  if (action.type !== 'scroll') {
    throw invalidArgument(`${path}.type is invalid for a wheel input source.`);
  }
  validateCoordinates(action, path);
  if (typeof action.deltaX !== 'number' || typeof action.deltaY !== 'number') {
    throw invalidArgument(`${path}.deltaX and deltaY must be numbers.`);
  }
  validateDuration(action.duration, path);
  validateOrigin(action.origin, path);
  return action as WebDriverAction;
}

export function isSingleWebDriverKeyValue(value: string): boolean {
  const codePoint = value.codePointAt(0);
  return codePoint !== undefined && [...value].length === 1 && (codePoint < 0xd800 || codePoint > 0xdfff);
}

function validateCoordinates(action: Record<string, unknown>, path: string): void {
  if (typeof action.x !== 'number' || typeof action.y !== 'number') {
    throw invalidArgument(`${path}.x and y must be numbers.`);
  }
}

function validateDuration(value: unknown, path: string): void {
  if (value !== undefined && (!Number.isInteger(value) || (value as number) < 0)) {
    throw invalidArgument(`${path}.duration must be a non-negative integer.`);
  }
}

function validateOrigin(value: unknown, path: string): void {
  if (value === undefined || value === 'viewport' || value === 'pointer') {
    return;
  }
  if (value && typeof value === 'object' && typeof (value as Record<string, unknown>)['element-6066-11e4-a52e-4f735466cecf'] === 'string') {
    return;
  }
  throw invalidArgument(`${path}.origin must be "viewport", "pointer", or a WebDriver element reference.`);
}

function requireObject(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw invalidArgument(`${path} must be an object.`);
  }
  return value as Record<string, unknown>;
}
