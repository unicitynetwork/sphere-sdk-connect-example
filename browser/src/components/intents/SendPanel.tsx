import { useState } from 'react';
import { INTENT_ACTIONS } from '@unicitylabs/sphere-sdk/connect';
import { ResultDisplay } from '../ui/ResultDisplay';
import { CoinSelect } from '../ui/CoinSelect';

interface Props {
  intent: <T>(action: string, params: Record<string, unknown>) => Promise<T>;
  query: <T>(method: string, params?: Record<string, unknown>) => Promise<T>;
}

export function SendPanel({ intent, query }: Props) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [coinId, setCoinId] = useState('');
  const [memo, setMemo] = useState('');
  const [raw, setRaw] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    if (!recipient || !amount || !coinId) return;
    setLoading(true);
    setError(null);
    setRaw(null);
    try {
      const to = recipient.startsWith('@') ? recipient : '@' + recipient;
      const params: Record<string, unknown> = { to, amount, coinId };
      if (memo) params.memo = memo;
      const result = await intent(INTENT_ACTIONS.SEND, params);
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
        <h2 className="text-lg font-semibold text-gray-900">Send (L3)</h2>
        <span className="text-[10px] font-mono text-orange-500 bg-orange-50 px-2 py-0.5 rounded">intent: send</span>
      </div>
      <p className="text-xs text-gray-400 mb-1">Transfer L3 tokens to a recipient</p>
      <p className="text-[11px] text-yellow-600 mb-4">Requires wallet approval</p>

      <div className="space-y-3">
        <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)}
          placeholder="Recipient (@nametag, DIRECT://..., pubkey)"
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
        <div className="flex gap-2">
          <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
          <CoinSelect value={coinId} onChange={setCoinId} query={query} />
        </div>
        <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)}
          placeholder="Memo (optional)"
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500" />
        <button onClick={execute} disabled={loading || !recipient || !amount || !coinId}
          className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed">
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <ResultDisplay result={raw} error={error} />
    </div>
  );
}
