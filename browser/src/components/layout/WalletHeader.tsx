import type { PublicIdentity } from '@unicitylabs/sphere-sdk/connect';
import { truncate } from '../../lib/format';

interface WalletHeaderProps {
  identity: PublicIdentity;
  onDisconnect: () => void;
}

export function WalletHeader({ identity, onDisconnect }: WalletHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-gray-900">Sphere Connect</h1>
        <span className="hidden sm:inline-block h-5 w-px bg-gray-200" />
        {identity.nametag && (
          <span className="hidden sm:inline text-sm font-mono text-orange-600">@{identity.nametag}</span>
        )}
        <span className="hidden md:inline text-xs font-mono text-gray-400">
          {truncate(identity.directAddress ?? identity.chainPubkey)}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-green-600">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Connected
        </span>
        <button
          onClick={onDisconnect}
          className="text-sm text-red-500 hover:text-red-700 font-medium cursor-pointer"
        >
          Disconnect
        </button>
      </div>
    </header>
  );
}
