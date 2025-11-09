
import React from 'react';
import { Signal, SignalStatus, SignalTag, SignalType } from '../types';
import { TrendUpIcon, TrendDownIcon } from './icons';

interface SignalCardProps {
  signal: Signal;
  onClick: () => void;
}

const formatTimeAgo = (isoDate: string) => {
  const date = new Date(isoDate);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return `just now`;
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days <= 7) return `${days} day${days > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusStyles = (status: SignalStatus) => {
    switch (status) {
        case SignalStatus.ACTIVE:
            return 'bg-blue-500 text-white';
        case SignalStatus.ACHIEVED:
            return 'bg-green-500 text-white';
        case SignalStatus.CANCELED:
            return 'bg-red-500 text-white';
        default:
            return 'bg-gray-500 text-white';
    }
}

const SignalCard: React.FC<SignalCardProps> = ({ signal, onClick }) => {
  const isBuy = signal.type === SignalType.BUY;
  const typeColor = isBuy ? 'text-green-400' : 'text-red-400';

  return (
    <div
      onClick={onClick}
      className="bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-700 hover:border-amber-500 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-3">
            <div>
                <h3 className="text-xl font-bold text-white">{signal.symbol}</h3>
                <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(signal.created_at)}</p>
            </div>
            {(signal.tag === SignalTag.VIP || signal.tag === SignalTag.BOTH) && (
                <span className="text-xs font-bold bg-amber-500 text-gray-900 px-2 py-1 rounded-full">VIP</span>
            )}
        </div>
        <div className="flex items-center space-x-4 mb-4">
          <div className={`flex items-center space-x-2 ${typeColor}`}>
            {isBuy ? <TrendUpIcon className="w-6 h-6" /> : <TrendDownIcon className="w-6 h-6" />}
            <span className="text-lg font-semibold">{isBuy ? 'BUY' : 'SELL'}</span>
          </div>
          <div className={`${getStatusStyles(signal.status)} text-xs font-bold uppercase px-3 py-1 rounded-full`}>
            {signal.status === SignalStatus.ACTIVE && 'Active'}
            {signal.status === SignalStatus.ACHIEVED && 'Achieved (TP)'}
            {signal.status === SignalStatus.CANCELED && 'Canceled (SL)'}
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <span className="text-gray-400">Entry Price:</span>
                <span className="font-mono text-white">{signal.entry}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-400">Stop Loss:</span>
                <span className="font-mono text-red-400">{signal.stop_loss}</span>
            </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${signal.confidence * 100}%` }}></div>
        </div>
        <p className="text-xs text-amber-400 text-center mt-1">
          Confidence: {Math.round(signal.confidence * 100)}%
        </p>
      </div>
    </div>
  );
};

export default SignalCard;