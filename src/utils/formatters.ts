
export const formatNumber = (value: number): string => {
  return Math.round(value).toLocaleString('vi-VN');
};

export const formatPercentage = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const formatTransactionCount = (value: number): string => {
  return Math.round(value).toLocaleString('vi-VN');
};

