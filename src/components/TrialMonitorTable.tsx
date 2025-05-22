
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
import { Check, User, Star, CircleUser, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
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
  searchTerm: string;
  ranges: { string: Date }[];
  selectedStatuses: AccountStatus[];
  selectedAccountTypes: string[];
}

type SortField = 'name' | 'account_type' | 'total_txn' | 'status';
type SortDirection = 'asc' | 'desc';

const TrialMonitorTable = ({
  data,
  ranges,
  searchTerm,
  selectedStatuses,
  selectedAccountTypes
}: TrialMonitorTableProps) => {
  const [selectedAccount, setSelectedAccount] = useState<TrialMonitorData | null>(null);
  const [sortField, setSortField] = useState<SortField>('total_txn');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Function to determine background color based on request count
  const getBgColor = (count: number) => {
    if (count > 10000) return 'bg-red-100';
    if (count > 5000) return 'bg-yellow-100';
    if (count > 1000) return 'bg-green-100';
    return '';
  };

  // Function to get bar color based on request count
  const getBarColor = (count: number) => {
    if (count > 10000) return '#f87171'; // red-400
    if (count > 5000) return '#facc15'; // yellow-400
    if (count > 1000) return '#4ade80'; // green-400
    return '#8884d8'; // default purple
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
    return selectedAccount.monthly_data.map(month => {
      const txnCount = month.valid_txn_cnt;
      return {
        name: month.month,
        Transactions: txnCount,
        color: getBarColor(txnCount)
      };
    });
  };

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter and sort data
  const filteredData = data.filter(account => {
    const accountStatus = getAccountStatus(account);
    const matchesSearch = searchTerm === '' ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatuses.length === 0 ||
      selectedStatuses.includes(accountStatus);
    const matchesAccountType = selectedAccountTypes.length === 0 ||
      selectedAccountTypes.includes(account.account_type);

    return matchesSearch && matchesStatus && matchesAccountType;
  });

  // Sort the filtered data
  const sortedData = [...filteredData].sort((a, b) => {
    let valueA: string | number;
    let valueB: string | number;

    switch (sortField) {
      case 'name':
        valueA = a.name;
        valueB = b.name;
        break;
      case 'account_type':
        valueA = a.account_type;
        valueB = b.account_type;
        break;
      case 'status':
        valueA = getAccountStatus(a);
        valueB = getAccountStatus(b);
        break;
      case 'total_txn':
      default:
        valueA = a.monthly_data.reduce((sum, month) => sum + month.valid_txn_cnt, 0);
        valueB = b.monthly_data.reduce((sum, month) => sum + month.valid_txn_cnt, 0);
    }

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    return sortDirection === 'asc'
      ? (valueA as number) - (valueB as number)
      : (valueB as number) - (valueA as number);
  });

  // Render sort indicator
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc'
      ? <ArrowUp className="ml-1 h-3 w-3 inline" />
      : <ArrowDown className="ml-1 h-3 w-3 inline" />;
  };

  return (
    <>
      <ScrollArea className="w-full overflow-auto">
        <div className="min-w-[800px] relative">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="whitespace-nowrap sticky left-0 z-20 bg-background cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Account Name {renderSortIcon('name')}
                </TableHead>
                <TableHead
                  className="whitespace-nowrap cursor-pointer"
                  onClick={() => handleSort('account_type')}
                >
                  Account Type {renderSortIcon('account_type')}
                </TableHead>
                {/* <TableHead
                  className="whitespace-nowrap cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  Status {renderSortIcon('status')}
                </TableHead> */}
                {sortedData.length > 0 && sortedData[0].monthly_data.map((month, index) => (
                  <TableHead
                    key={index}
                    className="whitespace-nowrap text-right cursor-pointer"
                    onClick={() => handleSort(index)}
                  >
                    {month.month.split("-")[0]}
                    <div className="text-xs text-muted-foreground">- {month.month.split("-")[1]}</div>
                    {/* {renderSortIcon(index)} */}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length > 0 ? (
                sortedData.map((account) => {
                  const status = getAccountStatus(account);

                  return (
                    <TableRow
                      key={account.account_id}
                      className={`cursor-pointer hover:bg-muted ${selectedAccount?.account_id === account.account_id ? 'bg-muted' : ''}`}
                      onClick={() => handleRowClick(account)}
                    >
                      <TableCell className="font-medium sticky left-0 bg-background z-10">{account.name}</TableCell>
                      <TableCell>{account.account_type}</TableCell>
                      {/* <TableCell>{renderStatusBadge(status)}</TableCell> */}

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
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={3 + (data[0]?.monthly_data.length || 0)} className="h-24 text-center">
                    Không có dữ liệu phù hợp với bộ lọc.
                  </TableCell>
                </TableRow>
              )}
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
                      <Bar
                        dataKey="Transactions"
                        fill="#8884d8"
                        isAnimationActive={true}
                      >
                        {getChartData().map((entry, index) => (
                          <rect key={`rect-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
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

                  {/* Display account metadata if available */}
                  {selectedAccount.metadata && (
                    <>
                      {selectedAccount.metadata.contact && selectedAccount.metadata.contact.name && (
                        <div>
                          <h3 className="font-medium">Contact Name</h3>
                          <p className="text-sm text-muted-foreground">{selectedAccount.metadata.contact.name}</p>
                        </div>
                      )}
                      {selectedAccount.metadata.contact && selectedAccount.metadata.contact.email && (
                        <div>
                          <h3 className="font-medium">Email</h3>
                          <p className="text-sm text-muted-foreground">{selectedAccount.metadata.contact.email}</p>
                        </div>
                      )}
                      {selectedAccount.metadata.contact && selectedAccount.metadata.contact.phone && (
                        <div>
                          <h3 className="font-medium">Phone</h3>
                          <p className="text-sm text-muted-foreground">{selectedAccount.metadata.contact.phone}</p>
                        </div>
                      )}
                    </>
                  )}
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