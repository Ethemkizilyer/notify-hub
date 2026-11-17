const formatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

export function formatPrice(cents: number): string {
  return formatter.format(cents / 100);
}
