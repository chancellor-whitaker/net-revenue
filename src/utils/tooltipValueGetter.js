export const tooltipValueGetter = ({ colDef: { field }, data }) => {
  if (field === "name") {
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
