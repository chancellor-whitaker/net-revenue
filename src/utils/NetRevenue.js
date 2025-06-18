/**
 * NetRevenue class assumes the data has been filtered prior to use.
 *
 * accoutingData - Should be filtered on <= transaction_date because all transaction dates on or prior
 *      to the selected date should be used in the calculation.
 * unofficialFTE - Should be filtered like so....
 *      where effective_date <= SELECTED_DATE
 *      group by YEAR, LEVL, EKU_ONLINE, RESD, STYP
 *      having max(effective_date) = effective_date.
 *      So it basically is just keeping the max effective date for the combination of group by variables.
 *
 * Class usage example:
 *
 * const v = new NetRevenue(accoutingData, unofficialFTE, officialFTE, searchDate, bookSmart);
 *       - This kicks off all calculations and sets the class property (value).
 * console.log("Calculations: ", v.value);
 *       - Prints the property value.
 *          {
 *              "2020-2021": {
 *                  "Tuition and Fees":147986199.2,
 *                  "Federal Grant/Scholarship":23372648.46,
 *                  "State Grant/Scholarship":21038367.5,
 *                  "Other/External Grant/Scholarship":4942852.37,
 *                  "Total External Aid":49353868.33,
 *                  ...
 *              },
 *              "2021-2022": {
 *              },
 *              "2022-2023": {
 *              },
 *              ...
 *          }
 * convertDateStringToDate
 */

export class NetRevenue {
  data_settings = {};
  year_dates;
  value;
  date;

  /**
   * This constructor takes 3 .
   * @param {array of objects} accoutingData - Student accounting data.
   * @param {array of objects} unofficialFTE - Student unofficial FTE data.
   * @param {array of objects} officialFTE - Student official FTE data.
   */
  constructor(
    accoutingData,
    unofficialFTE,
    officialFTE,
    date = "12/31/2199",
    bookSmart = { 2122: 6910998, 2223: 7836252, 2324: 7771845, 2425: 8159379 }
  ) {
    // copy the data.
    var accoutingData_x = [...accoutingData];
    var unofficialFTE_x = [...unofficialFTE];
    var officialFTE_x = [...officialFTE];

    accoutingData_x = this.capitalizeKeys(accoutingData_x);
    unofficialFTE_x = this.capitalizeKeys(unofficialFTE_x);
    // console.log(unofficialFTE_x);
    officialFTE_x = this.capitalizeKeys(officialFTE_x);
    // console.log(officialFTE_x);

    this.value = {};
    this.date = new Date(this.isDate(date));
    // if (this.isDate(this.date) && typeof this.date === "string") {
    //   this.date = new Date(Date.parse(this.date));
    // }
    this.year_dates = this.yearsAndDates(unofficialFTE_x, "YEAR", this.date);
    // yearsAndDates(data, year_var = "YEAR", date = "12/12/2199")

    accoutingData_x = this.removeNewlineFromKeys(accoutingData_x);
    accoutingData_x = this.convertKeyTypes(
      accoutingData_x,
      ["AMOUNT"],
      "number"
    );
    accoutingData_x = this.convertKeyTypes(
      accoutingData_x,
      ["TRANSACTION_DATE"],
      "date"
    );
    // console.log(accoutingData_x[0]);
    // console.log(accoutingData_x[0]["AMOUNT"]);
    unofficialFTE_x = this.removeNewlineFromKeys(unofficialFTE_x);
    unofficialFTE_x = this.convertKeyTypes(
      unofficialFTE_x,
      ["FTE", "HOURS"],
      "number"
    );
    unofficialFTE_x = this.convertKeyTypes(
      unofficialFTE_x,
      ["EFFECTIVE_DATE"],
      "date"
    );
    // console.log(unofficialFTE_x[0]);

    officialFTE_x = this.removeNewlineFromKeys(officialFTE_x);
    officialFTE_x = this.convertKeyTypes(
      officialFTE_x,
      ["FTE", "HOURS"],
      "number"
    );
    // console.log(officialFTE_x[0]);

    // fills this.value
    this.calculate(accoutingData_x, unofficialFTE_x, officialFTE_x, bookSmart);
  }

