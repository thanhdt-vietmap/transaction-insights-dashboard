
import React from 'react';
import { Button } from "@/components/ui/button";

interface RangeSelectorProps {
  rangeCount: number;
  onChange: (count: number) => void;
}

const RangeSelector = ({ rangeCount, onChange }: RangeSelectorProps) => {
  const options = [1, 2, 3, 4, 5, 6, 9, 12, 24];
  
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((count) => (
        <Button
          key={count}
          variant={rangeCount === count ? "default" : "outline"}
          onClick={() => onChange(count)}
          className="flex-1"
        >
          {count} {count === 1 ? 'khoảng' : 'khoảng'}
        </Button>
      ))}
    </div>
  );
};

export default RangeSelector;
