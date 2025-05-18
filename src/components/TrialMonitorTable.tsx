
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
import AccountDetailDialog from './AccountDetailDialog';
import { Check, User, Star, CircleUser } from 'lucide-react';

interface TrialMonitorTableProps {
  data: TrialMonitorData[];
}

const TrialMonitorTable = ({ data }: TrialMonitorTableProps) => {
  const [selectedAccount, setSelectedAccount] = useState<TrialMonitorData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
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
    setDetailOpen(true);
  };

  return (
    <>
      <ScrollArea className="w-full overflow-auto">
        <div className="min-w-[800px] relative">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap sticky left-0 z-20 bg-background">Tên tài khoản</TableHead>
                <TableHead className="whitespace-nowrap">Loại tài khoản</TableHead>
                <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
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
                    className="cursor-pointer hover:bg-muted"
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
      
      <AccountDetailDialog 
        account={selectedAccount} 
        open={detailOpen} 
        onOpenChange={setDetailOpen} 
      />
    </>
  );
};

export default TrialMonitorTable;
