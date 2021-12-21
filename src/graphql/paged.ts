const pagedFields = {
  totalDocs: true,
  page: true,
  totalPages: true,
  pagingCounter: true,
  hasPrevPage: true,
  hasNextPage: true,
  prevPage: true,
  nextPage: true,
};

function paged(obj: Record<string, unknown>) {
  return {
    ...pagedFields,
    docs: obj,
  };
}

export { paged, pagedFields };
