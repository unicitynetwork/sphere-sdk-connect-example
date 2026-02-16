const STYLES: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  received: 'bg-green-100 text-green-700',
  RECEIVED: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  receive: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  submitted: 'bg-yellow-100 text-yellow-700',
  transferring: 'bg-blue-100 text-blue-700',
  delivered: 'bg-blue-100 text-blue-700',
  SENT: 'bg-red-100 text-red-700',
  send: 'bg-red-100 text-red-700',
  spent: 'bg-gray-100 text-gray-500',
  invalid: 'bg-red-100 text-red-700',
  failed: 'bg-red-100 text-red-700',
  MINT: 'bg-purple-100 text-purple-700',
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STYLES[status] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium ${style}`}>
      {status}
    </span>
  );
}
