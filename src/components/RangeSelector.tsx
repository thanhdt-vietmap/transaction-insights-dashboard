
import React from 'react';
import { Button } from "@/components/ui/button";

interface RangeSelectorProps {
  rangeCount: number;
  onChange: (count: number) => void;
}

const RangeSelector = ({ rangeCount, onChange }: RangeSelectorProps) => {
  const options = [1, 3, 6, 12];
  
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((count) => (
        <Button
          key={count}
          variant={rangeCount === count ? "default" : "outline"}
          onClick={() => onChange(count)}
          className="flex-1"
        >
          {count} {count === 1 ? 'tháng' : 'tháng'}
        </Button>
      ))}
    </div>
  );
};

export default RangeSelector;
