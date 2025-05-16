export const filterRows = (rows, dropdowns) => {
  return rows.filter((row) => {
    for (const [field, set] of Object.entries(dropdowns)) {
      const value = row[field];

      if (!set.has(value)) return false;
    }

    return true;
  });
};
