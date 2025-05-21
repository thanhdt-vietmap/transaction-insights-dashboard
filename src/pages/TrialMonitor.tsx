
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTrialMonitorData } from "@/services/trialMonitorService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import DateRangePicker from "@/components/DateRangePicker";
import { RefreshCw, Search, Filter } from "lucide-react";
import TrialMonitorTable from "@/components/TrialMonitorTable";
import RangeSelector from "@/components/RangeSelector";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

// Account status enum
export enum AccountStatus {
  NORMAL = "Normal",
  POTENTIAL = "Potential",
  PARTNER = "Partner",
  NEEDS_REVIEW = "Review"
}

// Account types from dataService
export type AccountType = "TRIAL" | "STANDARD" | "ENTERPRISE" | "INTERNAL" | "ALL";

const TrialMonitor = () => {
  // Set default date range to last month
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const [fromDate, setFromDate] = useState(lastMonth.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(today.toISOString().split('T')[0]);
  const [rangeCount, setRangeCount] = useState(3); // Default number of ranges to check
  const [shouldFetch, setShouldFetch] = useState(false);
  
  // New state for filtering and searching
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<AccountStatus[]>([]);
  const [selectedAccountTypes, setSelectedAccountTypes] = useState<AccountType[]>(["TRIAL"]);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["trialMonitorData", fromDate, toDate, rangeCount],
    queryFn: () => fetchTrialMonitorData(fromDate, toDate, rangeCount),
    enabled: shouldFetch,
  });
  
  // Initial fetch when component mounts
  useEffect(() => {
    setShouldFetch(true);
  }, []);
  
  const handleDateChange = (newFromDate: string, newToDate: string) => {
    setFromDate(newFromDate);
    setToDate(newToDate);
    setShouldFetch(false); // Disable auto-fetching when date changes
  };
  
  const handleRangeChange = (count: number) => {
    setRangeCount(count);
    setShouldFetch(false);
  };
  
  const handleFetchData = () => {
    setShouldFetch(true);
    refetch().then((result) => {
      if (result.data) {
        toast({
          title: "Đã tải dữ liệu",
          description: `Dữ liệu từ ${fromDate} đến ${toDate} với ${rangeCount} khoảng đã được cập nhật. Hiển thị ${result.data.length} tài khoản có giao dịch.`
        });
      }
    });
  };

  // Handle status selection toggle
  const handleStatusChange = (status: AccountStatus) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  // Handle account type selection toggle
  const handleAccountTypeChange = (type: AccountType) => {
    setSelectedAccountTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-2">Đã xảy ra lỗi</h2>
          <p>Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b py-3 sm:py-4 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="font-bold text-lg sm:text-xl text-primary">VietMap Trial Monitor</h1>
          <Link to="/">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </header>
      <main className="animate-fade-in pb-8">
        <div className="w-[90%] mx-auto px-4 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col space-y-4 sm:space-y-6 lg:space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">TRIAL MONITOR</h1>
              <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
                Theo dõi tài khoản trial từ {fromDate} đến {toDate} với {rangeCount} khoảng thời gian
              </p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-4">
              <Card className="flex-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg sm:text-xl">Thời gian</CardTitle>
                  <CardDescription>Chọn khoảng thời gian để xem dữ liệu</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0 gap-4">
                    <DateRangePicker 
                      fromDate={fromDate} 
                      toDate={toDate} 
                      onDateChange={handleDateChange} 
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="flex-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg sm:text-xl">Số lượng khoảng</CardTitle>
                  <CardDescription>Chọn số lượng khoảng thời gian cần kiểm tra</CardDescription>
                </CardHeader>
                <CardContent>
                  <RangeSelector 
                    rangeCount={rangeCount}
                    onChange={handleRangeChange}
                  />
                </CardContent>
              </Card>
              
              <Card className="lg:w-1/4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg sm:text-xl">Tải dữ liệu</CardTitle>
                  <CardDescription>Cập nhật dữ liệu theo tiêu chí đã chọn</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleFetchData} 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Đang tải...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Tải dữ liệu
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg sm:text-xl flex items-center justify-between">
                  <div>Theo dõi tài khoản Trial</div>
                  <div className="flex items-center gap-2">
                    {/* Search Box */}
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm theo tên"
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Status Filter Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Filter className="h-4 w-4" />
                          Bộ lọc
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Trạng thái</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {Object.values(AccountStatus).map((status) => (
                          <DropdownMenuCheckboxItem
                            key={status}
                            checked={selectedStatuses.includes(status)}
                            onCheckedChange={() => handleStatusChange(status)}
                          >
                            {status}
                          </DropdownMenuCheckboxItem>
                        ))}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Loại tài khoản</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {["TRIAL", "STANDARD", "ENTERPRISE", "INTERNAL"].map((type) => (
                          <DropdownMenuCheckboxItem
                            key={type}
                            checked={selectedAccountTypes.includes(type as AccountType)}
                            onCheckedChange={() => handleAccountTypeChange(type as AccountType)}
                          >
                            {type}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardTitle>
                <CardDescription>Thông tin giao dịch tài khoản theo thời gian</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : data ? (
                  <TrialMonitorTable 
                    data={data.filteredData}
                    ranges={data.ranges} 
                    searchTerm={searchTerm}
                    selectedStatuses={selectedStatuses}
                    selectedAccountTypes={selectedAccountTypes}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nhấn "Tải dữ liệu" để xem danh sách tài khoản
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrialMonitor;
