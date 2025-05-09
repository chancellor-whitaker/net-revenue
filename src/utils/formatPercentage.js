export function formatPercentage(number) {
  return new Intl.NumberFormat("default", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    style: "percent",
  }).format(number);
}
