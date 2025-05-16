export const splitArrayAtElement = (arr, element) => {
  const index = arr.indexOf(element);
  if (index === -1) {
    return "Element not found";
  }
  const firstHalf = arr.slice(0, index);
  const secondHalf = arr.slice(index + 1);
  return [firstHalf, secondHalf];
};
