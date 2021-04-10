/**
 * Filter a row based on whether the cell's value is a date within the filtered range.
 *
 * The filtered range is made up of a lower bound and an upper bound.
 *
 * The lower bound may be a Date or
 * a number of seconds to be subtracted from the current date and time (the number must be negative).
 * The upper boynd may be a Date or a number of seconds to be added from the current date and time.
 *
 * @param rows
 * @param id
 * @param filterValue -- array of lower bound date and upper bound date or date offset `[lower, upper]`
 */
function dateBetween(rows: any, id: any, filterValue: [Date | number, Date | number]) {
  return rows.filter((row: any) => {
    const rowValueDate = new Date(row.values[id]);

    // if the lower bound is a number that is negative:
    //  - consider the number to be seconds
    //  - calculate a date for the lower bound by subtracting the seconds from the current time
    // otherwise, assume that the lower bound is an acceptable date
    let lowerDate: Date;
    if (typeof filterValue[0] === 'number' && filterValue[0] < 0) {
      const secondsOffset = Math.abs(filterValue[0]);
      lowerDate = new Date(Date.now() - secondsOffset);
    } else {
      lowerDate = new Date(filterValue[0]);
    }

    // if the lower bound is a number that is negative:
    //  - consider the number to be seconds
    //  - calculate a date for the lower bound by subtracting the seconds from the current time
    // otherwise, assume that the lower bound is an acceptable date
    let upperDate: Date;
    if (typeof filterValue[1] === 'number' && filterValue[1] > 0) {
      const secondsOffset = Math.abs(filterValue[1]);
      upperDate = new Date(Date.now() + secondsOffset);
    } else {
      upperDate = new Date(filterValue[1]);
    }

    // return whether date is in range
    return rowValueDate <= upperDate && rowValueDate >= lowerDate;
  });
}

export { dateBetween };
