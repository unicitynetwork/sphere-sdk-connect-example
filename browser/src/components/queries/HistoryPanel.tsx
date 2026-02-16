import { useState } from 'react';
import { RPC_METHODS } from '@unicitylabs/sphere-sdk/connect';
import { ResultDisplay } from '../ui/ResultDisplay';
import { StatusBadge } from '../ui/StatusBadge';
import { relativeTime } from '../../lib/format';
import type { HistoryEntry } from '../../lib/types';

interface Props {
  query: <T>(method: string, params?: Record<string, unknown>) => Promise<T>;
}

export function HistoryPanel({ query }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [raw, setRaw] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await query<HistoryEntry[]>(RPC_METHODS.GET_HISTORY);
      setEntries(result ?? []);
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
        <h2 className="text-lg font-semibold text-gray-900">History</h2>
        <span className="text-[10px] font-mono text-blue-500 bg-blue-50 px-2 py-0.5 rounded">sphere_getHistory</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">Transaction history</p>

      <button onClick={execute} disabled={loading}
        className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed">
        {loading ? 'Loading...' : 'Fetch History'}
      </button>

      {entries.length > 0 && !error && (
        <div className="mt-4 space-y-2">
          {entries.map((e, i) => (
            <div key={e.id ?? i} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusBadge status={e.type} />
                <div>
                  <div className="font-mono text-sm text-gray-900">
                    {e.type === 'SENT' ? '-' : '+'}{e.amount} {e.symbol ?? e.coinId}
                  </div>
                  {e.recipientNametag && <div className="text-xs text-gray-400">to @{e.recipientNametag}</div>}
                  {e.senderNametag && <div className="text-xs text-gray-400">from @{e.senderNametag}</div>}
                  {!e.recipientNametag && !e.senderNametag && e.senderPubkey && (
                    <div className="text-xs text-gray-400 font-mono">{e.senderPubkey.slice(0, 16)}...</div>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-400">{relativeTime(e.timestamp)}</div>
            </div>
          ))}
        </div>
      )}

      <ResultDisplay result={raw} error={error} />
    </div>
  );
}
