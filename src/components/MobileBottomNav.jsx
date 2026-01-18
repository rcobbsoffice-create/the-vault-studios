import React from 'react';
import { Calendar, Headphones, User, Home } from 'lucide-react';

const MobileBottomNav = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'dashboard', label: 'Home', icon: Home }, // Optional "Overview" tab if we have one, otherwise maybe just map to Bookings? 
        // Actually Dashboard.jsx logic seems to use tabs: 'bookings', 'bounces', 'profile'. 
        // Let's stick to those.
        { id: 'bookings', label: 'Sessions', icon: Calendar },
        { id: 'bounces', label: 'Bounces', icon: Headphones },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="lg:hidden fixed bottom-6 left-4 right-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 z-50 shadow-2xl safe-area-bottom">
            <div className="flex justify-around items-center">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id || (item.id === 'bookings' && activeTab === 'dashboard'); // Fallback if needed
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all w-16 ${isActive
                                    ? 'bg-zinc-800 text-gold shadow-lg shadow-black/50 scale-105'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                            <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileBottomNav;
