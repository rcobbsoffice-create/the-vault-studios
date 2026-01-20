import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Phone, Mail, MoreHorizontal, X, Edit2 } from 'lucide-react-native';

export default function Clients() {
    const { allUsers, updateUserProfile } = useAuth();
    const artists = allUsers.filter(u => u.role === 'ARTIST');

    // Modal State
    const [selectedClient, setSelectedClient] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', phone: '' });
    const [saving, setSaving] = useState(false);

    const handleEditPress = (client) => {
        setSelectedClient(client);
        setEditForm({ name: client.name || '', phone: client.phone || '' });
        setIsModalVisible(true);
    };

    const handleSave = async () => {
        if (!selectedClient) return;
        setSaving(true);
        const res = await updateUserProfile(selectedClient.id, {
            name: editForm.name,
            phone: editForm.phone
        });
        setSaving(false);

        if (res.success) {
            setIsModalVisible(false);
            setSelectedClient(null);
        } else {
            Alert.alert("Error", res.error);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleEditPress(item)}
            className="flex-row items-center justify-between py-4 border-b border-zinc-900 active:bg-zinc-900/50"
        >
            <View className="flex-row items-center gap-4 flex-1">
                <View className="w-10 h-10 rounded-full bg-zinc-900 items-center justify-center border border-white/10">
                    <Text className="text-zinc-500 font-bold">{item.name?.[0] || '?'}</Text>
                </View>
                <View className="flex-1">
                    <Text className="text-white font-bold text-sm tracking-tight">{item.name}</Text>
                    <Text className="text-zinc-600 text-xs">{item.email}</Text>
                </View>
            </View>

            <Edit2 size={16} className="text-zinc-700" />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-black p-6 pt-16">
            <Text className="text-white text-2xl font-black uppercase tracking-tighter mb-2">Clients</Text>
            <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-8">Management & Directory</Text>

            <FlatList
                data={artists}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            />

            {/* Edit Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View className="flex-1 bg-black/80 justify-end">
                    <View className="bg-zinc-950 rounded-t-[2.5rem] border-t border-white/10 p-8 pb-12">
                        <View className="flex-row justify-between items-center mb-8">
                            <Text className="text-white text-xl font-black uppercase tracking-wider">Edit Client</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <X className="text-white" size={24} />
                            </TouchableOpacity>
                        </View>

                        <View className="space-y-6 gap-6">
                            <View>
                                <Text className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-2">Display Name</Text>
                                <TextInput
                                    value={editForm.name}
                                    onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                                    className="bg-black border border-zinc-800 rounded-xl p-4 text-white font-bold focus:border-gold"
                                    placeholder="Client Name"
                                    placeholderTextColor="#333"
                                />
                            </View>

                            <View>
                                <Text className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-2">Phone Number</Text>
                                <TextInput
                                    value={editForm.phone}
                                    onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                                    className="bg-black border border-zinc-800 rounded-xl p-4 text-white font-bold focus:border-gold"
                                    placeholder="+1 (555) 000-0000"
                                    placeholderTextColor="#333"
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={saving}
                                className="bg-gold w-full p-4 rounded-xl items-center mt-4 active:scale-95 transition-transform"
                            >
                                {saving ? <ActivityIndicator color="black" /> : <Text className="text-black font-black uppercase tracking-widest">Save Changes</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
