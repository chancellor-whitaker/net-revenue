import { formatDate } from "./formatDate";

export const handleAsOfDateField = (field, lookup) => {
  if (field === "name") return "As of Date";

  const displayYears = Object.values(lookup).map(
    ({ ["Display Year"]: displayYear }) => displayYear
  );

  const isFieldDisplayYear = (field) =>
    displayYears.some(
      (displayYear) => displayYear.replaceAll(" ", "") === field
    );

  if (isFieldDisplayYear(field)) {
    const matchingRow = Object.values(lookup).find(
      ({ ["Display Year"]: displayYear }) =>
        displayYear.replaceAll(" ", "") === field
    );

    return formatDate(matchingRow["Execution Date"]);
  }

  return "";
};
