export function insertBefore(array, element, newElement) {
  const index = array.indexOf(element);
  if (index === -1) {
    return [...array, newElement];
  }
  return [...array.slice(0, index), newElement, ...array.slice(index)];
}
