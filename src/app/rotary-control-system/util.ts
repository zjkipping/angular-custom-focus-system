// Converted https://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers

import { RotaryControlDirective } from './rotary-control.directive';

// to Typescript
export function findInsertIndex<T>(
  element: T,
  array: T[],
  comparer: (a: T, b: T) => number,
  start?: number,
  end?: number
): number {
  if (array.length === 0) return -1;

  start = start || 0;
  end = end || array.length;
  var pivot = (start + end) >> 1; // should be faster than dividing by 2

  var c = comparer(element, array[pivot]);
  if (end - start <= 1) return c == -1 ? pivot - 1 : pivot;

  switch (c) {
    case -1:
      return findInsertIndex(element, array, comparer, start, pivot);
    case 0:
      return pivot;
    case 1:
      return findInsertIndex(element, array, comparer, pivot, end);
  }

  // should never hit this, but TS wants a default return for recursion & typing reasons
  return -1;
}

export function isInFocusPath(focusedEntity: RotaryControlDirective, entity: RotaryControlDirective) {
  let focusedEntityParent = focusedEntity.parent;
  while (!!focusedEntityParent) {
    if (entity === focusedEntityParent) {
      return true;
    }
    focusedEntityParent = focusedEntityParent.parent;
  }
  return false;
}
