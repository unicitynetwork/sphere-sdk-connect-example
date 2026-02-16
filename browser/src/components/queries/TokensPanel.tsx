import { useState } from 'react';
import { RPC_METHODS } from '@unicitylabs/sphere-sdk/connect';
import { ResultDisplay } from '../ui/ResultDisplay';
import { CoinBadge } from '../ui/CoinBadge';
import { StatusBadge } from '../ui/StatusBadge';
import { formatAmount, relativeTime, truncate } from '../../lib/format';
import type { Token } from '../../lib/types';

interface Props {
  query: <T>(method: string, params?: Record<string, unknown>) => Promise<T>;
}

export function TokensPanel({ query }: Props) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [raw, setRaw] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [coinFilter, setCoinFilter] = useState('');

  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = coinFilter ? { coinId: coinFilter } : undefined;
      const result = await query<Token[]>(RPC_METHODS.GET_TOKENS, params);
      setTokens(result ?? []);
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
        <h2 className="text-lg font-semibold text-gray-900">Tokens</h2>
        <span className="text-[10px] font-mono text-blue-500 bg-blue-50 px-2 py-0.5 rounded">sphere_getTokens</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">Individual token list with status</p>

      <div className="flex gap-2 mb-3">
        <input type="text" value={coinFilter} onChange={(e) => setCoinFilter(e.target.value)}
          placeholder="Filter by coinId (optional)"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
        <button onClick={execute} disabled={loading}
          className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed text-sm">
          {loading ? '...' : 'Fetch'}
        </button>
      </div>

      {tokens.length > 0 && !error && (
        <div className="mt-4 space-y-2">
          {tokens.map((t) => (
            <div key={t.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CoinBadge symbol={t.symbol} iconUrl={t.iconUrl} size="sm" />
                <div>
                  <div className="font-mono text-sm text-gray-900">{formatAmount(t.amount, t.decimals)}</div>
                  <div className="text-[11px] text-gray-400 font-mono">{truncate(t.id, 10, 6)}</div>
                </div>
              </div>
              <div className="text-right">
                <StatusBadge status={t.status} />
                <div className="text-[11px] text-gray-400 mt-1">{relativeTime(t.updatedAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ResultDisplay result={raw} error={error} />
    </div>
  );
}
