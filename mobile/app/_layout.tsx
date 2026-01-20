import { Slot } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { View, StatusBar } from 'react-native';
import "../global.css"; // NativeWind import

export default function RootLayout() {
    return (
        <AuthProvider>
            <View className="flex-1 bg-black">
                <StatusBar barStyle="light-content" />
                <Slot />
            </View>
        </AuthProvider>
    );
}
