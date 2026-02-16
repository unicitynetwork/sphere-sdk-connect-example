import { useState } from 'react';

interface ResultDisplayProps {
  result: unknown;
  error: string | null;
}

export function ResultDisplay({ result, error }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  if (!result && !error) return null;

  const json = result ? JSON.stringify(result, null, 2) : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (error) {
    return (
      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-500">Result</span>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
      </div>
      <pre className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 overflow-auto max-h-64">
        {json}
      </pre>
    </div>
  );
}
