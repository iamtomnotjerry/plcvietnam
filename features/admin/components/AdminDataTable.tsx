'use client';

import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { AdminTableToolbarSearchField } from '@/features/admin/components/AdminTableToolbarSearchField';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export type AdminDataTableServerPagination = {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

export type AdminDataTableServerToolbarSearch = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
};

export type AdminDataTableProps<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TanStack column value types vary per column
  columns: ColumnDef<T, any>[];
  data: T[];
  getRowId?: (originalRow: T, index: number) => string;
  mode: 'client' | 'server';
  /** Client-only: global search across table */
  enableGlobalFilter?: boolean;
  /** Server list: search field in table toolbar (same chrome as client global filter). */
  serverToolbarSearch?: AdminDataTableServerToolbarSearch;
  /** Client-only: column sorting */
  enableSorting?: boolean;
  initialPageSize?: number;
  serverPagination?: AdminDataTableServerPagination;
  emptyLabel: string;
  toolbar?: React.ReactNode;
  isLoading?: boolean;
  /** Merged onto the outer table shell (border, shadow, radius). */
  className?: string;
};

export function AdminDataTable<T>({
  columns,
  data,
  getRowId,
  mode,
  enableGlobalFilter = false,
  serverToolbarSearch,
  enableSorting = true,
  initialPageSize = 10,
  serverPagination,
  emptyLabel,
  toolbar,
  isLoading = false,
  className,
}: AdminDataTableProps<T>) {
  const t = useTranslations('admin.dataTable');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const pageCount = useMemo(() => {
    if (mode !== 'server' || !serverPagination) return undefined;
    const { totalCount, pageSize } = serverPagination;
    return Math.max(1, Math.ceil(totalCount / pageSize));
  }, [mode, serverPagination]);

  // TanStack Table: React Compiler skips memoization for this hook (safe for our usage).
  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable returns unstable function refs by design
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: mode === 'client' && enableGlobalFilter ? globalFilter : undefined,
      pagination:
        mode === 'server' && serverPagination
          ? {
              pageIndex: serverPagination.page - 1,
              pageSize: serverPagination.pageSize,
            }
          : pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: mode === 'client' && enableGlobalFilter ? setGlobalFilter : undefined,
    onPaginationChange:
      mode === 'server' && serverPagination
        ? (updater) => {
            const next =
              typeof updater === 'function'
                ? updater({
                    pageIndex: serverPagination.page - 1,
                    pageSize: serverPagination.pageSize,
                  })
                : updater;
            const newPage = next.pageIndex + 1;
            if (newPage !== serverPagination.page) serverPagination.onPageChange(newPage);
            if (next.pageSize !== serverPagination.pageSize && serverPagination.onPageSizeChange) {
              serverPagination.onPageSizeChange(next.pageSize);
            }
          }
        : setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: mode === 'client' && enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel:
      mode === 'client' && enableGlobalFilter ? getFilteredRowModel() : undefined,
    getPaginationRowModel: mode === 'client' ? getPaginationRowModel() : undefined,
    manualPagination: mode === 'server',
    pageCount: mode === 'server' ? pageCount : undefined,
    getRowId,
  });

  const showToolbar =
    toolbar ||
    (mode === 'client' && enableGlobalFilter) ||
    (mode === 'server' && serverToolbarSearch);
  const totalRows =
    mode === 'server' && serverPagination
      ? serverPagination.totalCount
      : table.getFilteredRowModel().rows.length;
  const currentPage =
    mode === 'server' && serverPagination ? serverPagination.page : pagination.pageIndex + 1;
  const currentPageSize =
    mode === 'server' && serverPagination ? serverPagination.pageSize : pagination.pageSize;
  const totalPages =
    mode === 'server' && serverPagination
      ? Math.max(1, Math.ceil(serverPagination.totalCount / serverPagination.pageSize))
      : table.getPageCount();

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={100}>
      <div
        className={[
          'overflow-hidden rounded-xl border border-border bg-card shadow-sm',
          className?.trim(),
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {showToolbar && (
          <div className="flex flex-col gap-3 border-b border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              {mode === 'client' && enableGlobalFilter && (
                <AdminTableToolbarSearchField
                  value={globalFilter}
                  onChange={setGlobalFilter}
                  placeholder={t('searchPlaceholder')}
                  ariaLabel={t('searchAria')}
                />
              )}
              {mode === 'server' && serverToolbarSearch && (
                <AdminTableToolbarSearchField
                  value={serverToolbarSearch.value}
                  onChange={serverToolbarSearch.onChange}
                  placeholder={serverToolbarSearch.placeholder}
                  ariaLabel={serverToolbarSearch.ariaLabel}
                />
              )}
              {toolbar}
            </div>
            {!isLoading && totalRows > 0 && (
              <p className="shrink-0 text-xs text-muted-foreground">
                {t('rowCount', { count: totalRows })}
              </p>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 align-middle font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody aria-busy={isLoading} aria-label={isLoading ? t('loading') : undefined}>
              {isLoading ? (
                Array.from({ length: Math.min(Math.max(currentPageSize, 1), 12) }, (_, ri) => (
                  <tr key={`sk-${ri}`} className="border-b border-border/80 last:border-0">
                    {columns.map((_, ci) => (
                      <td key={ci} className="px-4 py-3 align-middle">
                        <div
                          className="h-4 max-w-full animate-pulse rounded-md bg-muted/70"
                          style={{ width: `${45 + ((ri * 3 + ci * 7) % 40)}%` }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    {emptyLabel}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={false}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, delay: Math.min(i * 0.02, 0.2) }}
                    className="border-b border-border/80 last:border-0 hover:bg-muted/30"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading &&
          (mode === 'client'
            ? table.getFilteredRowModel().rows.length > 0
            : serverPagination && serverPagination.totalCount > 0) && (
            <div className="flex flex-col gap-4 border-t border-border/60 bg-gradient-to-b from-muted/30 via-muted/10 to-transparent px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('rowsPerPage')}
                </span>
                {mode === 'server' && !serverPagination?.onPageSizeChange ? (
                  <span className="inline-flex h-9 min-w-[2.75rem] items-center justify-center rounded-lg border border-border/70 bg-background px-3 text-sm font-semibold tabular-nums shadow-sm">
                    {currentPageSize}
                  </span>
                ) : (
                  <div className="relative">
                    <select
                      className="h-9 min-w-[4.5rem] cursor-pointer appearance-none rounded-lg border border-border/80 bg-background py-0 pl-3 pr-9 text-sm font-semibold tabular-nums text-foreground shadow-sm transition-[border-color,box-shadow] hover:border-primary/35 focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                      value={
                        PAGE_SIZE_OPTIONS.includes(
                          currentPageSize as (typeof PAGE_SIZE_OPTIONS)[number]
                        )
                          ? currentPageSize
                          : PAGE_SIZE_OPTIONS[0]
                      }
                      onChange={(e) => {
                        const size = Number(e.target.value);
                        if (mode === 'server' && serverPagination?.onPageSizeChange) {
                          serverPagination.onPageSizeChange(size);
                        } else {
                          table.setPageSize(size);
                        }
                      }}
                      aria-label={t('rowsPerPageAria')}
                    >
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <p
                  className="rounded-lg border border-border/60 bg-background/90 px-3 py-1.5 text-sm font-medium tabular-nums text-foreground shadow-sm"
                  aria-live="polite"
                >
                  {t('pageOf', { current: currentPage, total: totalPages })}
                </p>
                <div className="inline-flex items-center rounded-xl border border-border/70 bg-background/90 p-1 shadow-sm backdrop-blur-sm">
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/12 hover:text-primary disabled:pointer-events-none disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                    disabled={currentPage <= 1}
                    onClick={() => {
                      if (mode === 'server' && serverPagination) {
                        serverPagination.onPageChange(serverPagination.page - 1);
                      } else {
                        table.previousPage();
                      }
                    }}
                    aria-label={t('prevPage')}
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                  </button>
                  <span className="mx-0.5 h-5 w-px shrink-0 bg-border/80" aria-hidden />
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/12 hover:text-primary disabled:pointer-events-none disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                    disabled={currentPage >= totalPages}
                    onClick={() => {
                      if (mode === 'server' && serverPagination) {
                        serverPagination.onPageChange(serverPagination.page + 1);
                      } else {
                        table.nextPage();
                      }
                    }}
                    aria-label={t('nextPage')}
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </TooltipProvider>
  );
}
