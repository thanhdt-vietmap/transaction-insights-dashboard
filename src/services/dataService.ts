
import { toast } from "@/components/ui/use-toast";

export interface Contact {
  name: string | null;
  email: string | null;
  phone: string | null;
}

export interface Metadata {
  contact: Contact;
  time_zone: string;
}

export interface AccountData {
  account_id: string;
  name: string;
  metadata: Metadata;
  valid_txn_cnt: number;
  valid_txn_cnt_range_before: number;
  diff: number;
  percentage?: number; // Added percentage field
}

const API_URL = 'http://192.168.23.239:3000/api/get-daily-req';

// For demo purposes, using sample data to avoid CORS issues when running locally
const SAMPLE_DATA: AccountData[] = [
  {
    "account_id": "d33cd122-cc98-48d4-ab8f-b570c854030e",
    "name": "CÔNG TY CỔ PHẦN XE KHÁCH PHƯƠNG TRANG - FUTA BUS LINES",
    "metadata": {
      "contact": {
        "name": "Anh Huỳnh",
        "email": "huynh.dinh@futa.vn",
        "phone": "0946980368"
      },
      "time_zone": "GMT+7"
    },
    "valid_txn_cnt": 246508835.44,
    "valid_txn_cnt_range_before": 177345487.07999998,
    "diff": 69163348.36000001
  },
  {
    "account_id": "ac6052de-8812-4f99-8c0d-d57cc9bd3c6d",
    "name": "VPBANK - NGÂN HÀNG TMCP VIỆT NAM THỊNH VƯỢNG",
    "metadata": {
      "contact": {
        "name": null,
        "email": "haint46@vpbank.com.vn",
        "phone": null
      },
      "time_zone": "GMT+7"
    },
    "valid_txn_cnt": 8232256.16,
    "valid_txn_cnt_range_before": 3551780.3999999994,
    "diff": 4680475.760000001
  }
];

// Add a few more mock entries to enrich the data for demonstration
const enrichedSampleData: AccountData[] = [
  ...SAMPLE_DATA,
  {
    "account_id": "7a6b8c9d-e0f1-2g3h-4i5j-6k7l8m9n0o1p",
    "name": "TECHCOMBANK - NGÂN HÀNG TMCP KỸ THƯƠNG VIỆT NAM",
    "metadata": {
      "contact": {
        "name": "Nguyễn Văn A",
        "email": "nguyen.van.a@techcombank.com.vn",
        "phone": "0901234567"
      },
      "time_zone": "GMT+7"
    },
    "valid_txn_cnt": 154326789.25,
    "valid_txn_cnt_range_before": 135489321.78,
    "diff": 18837467.47
  },
  {
    "account_id": "2q3r4s5t-6u7v-8w9x-0y1z-2a3b4c5d6e7f",
    "name": "VIETCOMBANK - NGÂN HÀNG TMCP NGOẠI THƯƠNG VIỆT NAM",
    "metadata": {
      "contact": {
        "name": "Trần Thị B",
        "email": "tran.thi.b@vietcombank.com.vn",
        "phone": "0912345678"
      },
      "time_zone": "GMT+7"
    },
    "valid_txn_cnt": 321456789.32,
    "valid_txn_cnt_range_before": 298765432.10,
    "diff": 22691357.22
  },
  {
    "account_id": "8g9h0i1j-2k3l-4m5n-6o7p-8q9r0s1t2u3v",
    "name": "AGRIBANK - NGÂN HÀNG NÔNG NGHIỆP VÀ PHÁT TRIỂN NÔNG THÔN VIỆT NAM",
    "metadata": {
      "contact": {
        "name": "Lê Văn C",
        "email": "le.van.c@agribank.com.vn",
        "phone": "0923456789"
      },
      "time_zone": "GMT+7"
    },
    "valid_txn_cnt": 98765432.10,
    "valid_txn_cnt_range_before": 87654321.09,
    "diff": 11111111.01
  }
];

export const fetchData = async (fromDate: string, toDate: string): Promise<AccountData[]> => {
  try {
    // In a real application, we would fetch from the actual API:
    // const response = await fetch(`${API_URL}?fromDate=${fromDate}&toDate=${toDate}`);
    // const data = await response.json();
    
    // For demo purposes, using sample data and calculating percentages
    const data = enrichedSampleData.map(account => {
      let percentage = 0;
      if (account.valid_txn_cnt_range_before > 0) {
        percentage = (account.diff / account.valid_txn_cnt_range_before) * 100;
      }
      return {
        ...account,
        percentage: parseFloat(percentage.toFixed(2))
      };
    });
    
    return data;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    toast({
      title: "Error fetching data",
      description: "Could not load account data. Please try again later.",
      variant: "destructive",
    });
    return [];
  }
};
