
import { toast } from "@/components/ui/use-toast";
import { AccountType } from "./dataService";

export interface MonthlyData {
  month: string;
  valid_txn_cnt: number;
}

export interface AccountMetadata {
  contact_name?: string;
  email?: string;
  phone?: string;
}

export interface TrialMonitorData {
  account_id: string;
  name: string;
  account_type: AccountType;
  monthly_data: MonthlyData[];
  metadata?: AccountMetadata;
}

const API_URL = "http://192.168.22.151:3000/api/trial-monitor";

// Sample data for development/preview
const generateSampleData = (rangeCount: number): TrialMonitorData[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  // Get the last N months
  const selectedMonths = Array.from({ length: rangeCount }, (_, i) => {
    const monthIndex = (currentMonth - i + 12) % 12;
    return months[monthIndex];
  }).reverse();
  
  const accounts = [
    {
      account_id: "d33cd122-cc98-48d4-ab8f-b570c854030e",
      name: "CÔNG TY CỔ PHẦN XE KHÁCH PHƯƠNG TRANG - FUTA BUS LINES",
      account_type: "TRIAL" as AccountType,
      metadata: {
        contact_name: "Nguyễn Văn A",
        email: "nguyenvana@futalines.vn",
        phone: "0901234567"
      }
    },
    {
      account_id: "ac6052de-8812-4f99-8c0d-d57cc9bd3c6d",
      name: "VPBANK - NGÂN HÀNG TMCP VIỆT NAM THỊNH VƯỢNG",
      account_type: "ENTERPRISE" as AccountType,
      metadata: {
        contact_name: "Lê Thị B",
        email: "lethi.b@vpbank.com.vn",
        phone: "0912345678"
      }
    },
    {
      account_id: "7a6b8c9d-e0f1-2g3h-4i5j-6k7l8m9n0o1p",
      name: "TECHCOMBANK - NGÂN HÀNG TMCP KỸ THƯƠNG VIỆT NAM",
      account_type: "STANDARD" as AccountType,
      metadata: {
        contact_name: "Trần Văn C",
        email: "tranvanc@techcombank.com.vn",
        phone: "0923456789"
      }
    },
    {
      account_id: "2q3r4s5t-6u7v-8w9x-0y1z-2a3b4c5d6e7f",
      name: "VIETCOMBANK - NGÂN HÀNG TMCP NGOẠI THƯƠNG VIỆT NAM",
      account_type: "ENTERPRISE" as AccountType,
      metadata: {
        contact_name: "Phạm Thị D",
        email: "phamthid@vietcombank.com.vn",
        phone: "0934567890"
      }
    },
    {
      account_id: "8g9h0i1j-2k3l-4m5n-6o7p-8q9r0s1t2u3v",
      name: "AGRIBANK - NGÂN HÀNG NÔNG NGHIỆP VÀ PHÁT TRIỂN NÔNG THÔN VIỆT NAM",
      account_type: "INTERNAL" as AccountType,
      metadata: {
        contact_name: "Hoàng Văn E",
        email: "hoangvane@agribank.com.vn",
        phone: "0945678901"
      }
    },
    {
      account_id: "3w4x5y6z-7a8b-9c0d-1e2f-3g4h5i6j7k8l",
      name: "BIDV - NGÂN HÀNG ĐẦU TƯ VÀ PHÁT TRIỂN VIỆT NAM",
      account_type: "TRIAL" as AccountType,
      metadata: {
        contact_name: "Võ Thị F",
        email: "vothif@bidv.com.vn",
        phone: "0956789012"
      }
    },
  ];
  
  return accounts.map(account => {
    // Generate monthly data for each account
    const monthlyData = selectedMonths.map(month => {
      let value = 0;
      
      // For TRIAL accounts, randomly have some months with zero transactions
      if (account.account_type === "TRIAL") {
        // 50% chance to have non-zero value
        if (Math.random() > 0.5) {
          value = Math.floor(Math.random() * 15000);
        }
      } else {
        // For non-TRIAL accounts, generate more consistent transaction volumes
        const baseValue = account.account_type === "ENTERPRISE" ? 20000 : 5000;
        value = baseValue + Math.floor(Math.random() * baseValue * 2);
      }
      
      return {
        month,
        valid_txn_cnt: value
      };
    });
    
    return {
      ...account,
      monthly_data: monthlyData
    };
  });
};

export const fetchTrialMonitorData = async (
  fromDate: string,
  toDate: string,
  rangeCount: number
): Promise<TrialMonitorData[]> => {
  try {
    // In a real application, we would fetch from the actual API
    const response = await fetch(
      `${API_URL}?fromDate=${fromDate}&toDate=${toDate}&rangeCount=${rangeCount}`
    );
    
    let data = await response.json();
    console.log(`Fetching trial monitor data from ${fromDate} to ${toDate} with ${rangeCount} ranges`);
    
    return data;
  } catch (error) {
    console.error("Failed to fetch trial monitor data:", error);
    toast({
      title: "Lỗi tải dữ liệu",
      description: "Không thể tải dữ liệu tài khoản. Sử dụng dữ liệu mẫu.",
      variant: "destructive",
    });
    
    // Return sample data for development/preview
    return generateSampleData(rangeCount);
  }
};
