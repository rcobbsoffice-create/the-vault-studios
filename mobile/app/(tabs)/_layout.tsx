import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { LayoutDashboard, Calendar, Users, DollarSign } from 'lucide-react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#09090b', // Zinc-950
                    borderTopColor: '#27272a', // Zinc-800
                    height: 85,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: '#D4AF37', // Gold
                tabBarInactiveTintColor: '#52525b', // Zinc-600
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: 'bold',
                    marginBottom: 10,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                }
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Overview',
                    tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="schedule" // We'll create this later placeholder
                options={{
                    title: 'Schedule',
                    tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="clients" // Placeholder
                options={{
                    title: 'Clients',
                    tabBarIcon: ({ color }) => <Users size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
