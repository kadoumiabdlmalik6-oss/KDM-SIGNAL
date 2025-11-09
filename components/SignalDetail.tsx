
import React from 'react';
import { Signal, SignalStatus, SignalTag, SignalType } from '../types';
import { BackIcon, TrendUpIcon, TrendDownIcon } from './icons';

interface SignalDetailProps {
  signal: Signal;
  onBack: () => void;
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

const SignalDetail: React.FC<SignalDetailProps> = ({ signal, onBack }) => {
  const isBuy = signal.type === SignalType.BUY;

  const getStatusInfo = () => {
    switch (signal.status) {
        case SignalStatus.ACTIVE:
            return { text: 'Active', color: 'bg-blue-500' };
        case SignalStatus.ACHIEVED:
            return { text: 'Achieved (TP)', color: 'bg-green-500' };
        case SignalStatus.CANCELED:
            return { text: 'Canceled (SL)', color: 'bg-red-500' };
        default:
            return { text: 'Unknown', color: 'bg-gray-500' };
    }
  };

  const statusInfo = getStatusInfo();
  
  return (
    <>
      <div className="bg-gray-900 min-h-screen p-4 md:p-6 animate-fade-in">
        <div className="max-w-2xl mx-auto">
          <header className="flex justify-between items-center mb-6">
            <button onClick={onBack} className="flex items-center space-x-2 text-amber-400 hover:text-amber-300 transition-colors">
              <BackIcon className="w-6 h-6" />
              <span>Back to Signals</span>
            </button>
          </header>

          <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white">{signal.symbol}</h1>
                <p className="text-sm text-gray-400 mt-1">{`Posted ${formatTimeAgo(signal.created_at)}`}</p>
                <div className="flex items-center mt-2 space-x-3">
                  <span className={`${statusInfo.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>{statusInfo.text}</span>
                   {(signal.tag === SignalTag.VIP || signal.tag === SignalTag.BOTH) && (
                      <span className="text-xs font-bold bg-amber-500 text-gray-900 px-3 py-1 rounded-full">VIP</span>
                    )}
                </div>
              </div>
              <div className={`p-3 rounded-full ${isBuy ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {isBuy ? <TrendUpIcon className="w-8 h-8 text-green-400" /> : <TrendDownIcon className="w-8 h-8 text-red-400" />}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 my-6">
               <div className="bg-gray-900 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Type</p>
                  <p className={`text-xl font-bold ${isBuy ? 'text-green-400' : 'text-red-400'}`}>{isBuy ? 'BUY' : 'SELL'}</p>
               </div>
               <div className="bg-gray-900 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Entry Price</p>
                  <p className="text-xl font-bold font-mono text-white">{signal.entry}</p>
               </div>
            </div>

            <div className="space-y-3">
               <h3 className="text-lg font-semibold text-amber-400 border-b-2 border-amber-500/30 pb-2 mb-3">Targets & Stop Loss</h3>
               {signal.take_profits.map((tp, index) => (
                   <div key={index} className="flex justify-between items-center bg-gray-900 p-3 rounded-lg">
                      <span className="text-gray-300">Target {index + 1}</span>
                      <span className="font-mono text-green-400 font-semibold">{tp}</span>
                   </div>
               ))}
               <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg">
                  <span className="text-gray-300">Stop Loss</span>
                  <span className="font-mono text-red-400 font-semibold">{signal.stop_loss}</span>
               </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-amber-400 border-b-2 border-amber-500/30 pb-2 mb-3">Confidence Level</h3>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-amber-600 bg-amber-200">
                      {Math.round(signal.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-3 mb-4 text-xs flex rounded bg-gray-700">
                  <div style={{ width: `${signal.confidence * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500 transition-all duration-500"></div>
                </div>
              </div>
            </div>

            {signal.notes && (
                <div className="mt-6">
                <h3 className="text-lg font-semibold text-amber-400 border-b-2 border-amber-500/30 pb-2 mb-3">Analyst Notes</h3>
                <p className="text-gray-300 bg-gray-900 p-4 rounded-lg italic">{signal.notes}</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SignalDetail;