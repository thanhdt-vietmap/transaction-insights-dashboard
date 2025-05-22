import { toast } from "@/components/ui/use-toast";
import { AccountType } from "./dataService";

export interface MonthlyData {
  month: string;
  valid_txn_cnt: number;
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
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentMonth = new Date().getMonth();

  // Get the last N months
  const selectedMonths = Array.from({ length: rangeCount }, (_, i) => {
    const monthIndex = (currentMonth - i + 12) % 12;
    return months[monthIndex];
  }).reverse();

  const accounts = {
    "data": [
        {
            "0": 0,
            "1": 0,
            "2": 0,
            "account_id": "fb4cecc4-0c39-4d89-bc08-03f326047dd5",
            "name": "NICE info Vietnam ",
            "metadata": {
                "contact": {
                    "name": "Nguyễn Văn Nam",
                    "email": "namvnguyen@nicegroup.com.vn",
                    "phone": "0982586777"
                },
                "time_zone": "GMT+7"
            },
            "account_type": "TRIAL"
        },
        {
            "0": 0,
            "1": 0,
            "2": 0,
            "account_id": "31d3c8b7-7e3b-479b-8089-05d9ec8d78fe",
            "name": "Anh Việt Anh",
            "metadata": {
                "contact": {
                    "name": "Anh Việt Anh",
                    "email": "vietanhnguyentran@gmail.com",
                    "phone": "0918108636"
                },
                "time_zone": "GMT+7"
            },
            "account_type": "TRIAL"
        },
        {
            "0": 0,
            "1": 0,
            "2": 0,
            "account_id": "a648888d-5744-4ebc-b40c-079e6bbd76a7",
            "name": "tintrithuc@gmail.com",
            "metadata": {
                "contact": {
                    "name": null,
                    "email": "tintrithuc@gmail.com",
                    "phone": null
                },
                "time_zone": "GMT+7"
            },
            "account_type": "TRIAL"
        },
         ],
    "rangeDates": [
        {
            "fromDate": "2025-04-14",
            "toDate": "2025-04-19"
        },
        {
            "fromDate": "2025-04-09",
            "toDate": "2025-04-14"
        },
        {
            "fromDate": "2025-04-04",
            "toDate": "2025-04-09"
        }
    ]
}
  // Generate sample data
  return accounts.data.map((account) => {
    const rangeData = Array.from({ length: rangeCount }, (_, i) => {
      const txnCount = account[i.toString()] as number;
      return {
        month: selectedMonths[i] || `Range ${i + 1}`,
        valid_txn_cnt: txnCount,
      };
    });

    return {
      account_id: account.account_id as string,
      name: account.name as string,
      account_type: account.account_type as AccountType,
      metadata: account.metadata as AccountMetadata,
      monthly_data: rangeData,
    };
  });
 


};
const getRangeString = (range:  { fromDate: Date; toDate: Date })=>{
  // Format the date range as "MM-DD-YYYY -\n MM-DD-YYYY"
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const fromDateString = range.fromDate.toLocaleDateString("vi-VN", options);
  const toDateString = range.toDate.toLocaleDateString("vi-VN", options);
  return `${fromDateString} - ${toDateString}`;
  // return `${range.fromDate.getMonth() + 1}-${range.fromDate.getDate()}-${range.fromDate.getFullYear()} - ${range.toDate.getMonth() + 1}-${range.toDate.getDate()}-${range.toDate.getFullYear()}`;
}

// Transform API response to our format with the new structure
const transformApiResponse = (
  apiResponse: RawTrialAccount[],
  rangeCount: number,
  dailyRanges: { fromDate: Date; toDate: Date }[]
): TrialMonitorData[] => {
  // Get the labels for each range (last N months)
  const rangeLabels = Array.from({ length: rangeCount }, (_, i) => {
    return getRangeString(dailyRanges[i]);
    // return months[monthIndex];
  }).reverse();

  // Convert the array of accounts to our TrialMonitorData format
  return apiResponse.map((account) => {
    // Extract the numeric range keys (0, 1, 2, etc.)

    const rangeData = Array.from({ length: rangeCount }, (_, i) => {
      const rangeKey = i.toString();
      const txnCount =
        typeof account[rangeKey] === "number"
          ? (account[rangeKey] as number)
          : 0;

      return {
        month: rangeLabels[i] || `Range ${i + 1}`,
        valid_txn_cnt: txnCount,
      };
    });

    return {
      account_id: account.account_id as string,
      name: account.name as string,
      account_type: account.account_type as AccountType,
      metadata: account.metadata as AccountMetadata,
      monthly_data: rangeData,
    };
  });
};

// Filter accounts that have no requests across all ranges
const filterAccountsWithNoRequests = (
  accounts: TrialMonitorData[]
): TrialMonitorData[] => {
  return accounts.filter((account) => {
    const totalRequests = account.monthly_data.reduce(
      (sum, month) => sum + month.valid_txn_cnt,
      0
    );
    return totalRequests > 0;
  });
};

export const fetchTrialMonitorData = async (
  fromDate: string,
  toDate: string,
  rangeCount: number
): Promise<{[key: string]:any}> => {
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

    const res = await response.json();
    const data: RawTrialAccount[] = res.data;
    /**
[
  { fromDate: '2025-04-14', toDate: '2025-04-19' },
  { fromDate: '2025-04-09', toDate: '2025-04-14' },
  { fromDate: '2025-04-04', toDate: '2025-04-09' }
] */
    const dateRanges = await res.rangeDates.map((item: any) => {
      const fromDate = new Date(item.fromDate);
      const toDate = new Date(item.toDate);

      return {
        fromDate: fromDate,
        toDate: toDate,
      };
    });
    // sort dateRanges by fromDate
    dateRanges.sort((a: any, b: any) => {
      const dateA = new Date(a.fromDate);
      const dateB = new Date(b.fromDate);
      return dateA.getTime() - dateB.getTime();
    });
    // Transform the data to our format
    const transformedData = transformApiResponse(data, rangeCount, dateRanges);

    // Filter accounts with no requests
    const filteredData = filterAccountsWithNoRequests(transformedData);
    
    return {filteredData: filteredData, ranges: dateRanges};
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
    const [year, month, day] = dateString.split("-");
    if (year && month && day) {
      return `${month}-${day}-${year}`;
    }
    return dateString;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};
