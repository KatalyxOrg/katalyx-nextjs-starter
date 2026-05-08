import { forwardRef, type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

// ─── Table ───

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(({ className, ...props }, ref) => (
  <div className="w-full overflow-x-auto">
    <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
));
Table.displayName = "Table";

// ─── Table Header ───

const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("border-b border-border bg-muted/50", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

// ─── Table Body ───

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

// ─── Table Row ───

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn("border-b border-border transition-colors duration-150", "hover:bg-muted/30", "data-[selected=true]:bg-primary-light", className)} {...props} />
));
TableRow.displayName = "TableRow";

// ─── Table Head ───

type TableHeadProps = ThHTMLAttributes<HTMLTableCellElement> & {
  sortable?: boolean;
  sorted?: "asc" | "desc" | false;
  onSort?: () => void;
};

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(({ className, sortable, sorted, onSort, children, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-3 text-left align-middle text-xs font-medium uppercase tracking-wider text-muted-foreground",
      sortable && "cursor-pointer select-none hover:text-foreground",
      className,
    )}
    onClick={sortable ? onSort : undefined}
    aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
    {...props}
  >
    <span className="inline-flex items-center gap-1">
      {children}
      {sortable && (
        <span className="inline-flex flex-col leading-none">
          <svg className={cn("h-3 w-3", sorted === "asc" ? "text-foreground" : "text-muted-foreground/40")} viewBox="0 0 10 5" fill="currentColor">
            <path d="M5 0L10 5H0z" />
          </svg>
          <svg className={cn("h-3 w-3 -mt-0.5", sorted === "desc" ? "text-foreground" : "text-muted-foreground/40")} viewBox="0 0 10 5" fill="currentColor">
            <path d="M5 5L0 0h10z" />
          </svg>
        </span>
      )}
    </span>
  </th>
));
TableHead.displayName = "TableHead";

// ─── Table Cell ───

const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("px-3 py-2.5 align-middle text-sm text-foreground", className)} {...props} />
));
TableCell.displayName = "TableCell";

// ─── Exports ───

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
export type { TableHeadProps };
