import { useMemo, useState } from "react";
import { AccountData, AccountType } from "@/services/dataService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { formatTransactionCount } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface StatisticsSummaryProps {
  data: AccountData[];
}

const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  "NONE": "#CBD5E1",    // Gray
  "TRIAL": "#38BDF8",   // Light blue
  "INTERNAL": "#818CF8", // Purple
  "STANDARD": "#10B981", // Green
  "ENTERPRISE": "#F59E0B", // Orange
  "ALL": "#64748B"      // Slate
};

const CHART_TYPES = ["overview", "byType", "comparison"] as const;
type ChartType = typeof CHART_TYPES[number];

const StatisticsSummary = ({ data }: StatisticsSummaryProps) => {
  const [chartType, setChartType] = useState<ChartType>("overview");
  const [selectedTypes, setSelectedTypes] = useState<AccountType[]>(
    ["TRIAL", "INTERNAL", "STANDARD", "ENTERPRISE"]
  );

  const toggleAccountType = (type: AccountType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  // Calculate totals for current and previous periods
  const totals = useMemo(() => {
    const filtered = data.filter(account => selectedTypes.includes(account.account_type));
    return {
      current: filtered.reduce((sum, account) => sum + Math.round(account.valid_txn_cnt), 0),
      previous: filtered.reduce((sum, account) => sum + Math.round(account.valid_txn_cnt_range_before), 0),
      diff: filtered.reduce((sum, account) => sum + Math.round(account.diff), 0),
      percentage: filtered.reduce((sum, account) => sum + Math.round(account.valid_txn_cnt), 0) / 
                 filtered.reduce((sum, account) => sum + Math.round(account.valid_txn_cnt_range_before), 0) * 100 - 100
    };
  }, [data, selectedTypes]);

  // Prepare data for the pie chart (by type)
  const pieChartData = useMemo(() => {
    const result: Array<{name: string, value: number, type: AccountType}> = [];
    
    // Group by account_type
    const types: AccountType[] = ["TRIAL", "INTERNAL", "STANDARD", "ENTERPRISE", "NONE"];
    
    types.forEach(type => {
      const accounts = data.filter(a => a.account_type === type);
      if (accounts.length > 0) {
        const sum = accounts.reduce((total, account) => total + Math.round(account.valid_txn_cnt), 0);
        result.push({
          name: type,
          value: sum,
          type: type
        });
      }
    });
    
    return result;
  }, [data]);

  // Prepare data for comparison chart
  const comparisonData = useMemo(() => {
    const result: Array<{name: string, current: number, previous: number, type: AccountType}> = [];
    
    // Group by account_type
    const types: AccountType[] = ["TRIAL", "INTERNAL", "STANDARD", "ENTERPRISE", "NONE"];
    
    types.filter(type => selectedTypes.includes(type)).forEach(type => {
      const accounts = data.filter(a => a.account_type === type);
      if (accounts.length > 0) {
        result.push({
          name: type,
          current: accounts.reduce((total, account) => total + Math.round(account.valid_txn_cnt), 0),
          previous: accounts.reduce((total, account) => total + Math.round(account.valid_txn_cnt_range_before), 0),
          type: type
        });
      }
    });
    
    return result;
  }, [data, selectedTypes]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Thống kê tổng hợp</CardTitle>
          <CardDescription>Tổng số giao dịch theo khoảng thời gian</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Tổng hiện tại</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatTransactionCount(totals.current)}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Tổng trước đó</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatTransactionCount(totals.previous)}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Chênh lệch</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn(
                  "text-2xl font-bold", 
                  totals.diff > 0 ? "text-green-600" : totals.diff < 0 ? "text-red-600" : ""
                )}>
                  {formatTransactionCount(totals.diff)}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Tỉ lệ thay đổi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn(
                  "text-2xl font-bold", 
                  totals.percentage > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {Math.round(totals.percentage)}%
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between mb-4">
              <RadioGroup 
                className="flex flex-row space-x-4" 
                value={chartType} 
                onValueChange={(value) => setChartType(value as ChartType)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="overview" id="chart-overview" />
                  <Label htmlFor="chart-overview">Tổng quan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="byType" id="chart-by-type" />
                  <Label htmlFor="chart-by-type">Theo loại</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comparison" id="chart-comparison" />
                  <Label htmlFor="chart-comparison">So sánh</Label>
                </div>
              </RadioGroup>
              
              <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                {(["TRIAL", "INTERNAL", "STANDARD", "ENTERPRISE"] as AccountType[]).map((type) => (
                  <div 
                    key={type} 
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors",
                      selectedTypes.includes(type) 
                        ? "bg-primary text-white" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                    onClick={() => toggleAccountType(type)}
                  >
                    {type}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="h-[300px] sm:h-[400px]">
              {chartType === "overview" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Hiện tại', value: totals.current },
                      { name: 'Trước đó', value: totals.previous }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatTransactionCount(value)} />
                    <Tooltip formatter={(value) => formatTransactionCount(value as number)} />
                    <Bar dataKey="value" fill="#3b82f6" name="Số giao dịch" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              
              {chartType === "byType" && (
                <div className="flex flex-col sm:flex-row items-center justify-center h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius="70%"
                        dataKey="value"
                        nameKey="name"
                        label={(entry) => `${entry.name}: ${formatTransactionCount(entry.value)}`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={ACCOUNT_TYPE_COLORS[entry.type]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatTransactionCount(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {chartType === "comparison" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatTransactionCount(value)} />
                    <Tooltip formatter={(value) => formatTransactionCount(value as number)} />
                    <Legend />
                    <Bar dataKey="current" name="Hiện tại" fill="#3b82f6" />
                    <Bar dataKey="previous" name="Trước đó" fill="#94a3b8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsSummary;
