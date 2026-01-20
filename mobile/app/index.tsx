import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        const res = await login(email, password);
        if (!res.success) {
            setError(res.error);
        }
        setLoading(false);
    };

    return (
        <View className="flex-1 bg-black items-center justify-center p-8">
            <View className="items-center mb-12">
                <View className="w-16 h-16 bg-gold rounded-full items-center justify-center mb-4">
                    <Text className="text-black font-black text-2xl">V</Text>
                </View>
                <Text className="text-white text-3xl font-bold tracking-tighter uppercase">The Vault</Text>
                <Text className="text-zinc-500 text-xs font-bold tracking-[0.3em] uppercase mt-2">Mobile Admin</Text>
            </View>

            {error ? <Text className="text-red-500 font-bold mb-4">{error}</Text> : null}

            <View className="w-full space-y-4 gap-4">
                <View>
                    <Text className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest mb-2">Email</Text>
                    <TextInput
                        className="bg-zinc-900 text-white p-4 rounded-xl border border-zinc-800 focus:border-gold"
                        placeholder="admin@example.com"
                        placeholderTextColor="#555"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View>
                    <Text className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest mb-2">Password</Text>
                    <TextInput
                        className="bg-zinc-900 text-white p-4 rounded-xl border border-zinc-800 focus:border-gold"
                        placeholder="••••••••"
                        placeholderTextColor="#555"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading}
                    className="bg-gold w-full p-4 rounded-xl items-center mt-4 active:opacity-90"
                >
                    {loading ? <ActivityIndicator color="black" /> : <Text className="text-black font-black uppercase tracking-widest">Access System</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}
