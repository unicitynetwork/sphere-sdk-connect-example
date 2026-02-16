import { useState } from 'react';
import { RPC_METHODS } from '@unicitylabs/sphere-sdk/connect';
import { ResultDisplay } from '../ui/ResultDisplay';
import { CoinBadge } from '../ui/CoinBadge';
import { formatAmount, formatFiat, formatChange } from '../../lib/format';
import type { Asset } from '../../lib/types';

interface Props {
  query: <T>(method: string, params?: Record<string, unknown>) => Promise<T>;
}

export function AssetsPanel({ query }: Props) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [raw, setRaw] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [coinFilter, setCoinFilter] = useState('');

  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = coinFilter ? { coinId: coinFilter } : undefined;
      const result = await query<Asset[]>(RPC_METHODS.GET_ASSETS, params);
      setAssets(result ?? []);
      setRaw(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-gray-900">Assets</h2>
        <span className="text-[10px] font-mono text-blue-500 bg-blue-50 px-2 py-0.5 rounded">sphere_getAssets</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">Full asset details with fiat values and 24h change</p>

      <div className="flex gap-2 mb-3">
        <input
          type="text" value={coinFilter} onChange={(e) => setCoinFilter(e.target.value)}
          placeholder="Filter by coinId (optional)"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
        />
        <button onClick={execute} disabled={loading}
          className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed text-sm">
          {loading ? '...' : 'Fetch'}
        </button>
      </div>

      {assets.length > 0 && !error && (
        <div className="space-y-3 mt-4">
          {assets.map((a) => {
            const change = formatChange(a.change24h);
            return (
              <div key={a.coinId} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <CoinBadge symbol={a.symbol} iconUrl={a.iconUrl} />
                  <div className="text-right">
                    <div className="font-mono text-sm text-gray-900">{formatAmount(a.totalAmount, a.decimals)}</div>
                    <div className="text-xs text-gray-400">{formatFiat(a.fiatValueUsd)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span>{a.tokenCount} token{a.tokenCount !== 1 ? 's' : ''} ({a.confirmedTokenCount} confirmed)</span>
                  <span className={change.color}>{change.text}</span>
                </div>
                {(a.unconfirmedAmount && a.unconfirmedAmount !== '0') && (
                  <div className="text-xs text-yellow-600 mt-1">
                    Unconfirmed: {formatAmount(a.unconfirmedAmount, a.decimals)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ResultDisplay result={raw} error={error} />
    </div>
  );
}
