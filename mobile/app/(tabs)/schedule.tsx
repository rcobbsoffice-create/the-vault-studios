import React, { useMemo, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, FileText, X } from 'lucide-react-native';

export default function Schedule() {
    const { allUsers, allBookings, allNotes } = useAuth();
    const [selectedNote, setSelectedNote] = useState(null);
    const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);

    // 1. Process Data: Flatten & Sort
    const sections = useMemo(() => {
        if (!allUsers || !allBookings) return [];

        // Combine booking data with client names
        const enrichedBookings = allBookings.map(booking => {
            const client = allUsers.find(u => u.id === booking.clientId);
            const note = allNotes?.find(n => n.id === booking.id);
            return {
                ...booking,
                clientName: client?.name || 'Unknown Client',
                clientPhone: client?.phone,
                hasNotes: !!note,
                noteContent: note
            };
        });

        // Sort by Date then Time
        enrichedBookings.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() - dateB.getTime() !== 0) return dateA.getTime() - dateB.getTime();

            // If same date, sort by time (HH:MM string comparison works for 24h format, need to ensure format)
            // Assuming time is "HH:00" format 24h or similar sortable string
            return a.time.localeCompare(b.time);
        });

        // Group by Date
        const grouped = enrichedBookings.reduce((acc, booking) => {
            const dateKey = booking.date; // "YYYY-MM-DD"
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(booking);
            return acc;
        }, {});

        // Convert to SectionList format
        return Object.keys(grouped).sort().map(date => {
            const d = new Date(date + 'T12:00:00'); // Safe parsing to avoid timezone shift
            const today = new Date();
            const isToday = d.toDateString() === today.toDateString();
            const title = isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

            return {
                title,
                data: grouped[date]
            };
        });
    }, [allUsers, allBookings, allNotes]);

    const renderItem = ({ item }) => {
        const isStudioA = item.studio?.includes('Studio A');
        const isPaid = item.paymentStatus === 'paid';
        const endTime = parseInt(item.time.split(':')[0]) + item.duration;

        return (
            <View className={`mb-4 mx-6 p-4 rounded-2xl border-l-4 bg-zinc-900 ${isStudioA ? 'border-l-gold' : 'border-l-blue-500'}`}>
                {/* Header: Time & Studio */}
                <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center gap-2">
                        <Clock size={12} className="text-zinc-500" />
                        <Text className="text-zinc-400 text-xs font-mono font-bold">
                            {item.time} - {endTime}:00
                        </Text>
                    </View>
                    <View className={`px-2 py-1 rounded ${isStudioA ? 'bg-gold/10' : 'bg-blue-500/10'}`}>
                        <Text className={`text-[10px] font-black uppercase tracking-wider ${isStudioA ? 'text-gold' : 'text-blue-400'}`}>
                            {isStudioA ? 'Studio A' : 'Studio B'}
                        </Text>
                    </View>
                </View>

                {/* Client Info */}
                <Text className="text-white text-lg font-bold mb-1">{item.clientName}</Text>

                {/* Notes Indicator */}
                {item.hasNotes && (
                    <TouchableOpacity
                        onPress={() => { setSelectedNote(item.noteContent); setIsNoteModalVisible(true); }}
                        className="flex-row items-center gap-2 mt-2 bg-zinc-800 self-start px-3 py-1.5 rounded-lg active:bg-zinc-700"
                    >
                        <FileText size={12} className="text-gold" />
                        <Text className="text-white text-xs font-bold uppercase tracking-wide">View Notes</Text>
                    </TouchableOpacity>
                )}

                {/* Status Footer */}
                <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-white/5">
                    <View className="flex-row items-center gap-2">
                        {isPaid ? (
                            <>
                                <CheckCircle size={14} className="text-green-500" />
                                <Text className="text-green-500 text-xs font-bold uppercase">Paid</Text>
                            </>
                        ) : (
                            <>
                                <AlertCircle size={14} className="text-yellow-500" />
                                <Text className="text-yellow-500 text-xs font-bold uppercase">Pending</Text>
                            </>
                        )}
                    </View>

                    <Text className="text-zinc-600 text-xs font-bold">${item.price || item.totalCost || 0}</Text>
                </View>
            </View>
        );
    };

    const renderSectionHeader = ({ section: { title } }) => (
        <View className="px-6 py-2 bg-black/90 mb-4 sticky rounded-b-xl border-b border-white/5 z-10">
            <Text className="text-zinc-500 text-xs font-black uppercase tracking-widest">{title}</Text>
        </View>
    );

    return (
        <View className="flex-1 bg-black pt-16">
            <View className="px-6 mb-4">
                <Text className="text-white text-2xl font-black uppercase tracking-tighter">Schedule</Text>
                <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Upcoming Sessions</Text>
            </View>

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={true}
                ListEmptyComponent={
                    <View className="items-center justify-center py-20 opacity-50">
                        <Calendar size={40} className="text-zinc-700 mb-4" />
                        <Text className="text-zinc-600 font-bold uppercase tracking-widest">No Bookings Found</Text>
                    </View>
                }
            />

            {/* Note Viewer Modal */}
            <Modal
                visible={isNoteModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsNoteModalVisible(false)}
            >
                <View className="flex-1 bg-black/90 justify-end">
                    <View className="bg-zinc-950 rounded-t-[2.5rem] border-t border-white/10 p-8 pb-12 h-[80%]">
                        <View className="flex-row justify-between items-center mb-8">
                            <View>
                                <Text className="text-white text-xl font-black uppercase tracking-wider">Session Notes</Text>
                                <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                    {(selectedNote?.lyrics && selectedNote?.technical) ? 'Lyrics & Technical' : (selectedNote?.lyrics ? 'Lyrics' : 'Technical Notes')}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsNoteModalVisible(false)} className="bg-zinc-900 p-2 rounded-full">
                                <X className="text-white" size={24} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                            {selectedNote?.lyrics && (
                                <View className="mb-8">
                                    <View className="flex-row items-center gap-2 mb-4">
                                        <View className="w-1 h-4 bg-gold rounded-full"></View>
                                        <Text className="text-zinc-400 text-xs font-black uppercase tracking-widest">Lyrics</Text>
                                    </View>
                                    <Text className="text-white font-mono leading-relaxed">{selectedNote.lyrics}</Text>
                                </View>
                            )}

                            {selectedNote?.technical && (
                                <View>
                                    <View className="flex-row items-center gap-2 mb-4">
                                        <View className="w-1 h-4 bg-blue-500 rounded-full"></View>
                                        <Text className="text-zinc-400 text-xs font-black uppercase tracking-widest">Tech Notes</Text>
                                    </View>
                                    <Text className="text-white font-mono leading-relaxed">{selectedNote.technical}</Text>
                                </View>
                            )}

                            {!selectedNote?.lyrics && !selectedNote?.technical && (
                                <Text className="text-zinc-600 italic text-center mt-10">No content available.</Text>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
