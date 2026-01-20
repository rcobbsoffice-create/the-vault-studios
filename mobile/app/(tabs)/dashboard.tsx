import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { DollarSign, Users, ChevronRight } from 'lucide-react-native';

export default function Dashboard() {
    const { allUsers, allBookings, user, logout } = useAuth();

    // Analytics Logic (Ported)
    const artists = useMemo(() => allUsers.filter(u => u.role === 'ARTIST'), [allUsers]);
    const totalRevenue = useMemo(() => {
        return artists.reduce((acc, artist) => acc + (artist.bookings || []).reduce((sum, b) => b.status === 'Confirmed' ? sum + (b.price || 0) : sum, 0), 0);
    }, [artists]);

    const revenueData = useMemo(() => {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push({
                name: d.toLocaleString('default', { month: 'short' }),
                month: d.getMonth(),
                year: d.getFullYear(),
                total: 0
            });
        }

        (allBookings || []).forEach(b => {
            // Web used 'paymentStatus' check too, but simplified here for initial port
            if (b.status === 'Confirmed' || b.paymentStatus === 'paid') {
                const d = new Date(b.date);
                const m = months.find(mo => mo.month === d.getMonth() && mo.year === d.getFullYear());
                if (m) m.total += (parseFloat(b.price) || 0);
            }
        });

        const max = Math.max(...months.map(m => m.total), 1);
        return months.map(m => ({ ...m, percent: (m.total / max) * 100 }));
    }, [allBookings]);

    return (
        <ScrollView className="flex-1 bg-black p-6 pt-16">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-8">
                <View>
                    <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Welcome back</Text>
                    <Text className="text-white text-2xl font-black uppercase tracking-tighter">{user?.name || 'Admin'}</Text>
                </View>
                <TouchableOpacity onPress={logout} className="bg-zinc-900 px-4 py-2 rounded-lg">
                    <Text className="text-zinc-400 text-[10px] font-bold uppercase">Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Stats Cards */}
            <View className="flex-row gap-4 mb-8">
                <View className="flex-1 bg-zinc-900 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                    <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Clients</Text>
                    <Text className="text-white text-3xl font-black">{artists.length}</Text>
                    <Users size={60} color="#D4AF37" className="absolute -bottom-4 -right-4 opacity-10" />
                </View>
                <View className="flex-1 bg-zinc-900 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                    <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Revenue</Text>
                    <Text className="text-white text-3xl font-black">${totalRevenue.toLocaleString()}</Text>
                    <DollarSign size={60} color="#00D632" className="absolute -bottom-4 -right-4 opacity-10" />
                </View>
            </View>

            {/* Revenue Chart */}
            <View className="bg-zinc-950 border border-white/10 rounded-[2.5rem] p-6 mb-24">
                <Text className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Revenue Trend</Text>
                <View className="flex-row h-48 items-end justify-between gap-2">
                    {revenueData.map((d, i) => (
                        <View key={i} className="flex-1 items-center gap-2">
                            <View
                                className="w-full bg-zinc-800 rounded-t-sm"
                                style={{ height: `${d.percent}%`, backgroundColor: d.percent > 0 ? '#D4AF37' : '#27272a' }}
                            />
                            <Text className="text-zinc-600 text-[10px] font-bold uppercase">{d.name}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}
