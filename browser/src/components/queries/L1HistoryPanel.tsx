import { useState } from 'react';
import { RPC_METHODS } from '@unicitylabs/sphere-sdk/connect';
import { ResultDisplay } from '../ui/ResultDisplay';
import { StatusBadge } from '../ui/StatusBadge';
import { relativeTime, truncate, formatL1 } from '../../lib/format';
import type { L1Transaction } from '../../lib/types';

interface Props {
  query: <T>(method: string, params?: Record<string, unknown>) => Promise<T>;
}

export function L1HistoryPanel({ query }: Props) {
  const [txs, setTxs] = useState<L1Transaction[]>([]);
  const [raw, setRaw] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState('10');

  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = {};
      const n = parseInt(limit);
      if (!isNaN(n) && n > 0) params.limit = n;
      const result = await query<L1Transaction[]>(RPC_METHODS.L1_GET_HISTORY, params);
      setTxs(result ?? []);
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
        <h2 className="text-lg font-semibold text-gray-900">L1 History</h2>
        <span className="text-[10px] font-mono text-blue-500 bg-blue-50 px-2 py-0.5 rounded">sphere_l1GetHistory</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">ALPHA blockchain transaction history</p>

      <div className="flex gap-2 mb-3">
        <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)}
          placeholder="Limit" min="1"
          className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
        <button onClick={execute} disabled={loading}
          className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed text-sm">
          {loading ? '...' : 'Fetch L1 History'}
        </button>
      </div>

      {txs.length > 0 && !error && (
        <div className="mt-4 space-y-2">
          {txs.map((tx, i) => (
            <div key={tx.txid ?? i} className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={tx.type} />
                  <span className="font-mono text-sm text-gray-900">{formatL1(tx.amount)}</span>
                </div>
                <span className="text-xs text-gray-400">{relativeTime(tx.timestamp)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-mono">{truncate(tx.txid, 12, 8)}</span>
                <span>fee: {tx.fee} {tx.confirmations != null && `| ${tx.confirmations} conf`}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ResultDisplay result={raw} error={error} />
    </div>
  );
}
