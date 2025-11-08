import React, { useState, useEffect } from 'react';

const BellIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a2 2 0 10-4 0v.083A6 6 0 004 11v3.159c0 .538-.214 1.055-.595 1.436L2 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const BellSlashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-11.25h.008v.008h-.008V.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V7.5m8.25-4.5H5.25A2.25 2.25 0 003 5.25v12.75a2.25 2.25 0 002.25 2.25h9.75a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V3m-3 0h3m-3 18.75h3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
    </svg>
);


const NotificationBell: React.FC = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if ('Notification' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!isSupported) {
            alert("This browser does not support desktop notification");
            return;
        }
        
        const result = await Notification.requestPermission();
        setPermission(result);
    };

    const getTooltipText = () => {
        switch (permission) {
            case 'granted':
                return 'Notifications are enabled.';
            case 'denied':
                return 'Notifications are blocked. Check your browser settings.';
            default:
                return 'Click to enable notifications.';
        }
    };

    if (!isSupported) {
        return null;
    }

    return (
        <div className="relative group">
            <button 
                onClick={requestPermission} 
                disabled={permission !== 'default'}
                className={`p-2 rounded-full transition-colors ${permission === 'default' ? 'text-gray-300 hover:text-amber-400 hover:bg-gray-700' : 'text-gray-500 cursor-default'}`}
                aria-label={getTooltipText()}
            >
                {permission === 'denied' ? <BellSlashIcon className="w-6 h-6" /> : <BellIcon className="w-6 h-6" />}
                 {permission === 'granted' && (
                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-gray-800"></span>
                 )}
            </button>
            <div className="absolute top-full right-0 mt-2 w-48 bg-gray-700 text-white text-xs rounded-md shadow-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                {getTooltipText()}
            </div>
        </div>
    );
};

export default NotificationBell;
