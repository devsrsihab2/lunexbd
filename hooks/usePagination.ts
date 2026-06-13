export function usePagination(page = 1, totalPages = 1) {
  return {
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
    nextPage: Math.min(totalPages, page + 1),
    previousPage: Math.max(1, page - 1),
  };
}
