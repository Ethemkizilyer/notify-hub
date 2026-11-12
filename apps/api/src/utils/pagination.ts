export function getSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
export function buildPaginationMeta(page: number, limit: number, total: number) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
