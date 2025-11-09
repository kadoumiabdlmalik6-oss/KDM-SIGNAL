import React, { useState, useMemo } from 'react';
import { Signal, SignalStatus, SignalTag, SignalType } from '../types';
import { BackIcon, EditIcon, TrashIcon, ShareIcon, PlusIcon, ChartBarIcon } from './icons';

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
    const [shareUpdateType, setShareUpdateType] = useState<'new' | string>('new');
    const [timeFilter, setTimeFilter] = useState<'all' | 'day' | 'week' | 'month'>('all');

    const filteredSignals = useMemo(() => {
        const now = new Date();
        if (timeFilter === 'all') return signals;
        
        return signals.filter(signal => {
            const signalDate = new Date(signal.created_at);
            const diffTime = Math.abs(now.getTime() - signalDate.getTime());
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            
            if (timeFilter === 'day') return diffDays <= 1;
            if (timeFilter === 'week') return diffDays <= 7;
            if (timeFilter === 'month') return diffDays <= 30;
            return false;
        });
    }, [signals, timeFilter]);

    const stats = useMemo(() => {
        const closedSignals = filteredSignals.filter(s => s.status === SignalStatus.ACHIEVED || s.status === SignalStatus.CANCELED);
        const wins = closedSignals.filter(s => s.status === SignalStatus.ACHIEVED);

        const totalTrades = filteredSignals.length;
        const winRate = closedSignals.length > 0 ? (wins.length / closedSignals.length) * 100 : 0;

        return {
            totalTrades,
            winRate: winRate.toFixed(1),
        };
    }, [filteredSignals]);

    const handleShare = (signal: Signal) => {
        if (signal.status === SignalStatus.ACHIEVED) {
            setShareUpdateType('achieved');
        } else if (signal.status === SignalStatus.CANCELED) {
            setShareUpdateType('sl');
        } else {
            setShareUpdateType('new');
        }
        setSignalToShare(signal);
    };

    const handleConfirmShare = (channel: 'VIP' | 'FREE') => {
        if (!signalToShare) return;

        const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
        const { symbol, type, entry, stop_loss, take_profits, confidence, notes } = signalToShare;
        const isBuy = type === SignalType.BUY;

        const vipHeader = `✨ *KDM Signal - VIP Special* ✨`;
        const freeHeader = `*KDM Trading Signal*`;
        const header = channel === 'VIP' ? vipHeader : freeHeader;
        
        let messageBody = '';
        let headerText = `*Signal Update at: ${now}*`;

        if (shareUpdateType === 'new') {
            headerText = `*New Signal at: ${now}*`;
            const targets = take_profits.map((tp, i) => `TP${i + 1}: ${tp}`).join('\n');
            messageBody = `
*Pair:* ${symbol}
*Type:* ${isBuy ? 'BUY' : 'SELL'}
*Entry Price:* ${entry}
*Stop Loss (SL):* ${stop_loss}

*Take Profit Targets:*
${targets}

*Confidence:* ${Math.round(confidence * 100)}%
*Notes:* ${notes || 'N/A'}
            `;
        } else if (shareUpdateType.startsWith('tp')) {
            const tpIndex = parseInt(shareUpdateType.replace('tp', ''), 10) - 1;
            if (isNaN(tpIndex) || tpIndex < 0 || tpIndex >= take_profits.length) {
                setSignalToShare(null);
                return;
            }
            const tpValue = take_profits[tpIndex];
            
            const remainingTargets = take_profits.slice(tpIndex + 1);
            
            let remainingTargetsText = '';
            if (remainingTargets.length > 0) {
                remainingTargetsText = `\n\n*Next targets:*\n` + remainingTargets.map((tp, i) => `TP${i + tpIndex + 2}: ${tp}`).join('\n');
            } else {
                remainingTargetsText = `\n\nAll targets reached! Congratulations! 🎉`;
            }

            messageBody = `
*Pair:* ${symbol}
*Status:* ✅ *TAKE PROFIT ${tpIndex + 1} HIT at ${tpValue}!* ✅
${remainingTargetsText}

*Recommendation:* Consider moving your Stop Loss to entry or taking partial profits.
            `;
        } else if (shareUpdateType === 'achieved') {
            const targets = take_profits.map((tp, i) => `✅ TP${i + 1}: ${tp}`).join('\n');
            messageBody = `
*Pair:* ${symbol}
*Status:* 🎉 *FULL TAKE PROFIT ACHIEVED!* 🎉

All targets have been successfully reached.
${targets}

Congratulations to everyone who took this trade!
            `;
        } else if (shareUpdateType === 'sl') {
            messageBody = `
*Pair:* ${symbol}
*Status:* ❌ *STOP LOSS HIT* ❌

The trade has been stopped out at ${stop_loss}. We'll catch the next one!
            `;
        }

        const message = `
${header}
${headerText}

${messageBody.trim()}
        `.trim();

        if ('Notification' in window && Notification.permission === 'granted') {
            const notificationTitle = `KDM Signal Update: ${signalToShare.symbol}`;
            let notificationBody = `Update for ${signalToShare.symbol}`;
            const statusLine = messageBody.split('\n').find(line => line.includes('*Status:*'));
            
            if (statusLine) {
                notificationBody = statusLine.replace(/\*/g, '').replace('Status: ', '');
            } else if (shareUpdateType === 'new') {
                notificationBody = `New ${isBuy ? 'BUY' : 'SELL'} signal for ${symbol}`;
            }

            new Notification(notificationTitle, {
                body: notificationBody.trim(),
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
    
    const handleShareWeeklyStats = () => {
        const now = new Date();
        const weeklySignals = signals.filter(signal => {
            const signalDate = new Date(signal.created_at);
            const diffTime = Math.abs(now.getTime() - signalDate.getTime());
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays <= 7;
        });

        const closedSignals = weeklySignals.filter(s => s.status === SignalStatus.ACHIEVED || s.status === SignalStatus.CANCELED);
        const wins = closedSignals.filter(s => s.status === SignalStatus.ACHIEVED);
        const losses = closedSignals.filter(s => s.status === SignalStatus.CANCELED);
        const winRate = closedSignals.length > 0 ? (wins.length / closedSignals.length) * 100 : 0;
        
        const tradeListString = closedSignals
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map(signal => {
                const symbol = signal.symbol.replace('/', '');
                if (signal.status === SignalStatus.ACHIEVED) {
                    return `${symbol} : tp ${signal.take_profits.length}`;
                } else {
                    return `${symbol} : sl`;
                }
            }).join('\n');

        const startDate = new Date(new Date().setDate(new Date().getDate() - 7)).toLocaleDateString('en-CA');
        const endDate = new Date().toLocaleDateString('en-CA');
        
        const message = `
📊 *KDM Signal - Weekly Performance Summary* 📊
*Period:* ${startDate} to ${endDate}

*Total Signals Shared:* ${weeklySignals.length}
*TP :* ${wins.length}
*SL :* ${losses.length}
*Win Rate:* ${winRate.toFixed(1)}% 🏆

${tradeListString}

Stay tuned for more high-probability signals! 🚀
        `.trim().replace(/\n\n\n/g, '\n\n');
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    const timeFilters: {key: typeof timeFilter, label: string}[] = [
        { key: 'all', label: 'All' },
        { key: 'day', label: 'Day' },
        { key: 'week', label: 'Week' },
        { key: 'month', label: 'Month' },
    ];

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
                    
                    <div className="mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                            <h2 className="text-xl font-bold text-white">Performance Stats</h2>
                            <div className="flex bg-gray-700 p-1 rounded-lg">
                               {timeFilters.map(f => (
                                    <button 
                                        key={f.key}
                                        onClick={() => setTimeFilter(f.key)}
                                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors w-full ${timeFilter === f.key ? 'bg-amber-500 text-gray-900' : 'text-gray-300'}`}
                                    >
                                        {f.label}
                                    </button>
                               ))}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-900 p-4 rounded-lg text-center">
                                <p className="text-sm text-gray-400">Total Trades</p>
                                <p className="text-2xl font-bold text-white">{stats.totalTrades}</p>
                            </div>
                             <div className="bg-gray-900 p-4 rounded-lg text-center">
                                <p className="text-sm text-gray-400">Win Rate</p>
                                <p className="text-2xl font-bold text-green-400">{stats.winRate}%</p>
                            </div>
                        </div>
                        
                        <button onClick={handleShareWeeklyStats} className="w-full flex items-center justify-center space-x-2 bg-sky-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-sky-500 transition-colors">
                            <ChartBarIcon className="w-5 h-5" />
                            <span>Share Weekly Summary</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {filteredSignals.map(signal => {
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
                                                const statusTextMap = { [SignalStatus.ACTIVE]: 'Active', [SignalStatus.ACHIEVED]: 'Achieved (TP)', [SignalStatus.CANCELED]: 'Canceled (SL)' };
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
                        <h3 className="text-xl font-bold text-white text-center mb-4">Share Update for {signalToShare.symbol}</h3>
                        
                        <div className="mb-6">
                            <label htmlFor="updateType" className="block mb-2 text-sm font-medium text-gray-300">Update Type</label>
                            <select 
                                id="updateType"
                                value={shareUpdateType}
                                onChange={(e) => setShareUpdateType(e.target.value as any)}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="new">New Signal</option>
                                {signalToShare.take_profits.map((_, i) => (
                                    <option key={i} value={`tp${i+1}`}>TP{i+1} Hit</option>
                                ))}
                                <option value="achieved">All TPs Hit / Closed in Profit</option>
                                <option value="sl">Stop Loss Hit</option>
                            </select>
                        </div>

                        <div className="space-y-4">
                            <button onClick={() => handleConfirmShare('VIP')} className="w-full py-3 font-bold text-gray-900 bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors">
                                Share to VIP Channel ✨
                            </button>
                            <button onClick={() => handleConfirmShare('FREE')} className="w-full py-3 font-bold text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                                Share to Free Channel
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