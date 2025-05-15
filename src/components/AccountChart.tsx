
import { useEffect, useMemo } from "react";
import { AccountData } from "@/services/dataService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { formatNumber, formatCurrency } from "@/utils/formatters";

interface AccountChartProps {
  account: AccountData | null;
}

const AccountChart = ({ account }: AccountChartProps) => {
  const chartData = useMemo(() => {
    if (!account) return [];
    
    return [
      {
        name: "Giá trị trước",
        value: account.valid_txn_cnt_range_before,
        color: "#94a3b8"
      },
      {
        name: "Giá trị hiện tại",
        value: account.valid_txn_cnt,
        color: "#3b82f6"
      },
      {
        name: "Chênh lệch",
        value: account.diff,
        color: account.diff > 0 ? "#22c55e" : "#ef4444"
      }
    ];
  }, [account]);

  if (!account) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="p-6 text-center text-gray-500">
          <p>Chọn một công ty từ bảng để xem biểu đồ</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{account.name}</CardTitle>
        <CardDescription>
          {account.metadata.contact.name && <span>Liên hệ: {account.metadata.contact.name}</span>}
          {account.metadata.contact.email && (
            <span className="block">{account.metadata.contact.email}</span>
          )}
          {account.metadata.contact.phone && (
            <span className="block">SĐT: {account.metadata.contact.phone}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 50,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip 
                formatter={(value: number) => [formatNumber(value), "Giá trị"]}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Legend wrapperStyle={{ paddingTop: 20 }} />
              <Bar dataKey="value" name="Giá trị">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-3 border rounded-lg bg-gray-50">
            <span className="text-sm text-gray-500">Giá trị hiện tại</span>
            <span className="text-lg font-semibold">{formatCurrency(account.valid_txn_cnt)}</span>
          </div>
          <div className="flex flex-col items-center p-3 border rounded-lg bg-gray-50">
            <span className="text-sm text-gray-500">Giá trị trước</span>
            <span className="text-lg font-semibold">{formatCurrency(account.valid_txn_cnt_range_before)}</span>
          </div>
          <div className="flex flex-col items-center p-3 border rounded-lg bg-gray-50">
            <span className="text-sm text-gray-500">Tỉ lệ thay đổi</span>
            <span className={`text-lg font-semibold ${account.percentage && account.percentage > 0 ? "text-green-600" : "text-red-600"}`}>
              {account.percentage?.toFixed(2)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountChart;
