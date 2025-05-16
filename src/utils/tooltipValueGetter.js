export const tooltipValueGetter = ({ colDef: { field }, data }) => {
  if (field === "name") {
    if (data?.Definition && data?.Notes) {
      return `${data?.Definition} (${data?.Notes})`.replace(" in 23-24", "");
    }

    if (data?.Definition) {
      return `${data?.Definition}`;
    }

    if (data?.Notes) {
      return `(${data?.Notes})`.replace(" in 23-24", "");
    }
  }
};
