import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationData {
  current_page: number;
  per_page: number;
  total: number;
}

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { current_page, per_page, total } = pagination;
  const totalPages = Math.ceil(total / per_page);

  if (total === 0) return null;

  const start = (current_page - 1) * per_page + 1;
  const end = Math.min(current_page * per_page, total);

  return (
    <div className="flex items-center justify-between p-4 border-t">
      <div className="text-sm text-base-content/60">
        Showing {start} - {end} of {total}
      </div>
      <div className="join">
        <button
          className="join-item btn btn-sm"
          disabled={current_page <= 1}
          onClick={() => onPageChange(current_page - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button className="join-item btn btn-sm">
          Page {current_page} of {totalPages}
        </button>
        <button
          className="join-item btn btn-sm"
          disabled={current_page >= totalPages}
          onClick={() => onPageChange(current_page + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
