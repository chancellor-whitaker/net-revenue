export const parseDateString = (dateString) => {
  if (!dateString) return "";

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ].map((string) => string.toUpperCase());

  const day = dateString.substring(0, 0 + 2);

  const month = dateString.substring(0 + 2, 2 + 3);

  const year = dateString.substring(2 + 3, 2 + 3 + 4);

  let numericMonth = `${months.indexOf(month) + 1}`;

  if (numericMonth.length === 1) numericMonth = `0${numericMonth}`;

  return [year, numericMonth, day].join("-");
};
