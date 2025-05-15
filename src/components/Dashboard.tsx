
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchData, AccountData } from "@/services/dataService";
import DataTable from "@/components/DataTable";
import AccountChart from "@/components/AccountChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const [selectedAccount, setSelectedAccount] = useState<AccountData | null>(null);
  
  // Set default date range to last month
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const fromDate = lastMonth.toISOString().split('T')[0];
  const toDate = today.toISOString().split('T')[0];
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["accountData", fromDate, toDate],
    queryFn: () => fetchData(fromDate, toDate),
  });
  
  useEffect(() => {
    if (data && data.length > 0 && !selectedAccount) {
      setSelectedAccount(data[0]);
    }
  }, [data, selectedAccount]);

  const handleSelectRow = (account: AccountData) => {
    setSelectedAccount(account);
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
                ) : null}
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
            ) : (
              <AccountChart account={selectedAccount} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
