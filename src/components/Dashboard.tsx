
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchData, AccountData } from "@/services/dataService";
import DataTable from "@/components/DataTable";
import AccountChart from "@/components/AccountChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import DateRangePicker from "@/components/DateRangePicker";
import { RefreshCw } from "lucide-react";

const Dashboard = () => {
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);
  
  // Set default date range to last month
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const [fromDate, setFromDate] = useState(lastMonth.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(today.toISOString().split('T')[0]);
  const [shouldFetch, setShouldFetch] = useState(false);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["accountData", fromDate, toDate],
    queryFn: () => fetchData(fromDate, toDate),
    enabled: shouldFetch,
  });
  
  // Initial fetch when component mounts
  useEffect(() => {
    setShouldFetch(true);
  }, []);
  
  useEffect(() => {
    if (data && data.length > 0 && !selectedAccount) {
      setSelectedAccount(data[0]);
    }
  }, [data, selectedAccount]);

  const handleSelectRow = (account: AccountData) => {
    setSelectedAccount(account);
  };
  
  const handleDateChange = (newFromDate: string, newToDate: string) => {
    setFromDate(newFromDate);
    setToDate(newToDate);
    setShouldFetch(false); // Disable auto-fetching when date changes
  };
  
  const handleFetchData = () => {
    setShouldFetch(true);
    refetch().then(() => {
      toast({
        title: "Đã tải dữ liệu",
        description: `Dữ liệu từ ngày ${fromDate} đến ngày ${toDate} đã được cập nhật.`
      });
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Đã xảy ra lỗi</h2>
          <p>Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
          <p className="text-muted-foreground mt-2">
            Dữ liệu thống kê giao dịch từ {fromDate} đến {toDate}
          </p>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Thời gian</CardTitle>
            <CardDescription>Chọn khoảng thời gian để xem dữ liệu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <DateRangePicker 
                fromDate={fromDate} 
                toDate={toDate} 
                onDateChange={handleDateChange} 
              />
              
              <Button 
                onClick={handleFetchData} 
                className="min-w-[120px]"
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
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Danh sách tài khoản</CardTitle>
                <CardDescription>Chọn một tài khoản để xem chi tiết</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : data ? (
                  <DataTable 
                    data={data} 
                    onSelectRow={handleSelectRow}
                    selectedAccountId={selectedAccount?.account_id || null}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nhấn "Tải dữ liệu" để xem danh sách tài khoản
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            {isLoading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[400px] w-full" />
                </CardContent>
              </Card>
            ) : selectedAccount ? (
              <AccountChart account={selectedAccount} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Biểu đồ tài khoản</CardTitle>
                  <CardDescription>Chọn một tài khoản để xem biểu đồ</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Chọn một tài khoản từ bảng để hiển thị biểu đồ
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