  //   /**
  //    * This method sets the value of the object.
  //    * @returns {object} - The value of the object.
  //    */
  //   get value() {
  //     return this.#value;
  //   }

  //   /**
  //    * This method sets the value of the object. It really serves no purpose and does not make sense in this context.
  //    * @returns {object} - The value of the object.
  //    */
  //   set value(value) {
  //     this.#value = value;
  //   }

  calculate(accountingData, unofficialFTE, officialFTE, bookSmart) {
    accountingData = this.getAcctTransactions(accountingData); // added this because it wasn't calculating based on date.
    // This is not in Chance's version.

    this.tuitionAndFees(accountingData); // initializes this.value.
    this.federalGrantsScholarships(accountingData);
    this.stateGrantsScholarships(accountingData);
    this.otherExternalGrantsScholarships(accountingData);
    this.totalExternalGrantsScholarships(accountingData);
    this.revenueAfterExternalGrantsScholarships();
    this.totalInstitutionalGrantsScholarships(accountingData);
    this.institutionalScholarships(accountingData);
    this.institutionalFoundationScholarships(accountingData);
    this.institutionalAthleticScholarships(accountingData);
    this.institutionalStateMandatedWaivers(accountingData);
    this.institutionalEmployeeWaivers(accountingData);
    this.institutionalHousingGrants(accountingData);
    this.institutionalSAFEFund(accountingData);
    this.institutionaMinusStateFoundation();
    this.netRevenue();
    this.discountRate();
    this.unofficialFTE(unofficialFTE);
    this.unofficialCreditHours(unofficialFTE);
    this.netRevenuePerFTE();
    this.netRevenuePerCreditHour();
    this.applyBookSmart(bookSmart);
    // console.log(this.value["2223"]);
    console.log(this.value);
    return null;
  }

  isDate(value) {
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
      const time = value.slice(10);
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
  }

