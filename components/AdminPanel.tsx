
import React, { useState, useEffect } from 'react';
import { Signal, SignalStatus, SignalTag, SignalType } from '../types';
import { BackIcon } from './icons';

interface AdminPanelProps {
  onSave: (signal: Signal) => void;
  onBack: () => void;
  signalToEdit: Signal | null;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onSave, onBack, signalToEdit }) => {
  const isEditMode = !!signalToEdit;

  const [symbol, setSymbol] = useState('BTC/USDT');
  const [type, setType] = useState<SignalType>(SignalType.BUY);
  const [entry, setEntry] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfits, setTakeProfits] = useState(['', '', '']);
  const [confidence, setConfidence] = useState(0.75);
  const [notes, setNotes] = useState('');
  const [tag, setTag] = useState<SignalTag>(SignalTag.FREE);

  useEffect(() => {
    if (isEditMode && signalToEdit) {
      setSymbol(signalToEdit.symbol);
      setType(signalToEdit.type);
      setEntry(signalToEdit.entry.toString());
      setStopLoss(signalToEdit.stop_loss.toString());
      const tps = [...signalToEdit.take_profits.map(String), '', '', ''].slice(0, 3);
      setTakeProfits(tps);
      setConfidence(signalToEdit.confidence);
      setNotes(signalToEdit.notes);
      setTag(signalToEdit.tag);
    } else {
      setSymbol('BTC/USDT');
      setType(SignalType.BUY);
      setEntry('');
      setStopLoss('');
      setTakeProfits(['', '', '']);
      setConfidence(0.75);
      setNotes('');
      setTag(SignalTag.FREE);
    }
  }, [signalToEdit, isEditMode]);

  const handleTakeProfitChange = (index: number, value: string) => {
    const newTakeProfits = [...takeProfits];
    newTakeProfits[index] = value;
    setTakeProfits(newTakeProfits);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const signalData: Signal = {
      id: isEditMode && signalToEdit ? signalToEdit.id : `sig_${new Date().toISOString()}`,
      symbol,
      type,
      entry: parseFloat(entry),
      stop_loss: parseFloat(stopLoss),
      take_profits: takeProfits.map(tp => parseFloat(tp)).filter(tp => !isNaN(tp)),
      confidence,
      tag,
      notes,
      created_at: isEditMode && signalToEdit ? signalToEdit.created_at : new Date().toISOString(),
      status: isEditMode && signalToEdit ? signalToEdit.status : SignalStatus.ACTIVE,
    };
    onSave(signalData);
  };

  const inputClass = "w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500";
  const labelClass = "block mb-2 text-sm font-medium text-gray-300";

  return (
    <div className="bg-gray-900 min-h-screen p-4 md:p-6 animate-fade-in">
        <div className="max-w-2xl mx-auto">
            <header className="flex items-center mb-6">
                 <button onClick={onBack} className="flex items-center space-x-2 text-amber-400 hover:text-amber-300 transition-colors">
                    <BackIcon className="w-6 h-6" />
                    <span>Back</span>
                </button>
            </header>

            <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">{isEditMode ? 'Edit Signal' : 'Add New Signal'}</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Pair</label>
                            <input type="text" value={symbol} onChange={e => setSymbol(e.target.value)} className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>Type</label>
                            <select value={type} onChange={e => setType(e.target.value as SignalType)} className={inputClass}>
                                <option value={SignalType.BUY}>Buy (BUY)</option>
                                <option value={SignalType.SELL}>Sell (SELL)</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className={labelClass}>Entry Price</label>
                            <input type="number" value={entry} onChange={e => setEntry(e.target.value)} className={inputClass} required step="any" />
                        </div>
                        <div>
                            <label className={labelClass}>Stop Loss</label>
                            <input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)} className={inputClass} required step="any" />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Take Profits</label>
                        <div className="space-y-2">
                            {takeProfits.map((tp, index) => (
                                <input key={index} type="number" placeholder={`Target ${index + 1}`} value={tp} onChange={e => handleTakeProfitChange(index, e.target.value)} className={inputClass} step="any" />
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Confidence Level ({Math.round(confidence * 100)}%)</label>
                        <input type="range" min="0" max="1" step="0.01" value={confidence} onChange={e => setConfidence(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                    </div>
                    <div>
                        <label className={labelClass}>Category</label>
                         <select value={tag} onChange={e => setTag(e.target.value as SignalTag)} className={inputClass}>
                            <option value={SignalTag.FREE}>Free</option>
                            <option value={SignalTag.VIP}>VIP</option>
                            <option value={SignalTag.BOTH}>Free & VIP</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Notes</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} rows={3}></textarea>
                    </div>

                    <button type="submit" className="w-full py-3 mt-4 font-bold text-gray-900 bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors duration-300">
                        {isEditMode ? 'Save Changes' : 'Add Signal'}
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};

export default AdminPanel;