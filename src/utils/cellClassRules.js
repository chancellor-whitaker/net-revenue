import { highlightedNames } from "./highlightedNames";

const years = ["2020-2021", "2021-2022", "2022-2023", "2023-2024", "2024-2025"];

const allButLastYear = years.slice(0, -1);

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
        "Athletic Scholarships",
        "Institutional Aid",
        "Housing Grants",
        "Scholarships",
        "External Aid",
        "SAFE Fund",
        "Student",
      ]).has(value);
    }
    if (new Set(["__1", "__2", "%", ...years]).has(field)) {
      return true;
    }
  },
  "border-end-0": ({ colDef: { field }, data }) => {
    if (new Set(allButLastYear).has(field)) {
      return new Set([
        "Employee/Dependent Tuition Waiver",
        "Other/External Grant/Scholarship",
        "Federal Grant/Scholarship",
        "State Grant/Scholarship",
        "Foundation Scholarships",
        "State Mandated Waivers",
        "Athletic Scholarships",
        "Housing Grants",
        "Scholarships",
        "SAFE Fund",
      ]).has(data?.name);
    }
  },
  "bg-secondary-subtle": ({ colDef: { field }, data }) => {
    if (new Set(years).has(field)) {
      return new Set([
        "Employee/Dependent Tuition Waiver",
        "Other/External Grant/Scholarship",
        "Federal Grant/Scholarship",
        "State Grant/Scholarship",
        "Foundation Scholarships",
        "State Mandated Waivers",
        "Athletic Scholarships",
        "Housing Grants",
        "Scholarships",
        "SAFE Fund",
      ]).has(data?.name);
    }
  },
  "border-dark": ({ colDef: { field }, data }) => {
    if (new Set(years).has(field)) {
      return new Set([
        "Employee/Dependent Tuition Waiver",
        "Other/External Grant/Scholarship",
        "Federal Grant/Scholarship",
        "Foundation Scholarships",
        "State Grant/Scholarship",
        "State Mandated Waivers",
        "Athletic Scholarships",
        "Housing Grants",
        "Scholarships",
        "SAFE Fund",
      ]).has(data?.name);
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
        "Athletic Scholarships",
        "Housing Grants",
        "Scholarships",
        "SAFE Fund",
      ]).has(value);
    }
  },
  "border-top-0": ({ colDef: { field }, data }) => {
    if (new Set(years).has(field)) {
      return new Set([
        "Employee/Dependent Tuition Waiver",
        "Other/External Grant/Scholarship",
        "State Grant/Scholarship",
        "Foundation Scholarships",
        "State Mandated Waivers",
        "Athletic Scholarships",
        "Housing Grants",
        "SAFE Fund",
      ]).has(data?.name);
    }
  },
  "border-bottom-0": ({ colDef: { field }, data }) => {
    if (new Set(years).has(field)) {
      return new Set([
        "Employee/Dependent Tuition Waiver",
        "Federal Grant/Scholarship",
        "State Grant/Scholarship",
        "Foundation Scholarships",
        "State Mandated Waivers",
        "Athletic Scholarships",
        "Housing Grants",
        "Scholarships",
      ]).has(data?.name);
    }
  },
  "border-dashed": ({ colDef: { field }, data }) => {
    if (new Set(years).has(field)) {
      return new Set([
        "Other/External Grant/Scholarship",
        "Federal Grant/Scholarship",
        "State Grant/Scholarship",
      ]).has(data?.name);
    }
  },
  "text-center": ({ colDef: { field }, data }) => {
    return (
      new Set(["Definition", "Notes"]).has(field) ||
      (data?.name === "As of Date" && field !== "name")
    );
  },
  "bg-warning-subtle": ({ data }) => {
    return new Set(highlightedNames).has(data?.name);
  },
  "bg-white": ({ data }) => {
    return data?.name === "";
  },
  "fw-bold": ({ colDef: { field } }) => field === "name",
  dollar: ({ value }) => `${value}`.startsWith("$"),
};
