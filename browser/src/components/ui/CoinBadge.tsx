const COLORS = [
  'bg-orange-100 text-orange-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
];

function colorFor(symbol: string): string {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) hash = (hash * 31 + symbol.charCodeAt(i)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length]!;
}

interface CoinBadgeProps {
  symbol: string;
  iconUrl?: string | null;
  size?: 'sm' | 'md';
}

export function CoinBadge({ symbol, iconUrl, size = 'md' }: CoinBadgeProps) {
  const dim = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';

  return (
    <span className="inline-flex items-center gap-1.5">
      {iconUrl ? (
        <img src={iconUrl} alt={symbol} className={`${dim} rounded-full object-cover`} />
      ) : (
        <span className={`${dim} rounded-full flex items-center justify-center font-bold ${colorFor(symbol)}`}>
          {symbol.charAt(0)}
        </span>
      )}
      <span className="font-semibold text-gray-800">{symbol}</span>
    </span>
  );
}
