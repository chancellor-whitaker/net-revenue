export const getDateByYear = (globalData, globalDate) => {
  const isDate = (value) => {
    if (!value) {
      return false;
    }

    // If it is already a date, return it.
    if (typeof value === "object" && value instanceof Date) {
      return value;
    }

    // Try to parse the string into a date as is, if possible then return it.
    if (typeof value === "string") {
      const timestamp = Date.parse(value);
      //   console.log(value, timestamp, !isNaN(timestamp));
      if (!isNaN(timestamp)) return timestamp;
    }

    if (typeof value === "string") {
      // attempt to deal with this date time type 24SEP2024:00:00:00
      const day = value.slice(0, 2);
      const monthStr = value.slice(2, 5).toUpperCase();
      const year = value.slice(5, 9);
      //   const time = value.slice(10);
      const monthMap = {
        NOV: 10,
        DEC: 11,
        JAN: 0,
        FEB: 1,
        MAR: 2,
        APR: 3,
        MAY: 4,
        JUN: 5,
        JUL: 6,
        AUG: 7,
        SEP: 8,
        OCT: 9,
      };
      const date = new Date(year, monthMap[monthStr], day);
      if (!isNaN(date)) return date;
    }

    return false;
  };

  const summarizeData = (data, groupKeys, summaryColumns) => {
    const groupedData = {};

    data.forEach((item) => {
      const groupKey = groupKeys.map((key) => item[key]).join("-");

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          ...Object.fromEntries(groupKeys.map((key) => [key, item[key]])),
          count: 0,
        };
        if (summaryColumns !== null)
          summaryColumns.forEach((col) => (groupedData[groupKey][col] = 0));
      }

      groupedData[groupKey].count++;
      if (summaryColumns !== null)
        summaryColumns.forEach(
          (col) => (groupedData[groupKey][col] += item[col])
        );
    });

    return Object.values(groupedData);
  };

  const sortArr = (arr, keys, ordering = "ascending") => {
    // console.log(ordering);
    return [...arr].sort((a, b) => {
      //   console.log(ordering);
      for (let key of keys) {
        let comparison = 0;
        if (typeof a[key] === "string" && typeof b[key] === "string") {
          comparison = a[key].localeCompare(b[key]);
        } else {
          comparison = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
        }

        if (ordering === "ascending") {
          if (comparison !== 0) {
            return comparison;
          }
        } else {
          if (comparison !== 0) {
            return comparison * -1;
          }
        }
      }
      return 0;
    });
  };

  const getMaxValue = (arr, key) => {
    if (!arr || arr.length === 0) {
      return undefined;
    }
    return arr.reduce((max, obj) => Math.max(max, obj[key]), -Infinity);
  };

  const deleteKeysFromObjectArray = (arr, keysToDelete) => {
    return arr.map((obj) => {
      const newObj = { ...obj }; // Create a shallow copy to avoid modifying the original object
      keysToDelete.forEach((key) => {
        delete newObj[key]; // Delete the specified key
      });
      return newObj;
    });
  };

  const yearsAndDates = (data, year_var = "YEAR", dateParam = "12/12/2199") => {
    var date =
      isDate(dateParam) && typeof dateParam === "string"
        ? Date.parse(dateParam)
        : dateParam;
    var x_dates = summarizeData(data, [year_var], null);
    x_dates = sortArr(x_dates, [year_var], "desc");
    var max_value = getMaxValue(x_dates, year_var);
    // console.log(max_value);
    for (let row of x_dates) {
      row["year_diff"] = (Number(max_value) - Number(row[year_var])) / 101;
      row["Date Val"] = date;
      var d = new Date(date);
      row["Execution Date"] = new Date(
        d.setFullYear(d.getFullYear() - row["year_diff"])
      );
      row["Display Year"] =
        "20" + row["YEAR"].substring(0, 2) + " - 20" + row["YEAR"].substring(2);
    }
    x_dates = deleteKeysFromObjectArray(x_dates, [
      "count",
      "year_diff",
      "Date Val",
    ]);

    return x_dates;
  };

  return yearsAndDates(globalData, "YEAR", globalDate);
};
