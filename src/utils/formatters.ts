
export const formatNumber = (value: number): string => {
  return Math.round(value).toLocaleString('vi-VN');
};

export const formatPercentage = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const formatTransactionCount = (value: number): string => {
  return Math.round(value).toLocaleString('vi-VN');
};

// New function to normalize text for searching
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^\w\s]/g, ""); // Remove special characters
};
