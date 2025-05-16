
import { useState } from "react";
import { AccountData } from "@/services/dataService";
import { formatTransactionCount, formatPercentage } from "@/utils/formatters";
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
      <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 inline ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 inline ml-1" />
    );
  };

  const getAccountTypeClass = (type: string) => {
    switch (type) {
      case "TRIAL": return "bg-blue-100 text-blue-800";
      case "INTERNAL": return "bg-purple-100 text-purple-800";
      case "STANDARD": return "bg-green-100 text-green-800";
      case "ENTERPRISE": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="min-w-[800px]">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-gray-50 sticky top-0 z-10">
            <TableRow>
              <TableHead className="font-medium text-xs sm:text-sm whitespace-nowrap">Tên công ty</TableHead>
              <TableHead 
                className={cn(
                  "text-right header-cell font-medium text-xs sm:text-sm whitespace-nowrap", 
                  sortField === "valid_txn_cnt" && "header-cell-active"
                )}
                onClick={() => handleSort("valid_txn_cnt")}
              >
                Hiện tại {renderSortIcon("valid_txn_cnt")}
              </TableHead>
              <TableHead 
                className={cn(
                  "text-right header-cell font-medium text-xs sm:text-sm whitespace-nowrap", 
                  sortField === "valid_txn_cnt_range_before" && "header-cell-active"
                )}
                onClick={() => handleSort("valid_txn_cnt_range_before")}
              >
                Trước {renderSortIcon("valid_txn_cnt_range_before")}
              </TableHead>
              <TableHead 
                className={cn(
                  "text-right header-cell font-medium text-xs sm:text-sm whitespace-nowrap", 
                  sortField === "diff" && "header-cell-active"
                )}
                onClick={() => handleSort("diff")}
              >
                +/- {renderSortIcon("diff")}
              </TableHead>
              <TableHead 
                className={cn(
                  "text-right header-cell font-medium text-xs sm:text-sm whitespace-nowrap", 
                  sortField === "percentage" && "header-cell-active"
                )}
                onClick={() => handleSort("percentage")}
              >
                % {renderSortIcon("percentage")}
              </TableHead>
              <TableHead className="font-medium text-xs sm:text-sm whitespace-nowrap text-center">
                Loại
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
  
        {/* Scrollable body */}
        <div className="max-h-[700px] overflow-y-auto">
          <Table className="table-fixed w-full">
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
                  <TableCell className="font-medium text-xs sm:text-sm">{account.name}</TableCell>
                  <TableCell className="text-right text-xs sm:text-sm">{formatTransactionCount(account.valid_txn_cnt)}</TableCell>
                  <TableCell className="text-right text-xs sm:text-sm">{formatTransactionCount(account.valid_txn_cnt_range_before)}</TableCell>
                  <TableCell 
                    className={cn(
                      "text-right font-medium text-xs sm:text-sm",
                      account.diff > 0 ? "text-green-600" : account.diff < 0 ? "text-red-600" : ""
                    )}
                  >
                    {formatTransactionCount(account.diff)}
                  </TableCell>
                  <TableCell 
                    className={cn(
                      "text-right font-medium text-xs sm:text-sm",
                      account.percentage && account.percentage > 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {formatPercentage(account.percentage || 0)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium", 
                      getAccountTypeClass(account.account_type)
                    )}>
                      {account.account_type}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
