export const headerClass = ({ colDef: { field } }) =>
  field === "name"
    ? `${defaultHeaderClass} text-transparent`
    : defaultHeaderClass;

const defaultHeaderClass = "fw-bold fs-5";
