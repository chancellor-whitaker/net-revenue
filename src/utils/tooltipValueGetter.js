/*
[Adjusted] Institution Aid Less... - Institutional Aid - (State Mandated Waivers + Foundation Scholarships)

Discount rate - (Institutional Aid - (State Mandated Waivers + Foundation Scholarships))/Gross Tuition & Fees

Net revenue - Gross Tuition & Fees - Total External Aid - Adjusted Institutional Aid
*/

const modifications = {
  "Institutional Aid less State Waivers and Foundation":
    "Institutional Aid - (State Mandated Waivers + Foundation Scholarships)",
  "Discount Rate":
    "(Institutional Aid - (State Mandated Waivers + Foundation Scholarships))/Gross Tuition & Fees",
  "Net Revenue w/ BookSmart":
    "Gross Tuition & Fees - Adjusted Institutional Aid - BookSmart",
  "Net Revenue": "Gross Tuition & Fees - Adjusted Institutional Aid",
};

export const tooltipValueGetter = ({ colDef: { field }, value, data }) => {
  if (field === "name") {
    for (const [name, modification] of Object.entries(modifications)) {
      if (value === name) {
        return modification;
      }
    }

    if (data?.Definition && data?.Notes) {
      return `${data?.Definition}`;
    }

    if (data?.Definition) {
      return `${data?.Definition}`;
    }

    if (data?.Notes) {
      return `(${data?.Notes})`;
    }
  }
};
