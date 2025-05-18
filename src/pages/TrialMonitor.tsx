
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTrialMonitorData } from "@/services/trialMonitorService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import DateRangePicker from "@/components/DateRangePicker";
import { RefreshCw } from "lucide-react";
import TrialMonitorTable from "@/components/TrialMonitorTable";
import RangeSelector from "@/components/RangeSelector";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

// Account status enum
export enum AccountStatus {
  NORMAL = "Normal",
  POTENTIAL = "Tiềm năng",
  PARTNER = "Đối tác",
  NEEDS_REVIEW = "Cần kiểm tra"
}

const TrialMonitor = () => {
  // Set default date range to last month
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const [fromDate, setFromDate] = useState(lastMonth.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(today.toISOString().split('T')[0]);
  const [rangeCount, setRangeCount] = useState(3); // Default number of ranges to check
  const [shouldFetch, setShouldFetch] = useState(false);
  
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
    refetch().then(() => {
      toast({
        title: "Đã tải dữ liệu",
        description: `Dữ liệu từ ngày ${fromDate} đến ngày ${toDate} với ${rangeCount} khoảng đã được cập nhật.`
      });
    });
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
                <CardTitle className="text-lg sm:text-xl">Theo dõi tài khoản Trial</CardTitle>
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
                  <TrialMonitorTable data={data} />
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
