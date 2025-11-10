export function parseDecimal(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  
  if (typeof value === 'number') return value;
  
  const parsed = parseFloat(value.toString());
  return isNaN(parsed) ? 0 : parsed;
}

export function formatCurrency(value: string | number | null | undefined): string {
  const amount = parseDecimal(value);
  return `R${amount.toFixed(2)}`;
}
