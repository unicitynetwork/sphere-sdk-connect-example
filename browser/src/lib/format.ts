export function formatAmount(raw: string, decimals: number): string {
  if (!raw || decimals === 0) return raw ?? '0';
  const str = raw.padStart(decimals + 1, '0');
  const intPart = str.slice(0, str.length - decimals) || '0';
  const fracPart = str.slice(str.length - decimals).replace(/0+$/, '');
  const intFormatted = Number(intPart).toLocaleString('en-US');
  return fracPart ? `${intFormatted}.${fracPart}` : intFormatted;
}

export function formatFiat(value: number | null | undefined): string {
  if (value == null) return '—';
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatChange(change: number | null | undefined): { text: string; color: string } {
  if (change == null) return { text: '—', color: 'text-gray-400' };
  const sign = change >= 0 ? '+' : '';
  return {
    text: `${sign}${change.toFixed(2)}%`,
    color: change >= 0 ? 'text-green-600' : 'text-red-600',
  };
}

export function truncate(str: string, start = 8, end = 6): string {
  if (!str || str.length <= start + end + 3) return str ?? '';
  return `${str.slice(0, start)}...${str.slice(-end)}`;
}

export function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const L1_DECIMALS = 8;

export function formatL1(amount: string): string {
  return formatAmount(amount, L1_DECIMALS) + ' ALPHA';
}
