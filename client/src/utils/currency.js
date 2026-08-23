export const CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', rate: 86.50, flag: '🇮🇳' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar (USD)', rate: 1.0, flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (EUR)', rate: 0.92, flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', rate: 0.79, flag: '🇬🇧' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham (AED)', rate: 3.67, flag: '🇦🇪' },
  SAR: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal (SAR)', rate: 3.75, flag: '🇸🇦' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)', rate: 1.38, flag: '🇨🇦' },
};

/**
 * Format base amount (stored in USD or standard unit) to target currency
 */
export const formatCurrency = (amountInUSD = 0, currencyCode = 'INR') => {
  const curr = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const converted = (Number(amountInUSD) || 0) * curr.rate;
  return {
    symbol: curr.symbol,
    code: curr.code,
    flag: curr.flag,
    convertedAmount: converted,
    formatted: `${curr.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`,
  };
};
