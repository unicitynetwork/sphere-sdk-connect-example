import { useState } from 'react';
import { RPC_METHODS } from '@unicitylabs/sphere-sdk/connect';
import { ResultDisplay } from '../ui/ResultDisplay';
import { formatL1 } from '../../lib/format';
import type { L1Balance } from '../../lib/types';

interface Props {
  query: <T>(method: string, params?: Record<string, unknown>) => Promise<T>;
}

export function L1BalancePanel({ query }: Props) {
  const [data, setData] = useState<L1Balance | null>(null);
  const [raw, setRaw] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await query<L1Balance>(RPC_METHODS.L1_GET_BALANCE);
      setData(result);
      setRaw(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const rows: [string, string][] = data ? [
    ['Confirmed', formatL1(data.confirmed)],
    ['Unconfirmed', formatL1(data.unconfirmed)],
    ['Vested', formatL1(data.vested)],
    ['Unvested', formatL1(data.unvested)],
  ] : [];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-gray-900">L1 Balance</h2>
        <span className="text-[10px] font-mono text-blue-500 bg-blue-50 px-2 py-0.5 rounded">sphere_l1GetBalance</span>
      </div>
      <p className="text-xs text-gray-400 mb-4">ALPHA blockchain balance breakdown</p>

      <button onClick={execute} disabled={loading}
        className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed">
        {loading ? 'Loading...' : 'Fetch L1 Balance'}
      </button>

      {data && !error && (
        <div className="mt-4">
          <div className="text-center py-3 mb-3 bg-orange-50 rounded-xl">
            <div className="text-2xl font-bold text-gray-900 font-mono">{formatL1(data.total)}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="space-y-1">
            {rows.map(([label, val]) => (
              <div key={label} className="flex items-center justify-between py-1.5 px-3 text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-mono text-gray-800">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ResultDisplay result={raw} error={error} />
    </div>
  );
}
