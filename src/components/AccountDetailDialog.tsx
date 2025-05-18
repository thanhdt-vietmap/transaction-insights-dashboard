
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrialMonitorData } from "@/services/trialMonitorService";
import { formatNumber } from "@/utils/formatters";

interface AccountDetailDialogProps {
  account: TrialMonitorData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  role: string;
}

// Sample contact info for demo purposes
const getSampleContactInfo = (accountId: string): ContactInfo => {
  const contacts: Record<string, ContactInfo> = {
    "d33cd122-cc98-48d4-ab8f-b570c854030e": {
      name: "Nguyễn Văn A",
      email: "nguyenvana@futalines.vn",
      phone: "0901234567",
      role: "Technical Manager"
    },
    "ac6052de-8812-4f99-8c0d-d57cc9bd3c6d": {
      name: "Trần Thị B",
      email: "tranthib@vpbank.com.vn",
      phone: "0912345678",
      role: "Product Owner"
    }
  };
  
  return contacts[accountId] || {
    name: "Liên hệ hỗ trợ",
    email: "support@vietmap.vn",
    phone: "1900 1234",
    role: "Customer Support"
  };
};

const AccountDetailDialog = ({ account, open, onOpenChange }: AccountDetailDialogProps) => {
  if (!account) return null;
  
  const contactInfo = getSampleContactInfo(account.account_id);
  
  // Format data for the chart
  const chartData = account.monthly_data.map(month => ({
    month: month.month,
    transactions: month.valid_txn_cnt,
  }));
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {account.name}
            <Badge className="ml-2" variant={account.account_type === "TRIAL" ? "destructive" : "default"}>
              {account.account_type}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 mt-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Thông tin liên hệ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Người liên hệ</p>
                <p className="font-medium">{contactInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chức vụ</p>
                <p className="font-medium">{contactInfo.role}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{contactInfo.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Số điện thoại</p>
                <p className="font-medium">{contactInfo.phone}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Biểu đồ giao dịch</h3>
            <div className="w-full h-64">
              <ChartContainer 
                config={{
                  transactions: {
                    label: "Giao dịch",
                    theme: {
                      light: "#3b82f6",
                      dark: "#60a5fa"
                    }
                  }
                }}
              >
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Bar 
                    dataKey="transactions" 
                    fill="var(--color-transactions)" 
                    name="Giao dịch"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
            
            <div className="mt-4">
              <h4 className="text-md font-medium mb-2">Chi tiết theo khoảng thời gian</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {account.monthly_data.map((month, index) => (
                  <Card key={index} className="p-3 flex justify-between items-center">
                    <span>{month.month}</span>
                    <Badge variant={
                      month.valid_txn_cnt > 10000 ? "destructive" : 
                      month.valid_txn_cnt > 5000 ? "secondary" : 
                      month.valid_txn_cnt > 1000 ? "default" : "outline"
                    }>
                      {formatNumber(month.valid_txn_cnt)}
                    </Badge>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDetailDialog;
