
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrialMonitorData, MonthlyData } from "@/services/trialMonitorService";
import { formatNumber } from "@/utils/formatters";
import { AccountStatus } from "@/pages/TrialMonitor";
import { Check, User, Star, CircleUser } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TrialMonitorTableProps {
  data: TrialMonitorData[];
}

const TrialMonitorTable = ({ data }: TrialMonitorTableProps) => {
  const [selectedAccount, setSelectedAccount] = useState<TrialMonitorData | null>(null);
  
  // Function to determine background color based on request count
  const getBgColor = (count: number) => {
    if (count > 10000) return 'bg-red-100';
    if (count > 5000) return 'bg-yellow-100';
    if (count > 1000) return 'bg-green-100';
    return '';
  };
  
  // Function to calculate account status
  const getAccountStatus = (account: TrialMonitorData): AccountStatus => {
    // For trial accounts with values in more than 3 ranges
    if (account.account_type === 'TRIAL') {
      const rangesWithValue = account.monthly_data.filter(month => month.valid_txn_cnt > 0).length;
      if (rangesWithValue >= 3) {
        return AccountStatus.NEEDS_REVIEW;
      }
    }
    
    // For other account types, assign based on transaction volume
    const totalVolume = account.monthly_data.reduce((sum, month) => sum + month.valid_txn_cnt, 0);
    
    if (totalVolume > 200000000) return AccountStatus.PARTNER;
    if (totalVolume > 50000000) return AccountStatus.POTENTIAL;
    return AccountStatus.NORMAL;
  };
  
  // Function to render status badge
  const renderStatusBadge = (status: AccountStatus) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    let Icon = CircleUser;
    
    switch (status) {
      case AccountStatus.PARTNER:
        variant = "default";
        Icon = User;
        break;
      case AccountStatus.POTENTIAL:
        variant = "secondary";
        Icon = Star;
        break;
      case AccountStatus.NEEDS_REVIEW:
        variant = "destructive";
        Icon = Check;
        break;
      default:
        variant = "outline";
        Icon = CircleUser;
    }
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const handleRowClick = (account: TrialMonitorData) => {
    setSelectedAccount(account);
  };

  // Prepare chart data for the selected account
  const getChartData = () => {
    if (!selectedAccount) return [];
    
    return selectedAccount.monthly_data.map(month => ({
      name: month.month,
      Transactions: month.valid_txn_cnt
    }));
  };

  return (
    <>
      <ScrollArea className="w-full overflow-auto">
        <div className="min-w-[800px] relative">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap sticky left-0 z-20 bg-background">Account Name</TableHead>
                <TableHead className="whitespace-nowrap">Account Type</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                {data[0]?.monthly_data.map((month, index) => (
                  <TableHead key={index} className="whitespace-nowrap text-right">
                    {month.month}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((account) => {
                const status = getAccountStatus(account);
                
                return (
                  <TableRow 
                    key={account.account_id}
                    className={`cursor-pointer hover:bg-muted ${selectedAccount?.account_id === account.account_id ? 'bg-muted' : ''}`}
                    onClick={() => handleRowClick(account)}
                  >
                    <TableCell className="font-medium sticky left-0 bg-background z-10">{account.name}</TableCell>
                    <TableCell>{account.account_type}</TableCell>
                    <TableCell>{renderStatusBadge(status)}</TableCell>
                    
                    {account.monthly_data.map((month, index) => (
                      <TableCell 
                        key={index} 
                        className={`text-right ${getBgColor(month.valid_txn_cnt)}`}
                      >
                        {formatNumber(month.valid_txn_cnt)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
      
      {selectedAccount && (
        <Card className="mt-6 animate-in fade-in duration-300">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div>Account Details: {selectedAccount.name}</div>
              <Button variant="outline" size="sm" onClick={() => setSelectedAccount(null)}>Close</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chart">
              <TabsList className="mb-4">
                <TabsTrigger value="chart">Transaction Chart</TabsTrigger>
                <TabsTrigger value="info">Account Info</TabsTrigger>
              </TabsList>
              <TabsContent value="chart" className="pt-2">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Transactions" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="info" className="pt-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Account ID</h3>
                    <p className="text-sm text-muted-foreground">{selectedAccount.account_id}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Account Type</h3>
                    <p className="text-sm text-muted-foreground">{selectedAccount.account_type}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Status</h3>
                    <div className="mt-1">{renderStatusBadge(getAccountStatus(selectedAccount))}</div>
                  </div>
                  <div>
                    <h3 className="font-medium">Total Transactions</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(selectedAccount.monthly_data.reduce((sum, month) => sum + month.valid_txn_cnt, 0))}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default TrialMonitorTable;
