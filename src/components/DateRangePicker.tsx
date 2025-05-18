
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format, startOfMonth } from "date-fns";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  fromDate: string;
  toDate: string;
  onDateChange: (fromDate: string, toDate: string) => void;
}

const DateRangePicker = ({ fromDate, toDate, onDateChange }: DateRangePickerProps) => {
  const [isFromDateOpen, setIsFromDateOpen] = useState(false);
  const [isToDateOpen, setIsToDateOpen] = useState(false);

  const handleFromDateChange = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      onDateChange(formattedDate, toDate);
      setIsFromDateOpen(false);
    }
  };

  const handleToDateChange = (date: Date | undefined) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      onDateChange(fromDate, formattedDate);
      setIsToDateOpen(false);
    }
  };

  // Preset date ranges
  const setLastWeek = () => {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    onDateChange(format(lastWeek, 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd'));
  };

  const setLastMonth = () => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    onDateChange(format(lastMonth, 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd'));
  };

  const setLastThreeMonths = () => {
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    onDateChange(format(threeMonthsAgo, 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd'));
  };
  
  const setFromMonthStart = () => {
    const today = new Date();
    const firstDayOfMonth = startOfMonth(today);
    onDateChange(format(firstDayOfMonth, 'yyyy-MM-dd'), format(today, 'yyyy-MM-dd'));
  };

  return (
    <div className="w-full flex flex-col space-y-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <Popover open={isFromDateOpen} onOpenChange={setIsFromDateOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-[160px] md:w-[180px] justify-start text-sm">
              <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {fromDate ? format(new Date(fromDate), 'dd/MM/yyyy') : "Từ ngày"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fromDate ? new Date(fromDate) : undefined}
              onSelect={handleFromDateChange}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        <span className="hidden sm:block text-sm">-</span>
        
        <Popover open={isToDateOpen} onOpenChange={setIsToDateOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-[160px] md:w-[180px] justify-start text-sm">
              <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {toDate ? format(new Date(toDate), 'dd/MM/yyyy') : "Đến ngày"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={toDate ? new Date(toDate) : undefined}
              onSelect={handleToDateChange}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8" onClick={setLastWeek}>
          7 ngày
        </Button>
        <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8" onClick={setLastMonth}>
          30 ngày
        </Button>
        <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8" onClick={setLastThreeMonths}>
          90 ngày
        </Button>
        <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8" onClick={setFromMonthStart}>
          Từ đầu tháng
        </Button>
      </div>
    </div>
  );
};

export default DateRangePicker;
