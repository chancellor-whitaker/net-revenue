import { removeLastElement } from "./removeLastElement";
import { makeArray } from "./makeArray";

export const splitIntoGroups = (param1, param2) => {
  const [rows, fields] = [makeArray(param1), makeArray(param2)];

  const allButLastField = removeLastElement(fields);

  const lastField = fields[fields.length - 1];

  const groups = [];

  const tree = {};

  rows.forEach((row) => {
    let node = tree;

    allButLastField.forEach((field) => {
      const value = row[field];

      if (!(value in node)) node[value] = {};

      node = node[value];
    });

    const lastValue = row[lastField];

    if (!(lastValue in node)) {
      node[lastValue] = [];

      groups.push(node[lastValue]);
    }

    node[lastValue].push(row);
  });

  return groups;
};