  /**
   * This method attempts to convert any string values to numeric if possible.
   *
   * @param {array of objects} data - The array of objects to be converted.
   * @param {array of strings} ignore - Array of strings (keys), that are to be ignored during the conversion.
   *        example: ["Letter", "Car", "Rooms"]
   * @returns {array of objects} array - Returns an array of objects with the conversion.
   *
   * Example usage:
   *    const net_revenue = new NetRevenue(null,null,null);
   *    const v = net_revenue.convertJsonValuesToNumeric(data, ["Frequency"]);
   */
  convertJsonValuesToNumeric(data, ignore = null) {
    // Looks to see if the json object needs to be parsed.
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return data;
      }
    }

    if (typeof data === "object" && data !== null) {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          if (ignore !== null) {
            // console.log(key);
            if (ignore.includes(key)) continue;
          }

          if (typeof data[key] === "object") {
            // if it is an object, recursively traverse it.
            data[key] = this.convertJsonValuesToNumeric(data[key], ignore);
          } else if (typeof data[key] === "string") {
            // if it is a string, attempt to convert to number.
            const num = Number(data[key]);
            if (!isNaN(num)) {
              data[key] = num;
            }
          }
        }
      }
    }
    return data;
  }

  applyBookSmart(data) {
    for (const key in this.value) {
      //   console.log("KEY", key);
      if (this.value.hasOwnProperty(key)) {
        if (data.hasOwnProperty(key)) {
          this.value[key]["BookSmart"] = data[key];
          this.value[key]["Net Revenue w/ BookSmart"] =
            this.value[key]["Net Revenue"] - this.value[key]["BookSmart"];

          if (this.value[key]["Tuition & Fees"] == 0) {
            this.value[key]["Discount Rate including BookSmart"] = NaN;
          } else {
            this.value[key]["Discount Rate including BookSmart"] =
              (this.value[key]["BookSmart"] +
                this.value[key][
                  "Institutional Aid less State Waivers and Foundation"
                ]) /
              this.value[key]["Tuition & Fees"];
          }
        }
      }
    }

    this.populateMissingKeys("BookSmart", NaN);
    this.populateMissingKeys("Net Revenue w/ BookSmart", NaN);
    this.populateMissingKeys("Discount Rate including BookSmart", NaN);
  }

  tuitionAndFees(data) {
    // initialize this.value -- this holds all the values.
    // var year_dates = [... this.year_dates];
    var year_dates = structuredClone(this.year_dates); // this works now.
    var today = new Date();
    this.value = {};
    for (var x of year_dates) {
      if (x["Execution Date"] > today) x["Execution Date"] = today;

      this.value[x["YEAR"]] = {
        "As of Date": x["Execution Date"],
        "Display Year": x["Display Year"],
        Year: x["YEAR"],
      };
    }

    const filtered = this.filterByKeys(data, { CATEGORY: ["TF"] });
    const summed = this.summarizeData(filtered, ["YEAR"], ["AMOUNT"]);
    for (var x of summed) {
      //   this.value[x["YEAR"]] = {};
      this.value[x["YEAR"]]["Tuition & Fees"] = x["AMOUNT"];
    }

    this.populateMissingKeys("Tuition & Fees", 0);
    // for (const key of Object.keys(this.value)) {
    //   console.log(key, this.value[key]);
    // }
  }

  /**
   * This method attempts to give a cooresponding date for each year.
   * It is assumed the date being passed to this method will go with the max year in data.
   *
   * @param {array of objects} data - The array of objects.
   * @param {string} year_var - The year variable in data.
   *    - Defaults to "YEAR".
   * @param {string} date - The date we are looking at, assumes this goes with max year.
   *    - Defaults to "12/12/2199", so it should be the max on all dates.
   * @returns {string} date - Returns an array of objects with the conversion.
   *
   * Example usage:
   *    const net_revenue = new NetRevenue(null,null,null);
   *    const v = net_revenue.convertJsonValuesToNumeric(data, ["Frequency"]);
   */
  yearsAndDates(data, year_var = "YEAR", date = "12/31/2199") {
    console.log("DATE", date);
    if (this.isDate(date) && typeof value === "string") {
      date = Date.parse(value);
    }
    var x_dates = this.summarizeData(data, [year_var], null);
    x_dates = this.sortArr(x_dates, [year_var], "desc");
    var max_value = this.getMaxValue(x_dates, year_var);
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
    x_dates = this.deleteKeysFromObjectArray(x_dates, [
      "count",
      "year_diff",
      "Date Val",
    ]);

    return x_dates;
  }

  /**
   * This method filters an array of objects based on the provided filters and returns the filtered array.
   *
   * @param {array of objects} array - The array of objects to be converted.
   * @param {array of strings} keys - Array of strings (keys), these are to be converted to specified type.
   *        example: ["Letter", "Car", "Rooms"]
   * @param {string} type - This is the type we want to convert the keys to.
   *        The default is 'float'.
   *        Acceptable values ('int', 'float', 'string', 'number')
   * @returns {array of objects} array - Returns the converted array of objects.
   *
   * Example usage:
   *    convertKeyTypes(array, ["Letter", "Car", "Rooms"], type="string");
   */
  convertKeyTypes(array, keys, type = "float") {
    return array.map((item) => {
      const newItem = { ...item };
      keys.forEach((column) => {
        if (newItem[column] !== undefined) {
          if (type === "int") {
            newItem[column] = parseInt(newItem[column], 10);
          } else if (type === "float") {
          } else if (type === "number") {
            newItem[column] = Number(newItem[column]);
          } else if (type === "string") {
            newItem[column] = String(newItem[column]);
          } else if (type === "date") {
            newItem[column] = this.isDate(newItem[column]);
          }
        }
      });
      return newItem;
    });
  }

  /**
   * This method sorts a provided array of objects.
   *
   * @param {array of objects} array - The array of objects to be sorted.
   * @param {array} keys - The keys to be sorted by.
   *        example: ["YEAR", "EFFECTIVE_DATE"]
   * @param {string} ordering - How to order the array.
   *        ascending is the default option.
   *        Any other value should be descending.
   * @returns {array of objects} array - The sorted array of objects.
   *
   * Example usage:
   * const sortedData = sortArr(data, ["YEAR", "EFFECTIVE_DATE"], ordering="descending");
   */
  sortArr(arr, keys, ordering = "ascending") {
    // console.log(ordering);
    return arr.sort((a, b) => {
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
  }

  /**
   * This method summarizes an array of objects based on the provided group by keys and columns to be summarized.
   *
   * @param {array of objects} data - The array of objects to be summarized.
   * @param {array of strings} groupKeys - Array of strings (keys), these are to be the groups.
   *        example: ["Letter", "Car", "Rooms"]
   * @param {array of strings} summaryColumns - Array of strings (keys), these are to be summarized.
   *        example: ["number1", "number2"]
   * @returns {array of objects} array - Returns a summarized array of objects.
   *
   * Example usage:
   *    summarizeData(array, ["Letter", "Car", "Rooms"], ["Frequency", "Percentage"]);
   */
  summarizeData(data, groupKeys, summaryColumns) {
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
  }

  //**************************************************************** */
  // This is mainly for testing, Chance will do his own thing. This is call in getUnofficialFTE.
  getLatestRecords(data, keys, date_var) {
    const grouped = data.reduce((acc, record) => {
      const groupKey = keys.map((key) => record[key]).join("-");
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(record);
      return acc;
    }, {});

    const latestRecords = Object.values(grouped).map((group) => {
      return group.reduce((latest, current) => {
        const currentDate = new Date(current[date_var]);
        const latestDate = latest ? new Date(latest[date_var]) : null;

        return !latest || currentDate > latestDate ? current : latest;
      }, null);
    });

    return latestRecords;
  }

  //**************************************************************** */
  // This is mainly for testing, Chance will do his own thing.
  getUnofficialFTE(unofficialFTE) {
    const dates = this.year_dates;
    var filtered_data = [];
    for (let row of unofficialFTE) {
      for (let date of dates) {
        if (
          row["EFFECTIVE_DATE"] <= date["Execution Date"] &&
          date["YEAR"] === row["YEAR"]
        )
          filtered_data.push(row);
      }
    }
    // console.log("filtered_data FTE", filtered_data);
    var x = this.getLatestRecords(
      filtered_data,
      ["YEAR", "STYP", "LEVL", "RESD", "EKU_ONLINE"],
      "EFFECTIVE_DATE"
    );
    // console.log("UNOFFICIAL FTE", x);
    return x;
  }

  keepMaxValueByKeys(arr, keys, valueKey) {
    const grouped = arr.reduce((acc, obj) => {
      const groupKey = keys.map((key) => obj[key]).join("-");
      acc[groupKey] = acc[groupKey] || [];
      acc[groupKey].push(obj);
      return acc;
    }, {});

    const result = Object.values(grouped).map((group) => {
      return group.reduce((maxObj, currentObj) => {
        return currentObj[valueKey] > (maxObj[valueKey] || -Infinity)
          ? currentObj
          : maxObj;
      }, {});
    });

    return result;
  }

  institutionaMinusStateFoundation() {
    for (const key in this.value) {
      if (this.value.hasOwnProperty(key)) {
        this.value[key]["Institutional Aid less State Waivers and Foundation"] =
          this.value[key]["Institutional Grant/Scholarship Aid"] -
          this.value[key]["State Mandated Waivers"] -
          this.value[key]["Foundation Scholarships"];
      }
    }
    this.populateMissingKeys(
      "Institutional Aid less State Waivers and Foundation",
      0
    );
  }

  revenueAfterExternalGrantsScholarships() {
    for (const key in this.value) {
      if (this.value.hasOwnProperty(key)) {
        //   console.log(key, this.value[key]);
        this.value[key]["Revenue after external aid"] =
          this.value[key]["Tuition & Fees"] -
          this.value[key]["Total External Aid"];
      }
    }

    this.populateMissingKeys("Revenue after external aid", 0);
  }

  institutionalEmployeeWaivers(data) {
    const filtered = this.filterByKeys(data, {
      INTERNAL_AID: ["EM"],
      CATEGORY: ["IG"],
    });
    const summed = this.summarizeData(filtered, ["YEAR"], ["AMOUNT"]);
    for (var x of summed) {
      this.value[x["YEAR"]]["Employee/Dependent Tuition Waiver"] = x["AMOUNT"];
    }
    this.populateMissingKeys("Employee/Dependent Tuition Waiver", 0);
  }

  otherExternalGrantsScholarships(data) {
    const filtered = this.filterByKeys(data, { CATEGORY: ["OG"] });
    const summed = this.summarizeData(filtered, ["YEAR"], ["AMOUNT"]);
    for (var x of summed) {
      this.value[x["YEAR"]]["Other/External Grant/Scholarship"] = x["AMOUNT"];
    }
    // console.log(this.value);

    this.populateMissingKeys("Other/External Grant/Scholarship", 0);
  }

  institutionalFoundationScholarships(data) {
    const filtered = this.filterByKeys(data, {
      INTERNAL_AID: ["FC"],
      CATEGORY: ["IG"],
    });
    const summed = this.summarizeData(filtered, ["YEAR"], ["AMOUNT"]);
    for (var x of summed) {
      this.value[x["YEAR"]]["Foundation Scholarships"] = x["AMOUNT"];
    }

    this.populateMissingKeys("Foundation Scholarships", 0);
  }

  /**
   * This method filters an array of objects based on the provided filters and returns the filtered array.
   * This does not work on numeric data (no <=, <, >, >=).
   *
   * @param {array of objects} array - The array of objects to be filtered.
   * @param {object} filters - The filters to be applied to the array.
   *        example: { "Letter": ["A", "B"], "Number": [1, 2] }
   * @returns {array of objects} array - The filtered array of objects.
   *
   * Example usage:
   * const filteredData = filterByKeys(data, { Letter: ["A", "B"], Number: [1, 2] });
   */
  filterByKeys(array, filters) {
    // this.#value["filteredData"] = "Test";
    const filterKeys = Object.keys(filters);
    return array.filter((item) => {
      return filterKeys.every((key) => {
        //   console.log(item, item[key], item["Letter"], item.Letter);
        if (!filters[key].length) return true;
        return filters[key].includes(item[key]);
      });
    });
  }

  totalInstitutionalGrantsScholarships(data) {
    const filtered = this.filterByKeys(data, { CATEGORY: ["IG"] });
    const summed = this.summarizeData(filtered, ["YEAR"], ["AMOUNT"]);
    for (var x of summed) {
      this.value[x["YEAR"]]["Institutional Grant/Scholarship Aid"] =
        x["AMOUNT"];
    }

    this.populateMissingKeys("Institutional Grant/Scholarship Aid", 0);
  }

  institutionalStateMandatedWaivers(data) {
    const filtered = this.filterByKeys(data, {
      INTERNAL_AID: ["SM"],
      CATEGORY: ["IG"],
    });
    const summed = this.summarizeData(filtered, ["YEAR"], ["AMOUNT"]);
    for (var x of summed) {
      this.value[x["YEAR"]]["State Mandated Waivers"] = x["AMOUNT"];
    }
    this.populateMissingKeys("State Mandated Waivers", 0);
  }

  netRevenue() {
    for (const key in this.value) {
      if (this.value.hasOwnProperty(key)) {
        this.value[key]["Net Revenue"] =
          this.value[key]["Tuition & Fees"] -
          this.value[key][
            "Institutional Aid less State Waivers and Foundation"
          ];
        // - this.value[key]["Total External Aid"];
      }
    }

    this.populateMissingKeys("Net Revenue", 0);
  }

  institutionalAthleticScholarships(data) {
    const filtered = this.filterByKeys(data, {
      INTERNAL_AID: ["AS"],
      CATEGORY: ["IG"],
    });
    const summed = this.summarizeData(filtered, ["YEAR"], ["AMOUNT"]);
    for (var x of summed) {
      this.value[x["YEAR"]]["Athletic Scholarships"] = x["AMOUNT"];
    }
    this.populateMissingKeys("Athletic Scholarships", 0);
  }

  //**************************************************************** */
  // This is mainly for testing, Chance will do his own thing.
  getAcctTransactions(acctData) {
    const dates = this.year_dates;
    var filtered_acct_data = [];
    for (let row of acctData) {
      for (let date of dates) {
        if (
          row["TRANSACTION_DATE"] <= date["Execution Date"] &&
          date["YEAR"] === row["YEAR"]
        )
          filtered_acct_data.push(row);
      }
    }
    return filtered_acct_data;
  }

  totalExternalGrantsScholarships(data) {
    const filtered = this.filterByKeys(data, { CATEGORY: ["FG", "SG", "OG"] });
    const summed = this.summarizeData(filtered, ["YEAR"], ["AMOUNT"]);
    for (var x of summed) {
      this.value[x["YEAR"]]["Total External Aid"] = x["AMOUNT"];
    }
    // console.log(this.value);
    this.populateMissingKeys("Total External Aid", 0);
  }

  federalGrantsScholarships(data) {
    const filtered = this.filterByKeys(data, { CATEGORY: ["FG"] });
    const summed = this.summarizeData(filtered, ["YEAR"], ["AMOUNT"]);
    for (var x of summed) {
      this.value[x["YEAR"]]["Federal Grant/Scholarship"] = x["AMOUNT"];
    }
    // console.log(this.value);
    this.populateMissingKeys("Federal Grant/Scholarship", 0);
  }

  removeNewlineFromKeys(arr) {
    var new_arr = [];
    for (const obj of arr) {
      const newObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const newKey = key.replace(/\r?\n|\r/g, ""); // Removes \r\n, \n, or \r
          newObj[newKey] = obj[key];
        }
      }
      new_arr.push(newObj);
    }
    return new_arr;
  }

  stateGrantsScholarships(data) {
    const filtered = this.filterByKeys(data, { CATEGORY: ["SG"] });
    const summed = this.summarizeData(filtered, ["YEAR"], ["AMOUNT"]);
    for (var x of summed) {
      this.value[x["YEAR"]]["State Grant/Scholarship"] = x["AMOUNT"];
    }
    // console.log(this.value);
    this.populateMissingKeys("State Grant/Scholarship", 0);
  }

  institutionalHousingGrants(data) {
    const filtered = this.filterByKeys(data, {
      INTERNAL_AID: ["HG"],
      CATEGORY: ["IG"],
    });
    const summed = this.summarizeData(filtered, ["YEAR"], ["AMOUNT"]);
    for (var x of summed) {
      this.value[x["YEAR"]]["Housing Grants"] = x["AMOUNT"];
    }
    this.populateMissingKeys("Housing Grants", 0);
  }

  institutionalScholarships(data) {
    const filtered = this.filterByKeys(data, {
      INTERNAL_AID: ["SC"],
      CATEGORY: ["IG"],
    });
    const summed = this.summarizeData(filtered, ["YEAR"], ["AMOUNT"]);
    for (var x of summed) {
      this.value[x["YEAR"]]["Scholarships"] = x["AMOUNT"];
    }
    this.populateMissingKeys("Scholarships", 0);
  }

  institutionalSAFEFund(data) {
    const filtered = this.filterByKeys(data, {
      INTERNAL_AID: ["SF"],
      CATEGORY: ["IG"],
    });
    const summed = this.summarizeData(filtered, ["YEAR"], ["AMOUNT"]);
    for (var x of summed) {
      this.value[x["YEAR"]]["SAFE Fund"] = x["AMOUNT"];
    }
    this.populateMissingKeys("SAFE Fund", 0);
  }

  discountRate() {
    for (const key in this.value) {
      if (this.value.hasOwnProperty(key)) {
        this.value[key]["Discount Rate"] =
          this.value[key][
            "Institutional Aid less State Waivers and Foundation"
          ] / this.value[key]["Tuition & Fees"];
      }
    }

    this.populateMissingKeys("Discount Rate", 0);
  }

  unofficialCreditHours(data) {
    const filtered = this.getUnofficialFTE(data);
    const summed = this.summarizeData(filtered, ["YEAR"], ["HOURS"]);
    for (var x of summed) {
      this.value[x["YEAR"]]["Total Student Credit Hours"] = x["HOURS"];
    }

    this.populateMissingKeys("Total Student Credit Hours", 0);
  }

  capitalizeKeys(arr) {
    return arr.map((obj) => {
      const capitalizedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const capitalizedKey = key.toUpperCase();
          capitalizedObj[capitalizedKey] = obj[key];
        }
      }
      return capitalizedObj;
    });
  }

  netRevenuePerCreditHour() {
    for (const key in this.value) {
      if (this.value.hasOwnProperty(key)) {
        this.value[key]["Net Revenue per SCH"] =
          this.value[key]["Net Revenue"] /
          this.value[key]["Total Student Credit Hours"];
      }
    }

    this.populateMissingKeys("Net Revenue per SCH", 0);
  }

  deleteKeysFromObjectArray(arr, keysToDelete) {
    return arr.map((obj) => {
      const newObj = { ...obj }; // Create a shallow copy to avoid modifying the original object
      keysToDelete.forEach((key) => {
        delete newObj[key]; // Delete the specified key
      });
      return newObj;
    });
  }

  populateMissingKeys(key, value) {
    // loop over the years.
    for (const yr_key of Object.keys(this.value)) {
      // console.log(yr_key, this.value[yr_key]);
      var myObj = this.value[yr_key];
      if (!myObj.hasOwnProperty(key)) {
        this.value[yr_key][key] = value;
      }
    }
  }

  netRevenuePerFTE() {
    for (const key in this.value) {
      if (this.value.hasOwnProperty(key)) {
        this.value[key]["Net Revenue per FTE"] =
          this.value[key]["Net Revenue"] / this.value[key]["FTE"];
      }
    }

    this.populateMissingKeys("Net Revenue per FTE", 0);
  }

  unofficialFTE(data) {
    const filtered = this.getUnofficialFTE(data);
    const summed = this.summarizeData(filtered, ["YEAR"], ["FTE"]);
    for (var x of summed) {
      this.value[x["YEAR"]]["FTE"] = x["FTE"];
    }

    this.populateMissingKeys("FTE", 0);
  }

  /**
   * This method gets the max value of a key in an array of objects.
   *
   * @param {array of objects} array - The array of objects.
   * @param {array} key - The key/column we want the max value from.
   *
   * @returns {} single value - The maximum value from the key/column.
   *
   * Example usage:
   * const maxValue = getMaxValue(data, "YEAR");
   */
  getMaxValue(arr, key) {
    if (!arr || arr.length === 0) {
      return undefined;
    }
    return arr.reduce((max, obj) => Math.max(max, obj[key]), -Infinity);
  }
}
