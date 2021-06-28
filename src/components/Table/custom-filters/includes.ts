import React from 'react';
import { Row } from 'react-table';

function includes(rows: Row[], columnIds: string[], include: string | number | React.ReactElement): Row[] {
  // run the filter for each column
  columnIds.forEach((id) => {
    // replace the rows with the filtered rows
    // to ensure that subsequent columns do not search excluded rows
    rows = rows.filter((row) => {
      // isolate the value to be checked
      let value = row.values[id];

      // if the value has a label prop, set the value to the label (useful for chips)
      if (value.props && value.props.label) value = value.props.label.toLowerCase();

      // if the value has children with label props, set the value to an array of the labels
      if (value.props && value.props.children) {
        value = value.props.children.map((child: any) => {
          if (child.props && child.props.label) return child.props.label.toLowerCase();
          return null;
        });
      }

      // if value is a number, convert to a string so we can use `includes()`
      if (typeof value === 'number') value = value.toString();

      // if value is a boolean, convert to a string so we can use `includes()`
      if (typeof value === 'boolean') value = value.toString();

      // if include is a string, make it lowercase
      if (typeof include === 'string') include = include.toLowerCase();

      // if the value does not include the content that must be included, remove from rows array
      if (!value.includes(include)) return false; // return false to remove
      return true; // otherwise, return true
    });
  });

  // returned the filtered rows
  return rows;
}

export { includes };
