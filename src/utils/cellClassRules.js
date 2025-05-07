export const cellClassRules = {
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
  "border-end-0": ({ colDef: { field }, data }) => {
    if (field === "2023-2024") {
      return new Set([]).has(data.name);
    }
    if (new Set(["2021-2022", "2022-2023"]).has(field)) {
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
  "border-dark": ({ colDef: { field }, data }) => {
    if (new Set(["2021-2022", "2022-2023", "2023-2024"]).has(field)) {
      return new Set([
        "Employee/Dependent Tuition Waiver",
        "Other/External Grant/Scholarship",
        "Federal Grant/Scholarship",
        "Foundation Scholarships",
        "State Grant/Scholarship",
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
  "border-top-0": ({ colDef: { field }, data }) => {
    if (new Set(["2021-2022", "2022-2023", "2023-2024"]).has(field)) {
      return new Set([
        "Employee/Dependent Tuition Waiver",
        "Other/External Grant/Scholarship",
        "State Grant/Scholarship",
        "Foundation Scholarships",
        "State Mandated Waivers",
        "Athletic Scholarhship",
        "Housing Grants",
        "SAFE Fund",
      ]).has(data.name);
    }
  },
  "border-bottom-0": ({ colDef: { field }, data }) => {
    if (new Set(["2021-2022", "2022-2023", "2023-2024"]).has(field)) {
      return new Set([
        "Employee/Dependent Tuition Waiver",
        "Federal Grant/Scholarship",
        "State Grant/Scholarship",
        "Foundation Scholarships",
        "State Mandated Waivers",
        "Athletic Scholarhship",
        "Housing Grants",
        "Scholarships",
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
  "border-start-0": ({ colDef: { field }, data }) => {
    if (new Set(["2021-2022", "2022-2023", "2023-2024"]).has(field)) {
      return new Set([]).has(data.name);
    }
  },
  "bg-warning-subtle": ({ data }) => {
    return data.name === "Revenue after external aid";
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
  "bg-secondary": ({ data }) => {
    return data.name === "";
  },
  "fw-bold": ({ colDef: { field } }) => field === "name",
  dollar: ({ value }) => `${value}`.startsWith("$"),
};
