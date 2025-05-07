export function insertAfter(array, element, newElement) {
  const index = array.indexOf(element);
  if (index === -1) {
    return [...array, newElement];
  }
  return [...array.slice(0, index + 1), newElement, ...array.slice(index + 1)];
}
