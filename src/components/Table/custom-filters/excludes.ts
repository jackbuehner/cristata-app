import React from 'react';
import { Row } from 'react-table';

function excludes(rows: Row[], columnIds: string[], exclude: string | number | React.ReactElement): Row[] {
  // run the filter for each column
  columnIds.forEach((id) => {
    // replace the rows with the filtered rows
    // to ensure that subsequent columns do not search excluded rows
    rows = rows.filter((row) => {
      // isolate the value to be checked
      let value = row.values[id];

      // if the value has a label prop, set the value to the label (useful for chips)
      if (value.props.label) value = value.props.label;

      // if value is a number, convert to a string so we can use `includes()`
      if (typeof value !== 'number') value = value.toString();

      // if the value includes the content to be excluded, remove from rows array
      if (value.includes(exclude)) return false; // return false to remove
      return true; // otherwise, return true
    });
  });

  // returned the filtered rows
  return rows;
}

export { excludes };
