export function formatCurrencyNoDecimals(number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    currency: currency,
    style: "currency",
  }).format(number);
}
