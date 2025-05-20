import { toast } from "@/components/ui/use-toast";
import { AccountType } from "./dataService";
import { format, subDays } from "date-fns";

export interface MonthlyData {
  month: string;
  valid_txn_cnt: number;
  date: string; // Added date field
}

export interface AccountMetadata {
  contact: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  time_zone: string;
}

// New response type to match the updated API format
export interface RawTrialAccount {
  [key: string]: number | string | AccountMetadata | AccountType;
  account_id: string;
  name: string;
  metadata: AccountMetadata;
  account_type: AccountType;
}

export interface TrialMonitorData {
  account_id: string;
  name: string;
  account_type: AccountType;
  monthly_data: MonthlyData[];
  metadata?: AccountMetadata;
}

const API_URL = "http://192.168.23.239:3000/api/get-trial-req";

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
        contact: {
          name: "Nguyễn Văn A",
          email: "nguyenvana@futalines.vn",
          phone: "0901234567"
        },
        time_zone: "GMT+7"
      }
    },
    {
      account_id: "ac6052de-8812-4f99-8c0d-d57cc9bd3c6d",
      name: "VPBANK - NGÂN HÀNG TMCP VIỆT NAM THỊNH VƯỢNG",
      account_type: "ENTERPRISE" as AccountType,
      metadata: {
        contact: {
          name: "Lê Thị B",
          email: "lethi.b@vpbank.com.vn",
          phone: "0912345678"
        },
        time_zone: "GMT+7"
      }
    },
    {
      account_id: "7a6b8c9d-e0f1-2g3h-4i5j-6k7l8m9n0o1p",
      name: "TECHCOMBANK - NGÂN HÀNG TMCP KỸ THƯƠNG VIỆT NAM",
      account_type: "STANDARD" as AccountType,
      metadata: {
        contact: {
          name: "Trần Văn C",
          email: "tranvanc@techcombank.com.vn",
          phone: "0923456789"
        },
        time_zone: "GMT+7"
      }
    },
    {
      account_id: "2q3r4s5t-6u7v-8w9x-0y1z-2a3b4c5d6e7f",
      name: "VIETCOMBANK - NGÂN HÀNG TMCP NGOẠI THƯƠNG VIỆT NAM",
      account_type: "ENTERPRISE" as AccountType,
      metadata: {
        contact: {
          name: "Phạm Thị D",
          email: "phamthid@vietcombank.com.vn",
          phone: "0934567890"
        },
        time_zone: "GMT+7"
      }
    },
    {
      account_id: "8g9h0i1j-2k3l-4m5n-6o7p-8q9r0s1t2u3v",
      name: "AGRIBANK - NGÂN HÀNG NÔNG NGHIỆP VÀ PHÁT TRIỂN NÔNG THÔN VIỆT NAM",
      account_type: "INTERNAL" as AccountType,
      metadata: {
        contact: {
          name: "Hoàng Văn E",
          email: "hoangvane@agribank.com.vn",
          phone: "0945678901"
        },
        time_zone: "GMT+7"
      }
    },
    {
      account_id: "3w4x5y6z-7a8b-9c0d-1e2f-3g4h5i6j7k8l",
      name: "BIDV - NGÂN HÀNG ĐẦU TƯ VÀ PHÁT TRIỂN VIỆT NAM",
      account_type: "TRIAL" as AccountType,
      metadata: {
        contact: {
          name: "Võ Thị F",
          email: "vothif@bidv.com.vn",
          phone: "0956789012"
        },
        time_zone: "GMT+7"
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

// Calculate dates for each range based on toDate and range size
const calculateRangeDates = (fromDate: string, toDate: string, rangeCount: number): string[] => {
  // Parse the end date (toDate)
  const endDate = new Date(toDate.split('-').reverse().join('-'));
  
  // Calculate the total days between fromDate and toDate
  const startDate = new Date(fromDate.split('-').reverse().join('-'));
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate the size of each range in days
  const rangeSize = Math.ceil(totalDays / rangeCount);
  
  // Generate the date for each range
  const rangeDates: string[] = [];
  for (let i = 0; i < rangeCount; i++) {
    const daysToSubtract = i * rangeSize;
    const rangeDate = subDays(endDate, daysToSubtract);
    rangeDates.push(format(rangeDate, 'dd/MM/yyyy'));
  }
  
  return rangeDates;
};

// Transform API response to our format with the new structure
const transformApiResponse = (apiResponse: RawTrialAccount[], rangeCount: number, fromDate: string, toDate: string): TrialMonitorData[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  // Get the labels for each range (last N months)
  const rangeLabels = Array.from({ length: rangeCount }, (_, i) => {
    const monthIndex = (currentMonth - i + 12) % 12;
    return months[monthIndex];
  }).reverse();
  
  // Calculate dates for each range
  const rangeDates = calculateRangeDates(fromDate, toDate, rangeCount);
  
  // Convert the array of accounts to our TrialMonitorData format
  return apiResponse.map(account => {
    // Extract the numeric range keys (0, 1, 2, etc.)
    const rangeData = Array.from({ length: rangeCount }, (_, i) => {
      const rangeKey = i.toString();
      const txnCount = typeof account[rangeKey] === 'number' ? account[rangeKey] as number : 0;
      
      return {
        month: `Range ${i + 1}`,
        date: rangeDates[i] || format(new Date(), 'dd/MM/yyyy'),
        valid_txn_cnt: txnCount
      };
    });
    
    return {
      account_id: account.account_id as string,
      name: account.name as string,
      account_type: account.account_type as AccountType,
      metadata: account.metadata as AccountMetadata,
      monthly_data: rangeData
    };
  });
};

// Filter accounts that have no requests across all ranges
const filterAccountsWithNoRequests = (accounts: TrialMonitorData[]): TrialMonitorData[] => {
  return accounts.filter(account => {
    const totalRequests = account.monthly_data.reduce((sum, month) => sum + month.valid_txn_cnt, 0);
    return totalRequests > 0;
  });
};

export const fetchTrialMonitorData = async (
  fromDate: string,
  toDate: string,
  rangeCount: number
): Promise<TrialMonitorData[]> => {
  try {
    // Format dates for the API if needed (API expects MM-DD-YYYY)
    const formattedFromDate = formatDateForAPI(fromDate);
    const formattedToDate = formatDateForAPI(toDate);
    
    // Fetch from the actual API with the new date parameters
    const response = await fetch(
      `${API_URL}?account_type=TRIAL&numberOfRangeRequests=${rangeCount}&fromDate=${formattedFromDate}&toDate=${formattedToDate}`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data: RawTrialAccount[] = await response.json();
    console.log(`Fetched trial monitor data with ${rangeCount} ranges:`, data);
    
    // Transform the data to our format
    const transformedData = transformApiResponse(data, rangeCount, fromDate, toDate);
    
    // Filter accounts with no requests
    const filteredData = filterAccountsWithNoRequests(transformedData);
    
    console.log(`Filtered data (${filteredData.length} accounts with requests):`, filteredData);
    
    return filteredData;
  } catch (error) {
    console.error("Failed to fetch trial monitor data:", error);
    toast({
      title: "Lỗi tải dữ liệu",
      description: "Không thể tải dữ liệu tài khoản. Sử dụng dữ liệu mẫu.",
      variant: "destructive",
    });
    
    // Return sample data for development/preview
    const sampleData = generateSampleData(rangeCount);
    
    // Filter the sample data too for consistency
    return filterAccountsWithNoRequests(sampleData);
  }
};

// Helper function to format date from YYYY-MM-DD to MM-DD-YYYY for the API
const formatDateForAPI = (dateString: string): string => {
  try {
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
      return `${month}-${day}-${year}`;
    }
    return dateString;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};
