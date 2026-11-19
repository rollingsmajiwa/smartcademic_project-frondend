import React, { useState, useEffect, useMemo } from 'react';

/**
 * usePagination(items, initialPageSize)
 * Client-side pagination for any array.
 *
 *   const pager = usePagination(teachers, 10);
 *   pager.pageItems.map(...)          // only the current page's rows
 *   <Pagination pager={pager} />      // the controls
 */
export function usePagination(items = [], initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // If the list shrinks (delete, filter, new class selected), never stay on a page that no longer exists
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);

  const pageItems = useMemo(
    () => items.slice(startIndex, startIndex + pageSize),
    [items, startIndex, pageSize]
  );

  const setPageSize = (size) => {
    setPageSizeState(Number(size));
    setPage(1);
  };

  return {
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    startIndex, // 0-based index of the first item on this page (handy for row numbers)
    endIndex,
    pageItems,
  };
}

// Builds [1, '…', 4, 5, 6, '…', 20] style lists
function getPageList(current, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', totalPages];
  if (current >= totalPages - 3) {
    return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '…', current - 1, current, current + 1, '…', totalPages];
}

const btn =
  'min-w-[2rem] h-8 px-2.5 rounded-lg text-xs font-bold border border-[#c77dff] bg-white text-[#10002b] ' +
  'hover:bg-[#c77dff] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white';

export function Pagination({ pager, pageSizeOptions = [5, 10, 25, 50], unit = 'Rows', className = '' }) {
  const { page, setPage, pageSize, setPageSize, total, totalPages, startIndex, endIndex } = pager;

  // Always include the current page size so the dropdown never shows a value that isn't in the list
  const options = Array.from(new Set([...pageSizeOptions, pageSize])).sort((a, b) => a - b);

  // Nothing to paginate
  if (total <= Math.min(...pageSizeOptions)) return null;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full text-xs text-[#10002b] ${className}`}
    >
      {/* Range + page size */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-semibold text-[#10002b]/80">
          Showing {total === 0 ? 0 : startIndex + 1}–{endIndex} of {total}
        </span>
        <label className="flex items-center gap-2 font-semibold">
          {unit}
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            className="h-8 px-2 rounded-lg border border-[#10002b] bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#c77dff]"
          >
            {options.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Controls */}
      <nav className="flex items-center gap-1.5 flex-wrap" aria-label="Pagination">
        <button type="button" className={btn} onClick={() => setPage(1)} disabled={page === 1} aria-label="First page">
          «
        </button>
        <button type="button" className={btn} onClick={() => setPage(page - 1)} disabled={page === 1}>
          Prev
        </button>

        {/* Phones: compact "Page x of y". Larger screens: numbered buttons. */}
        <span className="sm:hidden px-2 font-bold">
          Page {page} of {totalPages}
        </span>
        <div className="hidden sm:flex items-center gap-1.5">
          {getPageList(page, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`gap-${i}`} className="px-1 text-[#10002b]/50">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                aria-current={p === page ? 'page' : undefined}
                className={`${btn} ${p === page ? '!bg-[#10002b] !text-white !border-[#10002b]' : ''}`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button type="button" className={btn} onClick={() => setPage(page + 1)} disabled={page === totalPages}>
          Next
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
          aria-label="Last page"
        >
          »
        </button>
      </nav>
    </div>
  );
}

export default Pagination;
