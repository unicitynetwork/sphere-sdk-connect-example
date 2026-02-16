import { useState, useEffect, useRef } from 'react';
import { RPC_METHODS } from '@unicitylabs/sphere-sdk/connect';
import { formatAmount } from '../../lib/format';

interface CoinOption {
  coinId: string;
  symbol: string;
  name: string;
  decimals: number;
  iconUrl?: string | null;
  totalAmount: string;
}

interface CoinSelectProps {
  value: string;
  onChange: (coinId: string) => void;
  query: <T>(method: string, params?: Record<string, unknown>) => Promise<T>;
}

export function CoinSelect({ value, onChange, query }: CoinSelectProps) {
  const [coins, setCoins] = useState<CoinOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    query<CoinOption[]>(RPC_METHODS.GET_ASSETS)
      .then((assets) => {
        if (assets?.length) {
          setCoins(assets);
          if (!value && assets[0]) onChange(assets[0].coinId);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = coins.find((c) => c.coinId === value);

  if (!loaded) {
    return (
      <div className="w-36 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-400 bg-gray-50">
        Loading...
      </div>
    );
  }

  if (coins.length === 0) {
    return (
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="Coin ID"
        className="w-36 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
    );
  }

  return (
    <div ref={ref} className="relative w-44">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-colors">
        {selected ? (
          <>
            <CoinIcon symbol={selected.symbol} iconUrl={selected.iconUrl} />
            <span className="font-semibold text-gray-800">{selected.symbol}</span>
            <span className="text-gray-400 text-xs ml-auto truncate">
              {formatAmount(selected.totalAmount, selected.decimals)}
            </span>
          </>
        ) : (
          <span className="text-gray-400">Select coin</span>
        )}
        <svg className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {coins.map((coin) => (
            <button key={coin.coinId} type="button"
              onClick={() => { onChange(coin.coinId); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                coin.coinId === value ? 'bg-orange-50' : 'hover:bg-gray-50'
              }`}>
              <CoinIcon symbol={coin.symbol} iconUrl={coin.iconUrl} />
              <div className="flex-1 text-left">
                <div className="font-semibold text-gray-800">{coin.symbol}</div>
                <div className="text-[11px] text-gray-400">{coin.name}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-gray-600">{formatAmount(coin.totalAmount, coin.decimals)}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const COLORS = [
  'bg-orange-100 text-orange-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
];

function CoinIcon({ symbol, iconUrl }: { symbol: string; iconUrl?: string | null }) {
  if (iconUrl) return <img src={iconUrl} alt={symbol} className="w-6 h-6 rounded-full" />;
  let h = 0;
  for (let i = 0; i < symbol.length; i++) h = (h * 31 + symbol.charCodeAt(i)) | 0;
  const cls = COLORS[Math.abs(h) % COLORS.length];
  return <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${cls}`}>{symbol.charAt(0)}</span>;
}
