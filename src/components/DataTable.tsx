
import { useState } from "react";
import { AccountData } from "@/services/dataService";
import { formatNumber, formatPercentage, formatCurrency } from "@/utils/formatters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SortField = "valid_txn_cnt" | "valid_txn_cnt_range_before" | "diff" | "percentage";
type SortDirection = "asc" | "desc";

interface DataTableProps {
  data: AccountData[];
  onSelectRow: (account: AccountData) => void;
  selectedAccountId: string | null;
}

const DataTable = ({ data, onSelectRow, selectedAccountId }: DataTableProps) => {
  const [sortField, setSortField] = useState<SortField>("diff");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];
    return sortDirection === "asc" 
      ? (valueA > valueB ? 1 : -1) 
      : (valueA < valueB ? 1 : -1);
  });

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 inline ml-1" />
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader className="bg-gray-50 sticky top-0">
          <TableRow>
            <TableHead>Tên công ty</TableHead>
            <TableHead 
              className={cn(
                "text-right header-cell", 
                sortField === "valid_txn_cnt" && "header-cell-active"
              )}
              onClick={() => handleSort("valid_txn_cnt")}
            >
              Giá trị hiện tại {renderSortIcon("valid_txn_cnt")}
            </TableHead>
            <TableHead 
              className={cn(
                "text-right header-cell", 
                sortField === "valid_txn_cnt_range_before" && "header-cell-active"
              )}
              onClick={() => handleSort("valid_txn_cnt_range_before")}
            >
              Giá trị trước {renderSortIcon("valid_txn_cnt_range_before")}
            </TableHead>
            <TableHead 
              className={cn(
                "text-right header-cell", 
                sortField === "diff" && "header-cell-active"
              )}
              onClick={() => handleSort("diff")}
            >
              Chênh lệch {renderSortIcon("diff")}
            </TableHead>
            <TableHead 
              className={cn(
                "text-right header-cell", 
                sortField === "percentage" && "header-cell-active"
              )}
              onClick={() => handleSort("percentage")}
            >
              Tỉ lệ (%) {renderSortIcon("percentage")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((account) => (
            <TableRow 
              key={account.account_id} 
              className={cn(
                "cursor-pointer hover:bg-gray-50",
                selectedAccountId === account.account_id && "selected-row"
              )}
              onClick={() => onSelectRow(account)}
            >
              <TableCell className="font-medium">{account.name}</TableCell>
              <TableCell className="text-right">{formatCurrency(account.valid_txn_cnt)}</TableCell>
              <TableCell className="text-right">{formatCurrency(account.valid_txn_cnt_range_before)}</TableCell>
              <TableCell 
                className={cn(
                  "text-right font-medium",
                  account.diff > 0 ? "text-green-600" : account.diff < 0 ? "text-red-600" : ""
                )}
              >
                {formatCurrency(account.diff)}
              </TableCell>
              <TableCell 
                className={cn(
                  "text-right font-medium",
                  account.percentage && account.percentage > 0 ? "text-green-600" : "text-red-600"
                )}
              >
                {formatPercentage(account.percentage || 0)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
