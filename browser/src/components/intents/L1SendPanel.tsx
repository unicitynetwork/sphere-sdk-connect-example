import { useState, useEffect } from 'react';
import { INTENT_ACTIONS, RPC_METHODS } from '@unicitylabs/sphere-sdk/connect';
import { ResultDisplay } from '../ui/ResultDisplay';
import { formatL1 } from '../../lib/format';
import type { L1Balance } from '../../lib/types';

interface Props {
  intent: <T>(action: string, params: Record<string, unknown>) => Promise<T>;
  query: <T>(method: string, params?: Record<string, unknown>) => Promise<T>;
}

export function L1SendPanel({ intent, query }: Props) {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [raw, setRaw] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<L1Balance | null>(null);

  useEffect(() => {
    query<L1Balance>(RPC_METHODS.L1_GET_BALANCE)
      .then(setBalance)
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshBalance = () => {
    query<L1Balance>(RPC_METHODS.L1_GET_BALANCE)
      .then(setBalance)
      .catch(() => {});
  };

  const execute = async () => {
    if (!to || !amount) return;
    setLoading(true);
    setError(null);
    setRaw(null);
    try {
      const result = await intent(INTENT_ACTIONS.L1_SEND, { to, amount });
      setRaw(result);
      refreshBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-gray-900">L1 Send</h2>
        <span className="text-[10px] font-mono text-orange-500 bg-orange-50 px-2 py-0.5 rounded">intent: l1_send</span>
      </div>
      <p className="text-xs text-gray-400 mb-1">Send ALPHA blockchain transaction</p>
      <p className="text-[11px] text-yellow-600 mb-4">Requires wallet approval</p>

      {/* L1 Balance Card */}
      {balance && (
        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Available Balance</span>
            <button onClick={refreshBalance} className="text-[11px] text-orange-500 hover:text-orange-700 cursor-pointer">
              Refresh
            </button>
          </div>
          <div className="text-lg font-bold text-gray-900 font-mono mb-2">{formatL1(balance.confirmed)}</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Unconfirmed</span>
              <span className="font-mono text-gray-600">{formatL1(balance.unconfirmed)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total</span>
              <span className="font-mono text-gray-600">{formatL1(balance.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-500">Vested</span>
              <span className="font-mono text-green-600">{formatL1(balance.vested)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-500">Unvested</span>
              <span className="font-mono text-yellow-600">{formatL1(balance.unvested)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <input type="text" value={to} onChange={(e) => setTo(e.target.value)}
          placeholder="Recipient (alpha1... address)"
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
        <div>
          <label className="block text-xs text-gray-500 mb-1">Amount</label>
          <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount to send"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
        </div>
        <button onClick={execute} disabled={loading || !to || !amount}
          className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed">
          {loading ? 'Sending...' : 'Send L1'}
        </button>
      </div>

      <ResultDisplay result={raw} error={error} />
    </div>
  );
}
