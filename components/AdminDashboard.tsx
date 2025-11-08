import React, { useState } from 'react';
import { Signal, SignalStatus, SignalTag, SignalType } from '../types';
import { BackIcon, EditIcon, TrashIcon, ShareIcon, PlusIcon } from './icons';

interface AdminDashboardProps {
  signals: Signal[];
  onAddSignal: () => void;
  onEditSignal: (signal: Signal) => void;
  onDeleteSignal: (signalId: string) => void;
  onStatusChange: (signalId: string, newStatus: SignalStatus) => void;
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ signals, onAddSignal, onEditSignal, onDeleteSignal, onStatusChange, onBack }) => {
    const [signalToShare, setSignalToShare] = useState<Signal | null>(null);

    const handleShare = (signal: Signal) => {
        setSignalToShare(signal);
    };

    const handleConfirmShare = (channel: 'VIP' | 'FREE') => {
        if (!signalToShare) return;

        const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
        const targets = signalToShare.take_profits.map((tp, i) => `Target ${i + 1}: ${tp}`).join('\n');
        
        const vipHeader = `✨ *KDM Signal - VIP Special* ✨`;
        const freeHeader = `*KDM Trading Signal*`;
        const isBuy = signalToShare.type === SignalType.BUY;

        const message = `
${channel === 'VIP' ? vipHeader : freeHeader}
*Shared at: ${now}*

*Pair:* ${signalToShare.symbol}
*Type:* ${isBuy ? 'BUY' : 'SELL'}
*Entry Price:* ${signalToShare.entry}
*Stop Loss:* ${signalToShare.stop_loss}

*Take Profit Targets:*
${targets}

*Confidence:* ${Math.round(signalToShare.confidence * 100)}%
*Notes:* ${signalToShare.notes}
        `.trim();

        // Trigger browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            const notificationTitle = `New KDM Signal: ${signalToShare.symbol} (${channel})`;
            const notificationBody = `Type: ${isBuy ? 'BUY' : 'SELL'}\nEntry: ${signalToShare.entry}\nStop Loss: ${signalToShare.stop_loss}`;
            new Notification(notificationTitle, {
                body: notificationBody,
                icon: 'https://cdn-icons-png.flaticon.com/512/1041/1041893.png'
            });
        }

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        setSignalToShare(null);
    };

    const handleDelete = (signal: Signal) => {
        if (window.confirm(`Are you sure you want to delete the signal for ${signal.symbol}?`)) {
            onDeleteSignal(signal.id);
        }
    }
    
    const getTagInfo = (tag: SignalTag) => {
        switch(tag) {
            case SignalTag.FREE: return { text: 'Free', class: 'bg-gray-500 text-white' };
            case SignalTag.VIP: return { text: 'VIP', class: 'bg-amber-500 text-gray-900' };
            case SignalTag.BOTH: return { text: 'VIP & Free', class: 'bg-sky-500 text-white' };
            default: return { text: 'Unknown', class: '' };
        }
    }

    return (
        <>
            <div className="bg-gray-900 min-h-screen p-4 md:p-6 animate-fade-in">
                <div className="max-w-4xl mx-auto">
                    <header className="flex justify-between items-center mb-6">
                        <button onClick={onBack} className="flex items-center space-x-2 text-amber-400 hover:text-amber-300 transition-colors">
                            <BackIcon className="w-6 h-6" />
                            <span>Back</span>
                        </button>
                        <h1 className="text-2xl font-bold text-white">KDM Dashboard</h1>
                        <button onClick={onAddSignal} className="flex items-center space-x-2 bg-amber-500 text-gray-900 font-bold px-4 py-2 rounded-lg hover:bg-amber-400 transition-colors">
                            <PlusIcon className="w-5 h-5" />
                            <span>New Signal</span>
                        </button>
                    </header>

                    <div className="space-y-4">
                        {signals.map(signal => {
                            const tagInfo = getTagInfo(signal.tag);
                            return (
                                <div key={signal.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center">
                                        <div className="mb-4 md:mb-0">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${tagInfo.class}`}>{tagInfo.text}</span>
                                                <h3 className="text-xl font-bold">{signal.symbol}</h3>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(signal.created_at).toLocaleString('en-US')}</p>
                                        </div>
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => onEditSignal(signal)} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600" aria-label="Edit"><EditIcon className="w-5 h-5 text-amber-400" /></button>
                                            <button onClick={() => handleDelete(signal)} className="p-2 rounded-full bg-gray-700 hover:bg-red-500/20" aria-label="Delete"><TrashIcon className="w-5 h-5 text-red-400" /></button>
                                            <button onClick={() => handleShare(signal)} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600" aria-label="Share"><ShareIcon className="w-5 h-5 text-sky-400" /></button>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <div className="flex items-center justify-center gap-2">
                                            {(Object.values(SignalStatus)).map(status => {
                                                const isActive = signal.status === status;
                                                const statusTextMap = { [SignalStatus.ACTIVE]: 'Active', [SignalStatus.ACHIEVED]: 'Achieved', [SignalStatus.CANCELED]: 'Canceled' };
                                                let buttonClass = 'py-1.5 px-3 text-sm rounded-lg font-semibold transition-all duration-300 flex-1 ';
                                                if (isActive) {
                                                    buttonClass += 'bg-amber-500 text-gray-900 cursor-not-allowed';
                                                } else {
                                                    buttonClass += 'bg-gray-700 text-white hover:bg-amber-400 hover:text-gray-900';
                                                }
                                                return <button key={status} onClick={() => onStatusChange(signal.id, status)} disabled={isActive} className={buttonClass}>{statusTextMap[status]}</button>;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            
            {signalToShare && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-sm w-full mx-4 shadow-lg">
                        <h3 className="text-xl font-bold text-white text-center mb-6">Share Signal To</h3>
                        <div className="space-y-4">
                            <button onClick={() => handleConfirmShare('VIP')} className="w-full py-3 font-bold text-gray-900 bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors">
                                VIP Channel ✨
                            </button>
                            <button onClick={() => handleConfirmShare('FREE')} className="w-full py-3 font-bold text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                                Free Channel
                            </button>
                        </div>
                        <button onClick={() => setSignalToShare(null)} className="w-full mt-6 text-sm text-gray-400 hover:text-white transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminDashboard;