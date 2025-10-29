"use client";

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={className}>
      <div className="border-border bg-card animate-pulse rounded-lg border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-border bg-muted/50 border-b">
              <tr>
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="px-6 py-3 text-left">
                    <div className="bg-muted h-4 w-24 rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, rowIdx) => (
                <tr key={rowIdx} className="border-border border-b last:border-0">
                  {Array.from({ length: columns }).map((_, colIdx) => (
                    <td key={colIdx} className="px-6 py-4">
                      <div className="bg-muted h-4 w-full rounded" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

TableSkeleton.displayName = "TableSkeleton";
