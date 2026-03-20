import { storage } from './storage';

export const formatCurrency = (amount: number, currency: 'USD' | 'INR' = 'USD') => {
  const formatter = new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

export const formatDualCurrency = (amount: number) => {
  const settings = storage.getSettings();
  
  // Assuming 1 USD = 83 INR for mock purposes
  const usd = formatCurrency(amount, 'USD');
  const inr = formatCurrency(amount * 83, 'INR');

  if (settings.currency === 'USD') return { main: usd, sub: null };
  if (settings.currency === 'INR') return { main: inr, sub: null };
  
  return { main: usd, sub: inr };
};
