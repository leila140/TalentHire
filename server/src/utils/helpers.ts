export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parsePagination(query: { page?: unknown; limit?: unknown }, defaults = { page: 1, limit: 20, maxLimit: 50 }) {
  const page = Math.max(1, parseInt(String(query.page), 10) || defaults.page);
  const limit = Math.min(defaults.maxLimit, Math.max(1, parseInt(String(query.limit), 10) || defaults.limit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
