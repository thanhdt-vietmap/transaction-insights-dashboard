import { useState, useRef, useEffect } from "react";
import { AccountData, AccountType } from "@/services/dataService";
import { formatTransactionCount, formatPercentage } from "@/utils/formatters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUp, ArrowDown, Filter, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const [selectedAccountTypes, setSelectedAccountTypes] = useState<AccountType[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  // Get unique account types from data (excluding "ALL" which is handled separately)
  const accountTypes: AccountType[] = Array.from(
    new Set(data.map(account => account.account_type))
  ).filter(type => type !== "ALL") as AccountType[];

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    };

    if (isPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopoverOpen]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const toggleAccountType = (type: AccountType) => {
    setSelectedAccountTypes(prev => {
      // If type already exists in the array, remove it
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } 
      // Otherwise, add it to the array
      else {
        return [...prev, type];
      }
    });
  };

  // Filter data by selected account types
  const filteredData = selectedAccountTypes.length === 0
    ? data // If no types selected, show all
    : data.filter(account => selectedAccountTypes.includes(account.account_type));

  // Then sort the filtered data
  const sortedData = [...filteredData].sort((a, b) => {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {selectedAccountTypes.length > 0 && (
            selectedAccountTypes.map(type => (
              <Badge 
                key={type} 
                className={cn("cursor-pointer", getAccountTypeClass(type))}
                onClick={() => toggleAccountType(type)}
              >
                {type} <span className="ml-1">×</span>
              </Badge>
            ))
          )}
        </div>
        
        <div className="flex items-center space-x-2" ref={popoverRef}>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span>Loại tài khoản</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="end">
              <div className="p-2">
                {accountTypes.map((type) => (
                  <div
                    key={type}
                    className={cn(
                      "flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer",
                      selectedAccountTypes.includes(type) ? "bg-gray-100" : ""
                    )}
                    onClick={() => toggleAccountType(type)}
                  >
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium", 
                      getAccountTypeClass(type)
                    )}>
                      {type}
                    </span>
                    {selectedAccountTypes.includes(type) && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <ScrollArea className="w-full">
          <div className="min-w-[800px]">
            <Table className="w-full table-fixed">
              <TableHeader className="bg-gray-50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="font-medium text-xs sm:text-sm whitespace-nowrap w-[30%]">Tên công ty</TableHead>
                  <TableHead 
                    className={cn(
                      "text-right header-cell font-medium text-xs sm:text-sm whitespace-nowrap w-[15%]", 
                      sortField === "valid_txn_cnt" && "header-cell-active"
                    )}
                    onClick={() => handleSort("valid_txn_cnt")}
                  >
                    Hiện tại {renderSortIcon("valid_txn_cnt")}
                  </TableHead>
                  <TableHead 
                    className={cn(
                      "text-right header-cell font-medium text-xs sm:text-sm whitespace-nowrap w-[15%]", 
                      sortField === "valid_txn_cnt_range_before" && "header-cell-active"
                    )}
                    onClick={() => handleSort("valid_txn_cnt_range_before")}
                  >
                    Trước {renderSortIcon("valid_txn_cnt_range_before")}
                  </TableHead>
                  <TableHead 
                    className={cn(
                      "text-right header-cell font-medium text-xs sm:text-sm whitespace-nowrap w-[15%]", 
                      sortField === "diff" && "header-cell-active"
                    )}
                    onClick={() => handleSort("diff")}
                  >
                    +/- {renderSortIcon("diff")}
                  </TableHead>
                  <TableHead 
                    className={cn(
                      "text-right header-cell font-medium text-xs sm:text-sm whitespace-nowrap w-[15%]", 
                      sortField === "percentage" && "header-cell-active"
                    )}
                    onClick={() => handleSort("percentage")}
                  >
                    % {renderSortIcon("percentage")}
                  </TableHead>
                  <TableHead className="font-medium text-xs sm:text-sm whitespace-nowrap text-center w-[10%]">
                    Loại
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.length > 0 ? (
                  sortedData.map((account) => (
                    <TableRow 
                      key={account.account_id} 
                      className={cn(
                        "cursor-pointer hover:bg-gray-50",
                        selectedAccountId === account.account_id && "bg-blue-50"
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Không có tài khoản nào phù hợp với bộ lọc.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default DataTable;
