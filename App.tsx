import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_SIGNALS } from './constants';
import { Page, Signal, SignalTag, SignalStatus } from './types';
import SignalCard from './components/SignalCard';
import SignalDetail from './components/SignalDetail';
import AdminPanel from './components/AdminPanel';
import AdminDashboard from './components/AdminDashboard';
import { AdminIcon, BackIcon } from './components/icons';
import NotificationBell from './components/NotificationBell';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  
  const [signals, setSignals] = useState<Signal[]>(() => {
    try {
      const savedSignals = window.localStorage.getItem('kdm_signals');
      return savedSignals ? JSON.parse(savedSignals) : MOCK_SIGNALS;
    } catch (error) {
      console.error("Could not parse signals from localStorage", error);
      return MOCK_SIGNALS;
    }
  });
  
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [signalToEdit, setSignalToEdit] = useState<Signal | null>(null);
  const [filter, setFilter] = useState<SignalTag | 'all'>('all');
  const [channelAccess, setChannelAccess] = useState<SignalTag | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');

  useEffect(() => {
    try {
      window.localStorage.setItem('kdm_signals', JSON.stringify(signals));
    } catch (error) {
      console.error("Could not save signals to localStorage", error);
    }
  }, [signals]);

  const handleSelectChannel = (channel: SignalTag) => {
    setChannelAccess(channel);
    setFilter(channel === SignalTag.VIP ? 'all' : SignalTag.FREE);
    setCurrentPage('feed');
  };

  const handleSelectSignal = (signal: Signal) => {
    setSelectedSignal(signal);
    setCurrentPage('detail');
  };

  const handleBackToFeed = () => {
    setSelectedSignal(null);
    setSignalToEdit(null);
    setCurrentPage('feed');
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
    setChannelAccess(null);
  }
  
  const handleOpenAdminLogin = () => {
    setAdminPassword('');
    setAdminPasswordError('');
    setShowAdminLogin(true);
  };
  
  const handleAdminLoginAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'adminkdm321') {
      setCurrentPage('admin_dashboard');
      setShowAdminLogin(false);
    } else {
      setAdminPasswordError('Incorrect code. Please try again.');
      setAdminPassword('');
    }
  };

  const handleNavigateToAddForm = () => {
    setSignalToEdit(null);
    setCurrentPage('admin');
  };
  
  const handleGoToEditForm = (signal: Signal) => {
    setSignalToEdit(signal);
    setCurrentPage('admin');
  };

  const handleSaveSignal = (signalToSave: Signal) => {
    const signalExists = signals.some(s => s.id === signalToSave.id);
    if (signalExists) {
        setSignals(signals.map(s => s.id === signalToSave.id ? signalToSave : s));
    } else {
        setSignals(prevSignals => [signalToSave, ...prevSignals]);
    }
    setCurrentPage('admin_dashboard');
  };
  
  const handleDeleteSignal = (signalId: string) => {
      setSignals(signals.filter(s => s.id !== signalId));
  };

  const handleStatusChange = (signalId: string, newStatus: SignalStatus) => {
      setSignals(signals.map(s => s.id === signalId ? { ...s, status: newStatus } : s));
  };

  const sortedSignals = useMemo(() => {
    return [...signals].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [signals]);

  const filteredSignals = useMemo(() => {
    if (channelAccess === SignalTag.FREE) {
      return sortedSignals.filter(s => s.tag === SignalTag.FREE || s.tag === SignalTag.BOTH);
    }
    
    if (filter === 'all') {
      return sortedSignals;
    }
    if (filter === SignalTag.FREE) {
      return sortedSignals.filter(s => s.tag === SignalTag.FREE || s.tag === SignalTag.BOTH);
    }
    if (filter === SignalTag.VIP) {
      return sortedSignals.filter(s => s.tag === SignalTag.VIP || s.tag === SignalTag.BOTH);
    }

    return sortedSignals;
  }, [sortedSignals, filter, channelAccess]);

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 text-center relative">
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in { animation: fadeIn 0.7s ease-in-out forwards; }
            `}</style>
             <button onClick={handleOpenAdminLogin} className="absolute top-4 right-4 text-gray-400 hover:text-amber-400 transition-colors p-2 rounded-full hover:bg-gray-800">
              <AdminIcon className="w-6 h-6" />
            </button>
            <div className="animate-fade-in">
                <h1 className="text-5xl font-bold text-amber-400 mb-4">KDM Signal</h1>
                <p className="text-gray-400 text-lg mb-12">Choose your channel to view trading signals</p>
                <div className="space-y-6 w-full max-w-sm">
                <button
                    onClick={() => handleSelectChannel(SignalTag.VIP)}
                    className="w-full py-4 px-6 font-bold text-lg text-gray-900 bg-amber-500 rounded-xl hover:bg-amber-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-amber-500/20"
                >
                    VIP Signals ✨
                </button>
                <button
                    onClick={() => handleSelectChannel(SignalTag.FREE)}
                    className="w-full py-4 px-6 font-bold text-lg text-white bg-gray-700 rounded-xl hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                    Free Signals
                </button>
                </div>
            </div>
          </div>
        );
      case 'detail':
        return selectedSignal && <SignalDetail 
            signal={selectedSignal} 
            onBack={handleBackToFeed}
        />;
      case 'admin':
        return <AdminPanel 
            onSave={handleSaveSignal} 
            onBack={() => setCurrentPage('admin_dashboard')} 
            signalToEdit={signalToEdit} 
        />;
      case 'admin_dashboard':
        return <AdminDashboard 
            signals={sortedSignals}
            onAddSignal={handleNavigateToAddForm}
            onEditSignal={handleGoToEditForm}
            onDeleteSignal={handleDeleteSignal}
            onStatusChange={handleStatusChange}
            onBack={handleBackToLanding}
        />
      case 'feed':
      default:
        return (
          <div className="p-4 md:p-6">
            {channelAccess === SignalTag.VIP && (
              <div className="flex justify-center items-center mb-6 bg-gray-800 p-2 rounded-xl border border-gray-700 max-w-sm mx-auto">
                <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors w-full ${filter === 'all' ? 'bg-amber-500 text-gray-900' : 'text-gray-300'}`}>All</button>
                <button onClick={() => setFilter(SignalTag.FREE)} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors w-full ${filter === SignalTag.FREE ? 'bg-amber-500 text-gray-900' : 'text-gray-300'}`}>Free</button>
                <button onClick={() => setFilter(SignalTag.VIP)} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors w-full ${filter === SignalTag.VIP ? 'bg-amber-500 text-gray-900' : 'text-gray-300'}`}>VIP</button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredSignals.map(signal => (
                <SignalCard key={signal.id} signal={signal} onClick={() => handleSelectSignal(signal)} />
              ))}
            </div>
          </div>
        );
    }
  };

  const renderContent = () => {
    if (currentPage === 'landing' || currentPage === 'admin_dashboard' || currentPage === 'admin') {
      return renderPage();
    }

    return (
      <div className="bg-gray-900 min-h-screen text-white font-sans">
        <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-700">
          <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {currentPage === 'feed' && (
                   <button onClick={handleBackToLanding} className="text-gray-300 hover:text-amber-400 transition-colors p-2 rounded-full hover:bg-gray-700" aria-label="Back to Home">
                      <BackIcon className="w-6 h-6" />
                   </button>
              )}
              <h1 className="text-2xl font-bold text-amber-400">KDM Signal</h1>
            </div>
            <NotificationBell />
          </div>
        </header>
        <main>
          {renderPage()}
        </main>
      </div>
    );
  };
  
  return (
      <>
        {renderContent()}
        {showAdminLogin && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
                <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 max-w-sm w-full mx-4 shadow-lg text-center">
                    <h3 className="text-xl font-bold text-white mb-4">Admin Access</h3>
                    <p className="text-gray-400 mb-6">Please enter the access code to continue.</p>
                    <form onSubmit={handleAdminLoginAttempt}>
                        <div className="space-y-4">
                            <input 
                                type="password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                placeholder="******"
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-center tracking-widest"
                                autoFocus
                            />
                            {adminPasswordError && <p className="text-red-400 text-sm">{adminPasswordError}</p>}
                        </div>
                        <button type="submit" className="w-full mt-6 py-3 font-bold text-gray-900 bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors">
                            Enter
                        </button>
                        <button type="button" onClick={() => setShowAdminLogin(false)} className="w-full mt-3 text-sm text-gray-400 hover:text-white transition-colors">
                            Cancel
                        </button>
                    </form>
                </div>
            </div>
        )}
      </>
  )
};

export default App;