import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, DollarSign, CheckCircle, Layout, Maximize } from 'lucide-react';

const CalendarView = ({ allUsers, onEditBooking, onProcessPayment }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'

    // Helper to get start of week
    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
        return new Date(d.setDate(diff));
    };

    const startOfWeek = getStartOfWeek(currentDate);
    const weekDays = viewMode === 'week'
        ? [...Array(7)].map((_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            return d;
        })
        : [currentDate];

    // Responsive: auto-switch to day view on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setViewMode('day');
            } else {
                setViewMode('week');
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const timeSlots = [...Array(14)].map((_, i) => i + 9); // 9 AM to 10 PM

    // Flatten all bookings from all users
    const allBookings = allUsers.flatMap(user =>
        (user.bookings || []).map(b => ({ ...b, clientName: user.name, clientId: user.id }))
    );

    const getBookingsForCell = (date, hour) => {
        const dateStr = date.toISOString().split('T')[0];
        return allBookings.filter(b => {
            const bookingHour = parseInt(b.time.split(':')[0]);
            return b.date === dateStr && bookingHour === hour;
        });
    };

    const next = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + (viewMode === 'week' ? 7 : 1));
        setCurrentDate(d);
    };

    const prev = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - (viewMode === 'week' ? 7 : 1));
        setCurrentDate(d);
    };

    return (
        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[800px]">
            {/* Header */}
            <div className="p-4 md:p-6 bg-zinc-950 border-b border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                    <h2 className="text-xl md:text-2xl font-display font-bold text-white flex items-center gap-2">
                        <CalendarIcon className="text-gold" />
                        SCHEDULE
                    </h2>

                    {/* View Toggle (Mobile/Desktop) */}
                    <div className="flex bg-zinc-900 rounded-lg p-1 border border-white/5 md:hidden">
                        <button
                            onClick={() => setViewMode('day')}
                            className={`px-3 py-1 rounded text-xs font-bold ${viewMode === 'day' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                        >
                            Day
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-3 py-1 rounded text-xs font-bold ${viewMode === 'week' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                        >
                            Week
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center bg-zinc-900 rounded-lg border border-white/5 p-1 flex-1 md:flex-none justify-between">
                        <button onClick={prev} className="p-2 hover:text-white text-zinc-500 transition-colors"><ChevronLeft size={20} /></button>
                        <span className="px-4 font-mono font-bold text-sm text-zinc-300 whitespace-nowrap">
                            {viewMode === 'week' ? (
                                <>
                                    {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </>
                            ) : (
                                currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                            )}
                        </span>
                        <button onClick={next} className="p-2 hover:text-white text-zinc-500 transition-colors"><ChevronRight size={20} /></button>
                    </div>

                    <div className="hidden md:flex bg-zinc-900 rounded-lg p-1 border border-white/5">
                        <button
                            onClick={() => setViewMode('day')}
                            className={`p-2 rounded hover:bg-zinc-800 transition-colors ${viewMode === 'day' ? 'text-white bg-zinc-800' : 'text-zinc-500'}`}
                            title="Day View"
                        >
                            <Maximize size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`p-2 rounded hover:bg-zinc-800 transition-colors ${viewMode === 'week' ? 'text-white bg-zinc-800' : 'text-zinc-500'}`}
                            title="Week View"
                        >
                            <Layout size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/50">
                <div className={`min-w-full ${viewMode === 'week' ? 'min-w-[800px]' : ''}`}>
                    {/* Days Header */}
                    <div className={`grid border-b border-white/10 sticky top-0 bg-zinc-950 z-20`} style={{ gridTemplateColumns: `80px repeat(${weekDays.length}, 1fr)` }}>
                        <div className="p-4 border-r border-white/10 text-center text-zinc-600 font-bold text-xs uppercase tracking-widest flex items-center justify-center">Time</div>
                        {weekDays.map(day => (
                            <div key={day.toISOString()} className={`p-4 border-r border-white/10 text-center ${day.toDateString() === new Date().toDateString() ? 'bg-gold/5' : ''}`}>
                                <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${day.toDateString() === new Date().toDateString() ? 'text-gold' : 'text-zinc-500'}`}>
                                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div className={`text-xl font-display font-bold ${day.toDateString() === new Date().toDateString() ? 'text-white' : 'text-zinc-400'}`}>
                                    {day.getDate()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Time Slots */}
                    {timeSlots.map(hour => (
                        <div key={hour} className="grid border-b border-white/5 h-28" style={{ gridTemplateColumns: `80px repeat(${weekDays.length}, 1fr)` }}>
                            {/* Time Column */}
                            <div className="p-4 border-r border-white/10 text-center text-zinc-600 font-mono text-xs relative">
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black px-1 rounded">
                                    {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                                </span>
                            </div>

                            {/* Days Columns */}
                            {weekDays.map(day => {
                                const bookings = getBookingsForCell(day, hour);
                                return (
                                    <div key={day.toISOString()} className={`border-r border-white/5 relative p-1 transition-colors hover:bg-white/5 group ${day.toDateString() === new Date().toDateString() ? 'bg-gold/5' : ''}`}>
                                        {bookings.map(booking => (
                                            <button
                                                key={booking.id}
                                                onClick={() => onEditBooking(booking, booking.clientId)}
                                                className={`absolute inset-x-1 rounded-lg p-2 text-left transition-all hover:scale-[1.02] shadow-lg overflow-hidden border-l-4 z-10 flex flex-col justify-between
                                                    ${booking.studio.includes('Studio A') ? 'bg-zinc-800 border-gold' : 'bg-zinc-900 border-blue-500'}
                                                `}
                                                style={{
                                                    top: '4px',
                                                    height: `${booking.duration * 112 - 8}px`, // 112px is rough height of row (28 * 4) - adjusting for visual
                                                    minHeight: '40px'
                                                }}
                                            >
                                                <div>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`text-[10px] font-bold uppercase tracking-tighter ${booking.studio.includes('Studio A') ? 'text-gold' : 'text-blue-400'}`}>
                                                            {booking.studio.includes('Studio A') ? 'Studio A' : 'Studio B'}
                                                        </span>
                                                        {booking.paymentStatus === 'Paid' && <CheckCircle size={10} className="text-[#00D632]" />}
                                                    </div>
                                                    <div className="font-bold text-white text-xs truncate leading-tight mb-1">{booking.clientName}</div>
                                                </div>

                                                <div className="flex items-center justify-between text-[10px] bg-black/30 rounded px-1.5 py-1 backdrop-blur-sm">
                                                    <span className="text-zinc-400 font-mono">{booking.time}</span>
                                                    {booking.paymentStatus !== 'Paid' ? (
                                                        <span
                                                            onClick={(e) => { e.stopPropagation(); onProcessPayment(booking, booking.clientId); }}
                                                            className="flex items-center gap-1 text-[#00D632] hover:text-white transition-colors cursor-pointer"
                                                        >
                                                            <DollarSign size={8} /> Pay
                                                        </span>
                                                    ) : (
                                                        <span className="text-green-500 font-bold">PAID</span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
