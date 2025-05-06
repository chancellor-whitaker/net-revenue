export const cellClassRules = {
  "border-end-0": ({ colDef: { field }, data }) => {
    if (field === "2023-2024") {
      return new Set([
        "Institutional Aid less State Waivers and Foundation",
        "Discount Rate including BookSmart",
        "Net Revenue w/ BookSmart",
        "Total External Aid",
        "Discount Rate",
        "Net Revenue",
        "BookSmart",
      ]).has(data.name);
    }
    if (new Set(["2021-2022", "2022-2023"]).has(field)) {
      return new Set([
        "Institutional Aid less State Waivers and Foundation",
        "Discount Rate including BookSmart",
        "Employee/Dependent Tuition Waiver",
        "Other/External Grant/Scholarship",
        "Federal Grant/Scholarship",
        "Net Revenue w/ BookSmart",
        "State Grant/Scholarship",
        "Foundation Scholarships",
        "State Mandated Waivers",
        "Athletic Scholarhship",
        "Total External Aid",
        "Housing Grants",
        "Discount Rate",
        "Scholarships",
        "Net Revenue",
        "BookSmart",
        "SAFE Fund",
      ]).has(data.name);
    }
  },
  "border-dark": ({ colDef: { field }, data }) => {
    if (new Set(["2021-2022", "2022-2023", "2023-2024"]).has(field)) {
      return new Set([
        "Institutional Aid less State Waivers and Foundation",
        "Discount Rate including BookSmart",
        "Employee/Dependent Tuition Waiver",
        "Other/External Grant/Scholarship",
        "Federal Grant/Scholarship",
        "Net Revenue w/ BookSmart",
        "Foundation Scholarships",
        "State Grant/Scholarship",
        "State Mandated Waivers",
        "Athletic Scholarhship",
        "Total External Aid",
        "Housing Grants",
        "Discount Rate",
        "Scholarships",
        "Net Revenue",
        "BookSmart",
        "SAFE Fund",
      ]).has(data.name);
    }
  },
  "text-end": ({ colDef: { field }, value }) => {
    if (field === "name") {
      return new Set([
        "Institutional Aid less State Waivers and Foundation",
        "Employee/Dependent Tuition Waiver",
        "Other/External Grant/Scholarship",
        "Federal Grant/Scholarship",
        "State Grant/Scholarship",
        "Foundation Scholarships",
        "State Mandated Waivers",
        "Athletic Scholarhship",
        "Institutional Aid",
        "Housing Grants",
        "Scholarships",
        "External Aid",
        "SAFE Fund",
        "Student",
      ]).has(value);
    }
    if (
      new Set(["2021-2022", "2022-2023", "2023-2024", "__1", "__2", "%"]).has(
        field
      )
    ) {
      return true;
    }
  },
  "border-top-0": ({ colDef: { field }, data }) => {
    if (new Set(["2021-2022", "2022-2023", "2023-2024"]).has(field)) {
      return new Set([
        "Institutional Aid less State Waivers and Foundation",
        "Employee/Dependent Tuition Waiver",
        "Other/External Grant/Scholarship",
        "State Grant/Scholarship",
        "Foundation Scholarships",
        "State Mandated Waivers",
        "Athletic Scholarhship",
        "Total External Aid",
        "Housing Grants",
        "Net Revenue",
        "SAFE Fund",
      ]).has(data.name);
    }
  },
  "border-bottom-0": ({ colDef: { field }, data }) => {
    if (new Set(["2021-2022", "2022-2023", "2023-2024"]).has(field)) {
      return new Set([
        "Discount Rate including BookSmart",
        "Employee/Dependent Tuition Waiver",
        "Federal Grant/Scholarship",
        "State Grant/Scholarship",
        "Foundation Scholarships",
        "State Mandated Waivers",
        "Athletic Scholarhship",
        "Housing Grants",
        "Discount Rate",
        "Scholarships",
        "BookSmart",
      ]).has(data.name);
    }
  },
  "bg-secondary-subtle": ({ colDef: { field }, data }) => {
    if (new Set(["2021-2022", "2022-2023", "2023-2024"]).has(field)) {
      return new Set([
        "Employee/Dependent Tuition Waiver",
        "Other/External Grant/Scholarship",
        "Federal Grant/Scholarship",
        "State Grant/Scholarship",
        "Foundation Scholarships",
        "State Mandated Waivers",
        "Athletic Scholarhship",
        "Housing Grants",
        "Scholarships",
        "SAFE Fund",
      ]).has(data.name);
    }
  },
  small: ({ colDef: { field }, value }) => {
    if (field === "name") {
      return new Set([
        "Employee/Dependent Tuition Waiver",
        "Other/External Grant/Scholarship",
        "Federal Grant/Scholarship",
        "State Grant/Scholarship",
        "Foundation Scholarships",
        "State Mandated Waivers",
        "Athletic Scholarhship",
        "Housing Grants",
        "Scholarships",
        "SAFE Fund",
      ]).has(value);
    }
  },
  "border-start-0": ({ colDef: { field }, data }) => {
    if (new Set(["2021-2022", "2022-2023", "2023-2024"]).has(field)) {
      return new Set([
        "Institutional Aid less State Waivers and Foundation",
        "Discount Rate including BookSmart",
        "Net Revenue w/ BookSmart",
        "Total External Aid",
        "Discount Rate",
        "Net Revenue",
        "BookSmart",
      ]).has(data.name);
    }
  },
  //   "pe-4": ({ colDef: { field }, value }) => {
  //     if (field === "name") {
  //       return new Set([
  //         "Employee/Dependent Tuition Waiver",
  //         "Foundation Scholarships",
  //         "State Mandated Waivers",
  //         "Athletic Scholarhship",
  //         "Housing Grants",
  //         "Scholarships",
  //         "SAFE Fund",
  //       ]).has(value);
  //     }
  //   },
  "border-dashed": ({ colDef: { field }, data }) => {
    if (new Set(["2021-2022", "2022-2023", "2023-2024"]).has(field)) {
      return new Set([
        "Other/External Grant/Scholarship",
        "Federal Grant/Scholarship",
        "State Grant/Scholarship",
      ]).has(data.name);
    }
  },
  //   "ps-4": ({ colDef: { field }, value }) => {
  //     if (field === "name") {
  //       return new Set([
  //         "Other/External Grant/Scholarship",
  //         "Federal Grant/Scholarship",
  //         "State Grant/Scholarship",
  //         "Total External Aid",
  //       ]).has(value);
  //     }
  //   },
  "text-center": ({ colDef: { field } }) =>
    new Set(["Definition", "Notes"]).has(field),
  "fw-bold": ({ colDef: { field } }) => field === "name",
  dollar: ({ value }) => `${value}`.startsWith("$"),
};
