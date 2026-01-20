import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, updateDoc } from 'firebase/firestore';
import { useRouter, useSegments } from 'expo-router';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [allBookings, setAllBookings] = useState([]);

    const router = useRouter();
    const segments = useSegments();

    // 1. Auth State Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Listen to User Profile Logic (Simplified for Mobile Initial)
                console.log("AuthContext: User detected", currentUser.email);

                // Real-time listener for user profile
                const userDocRef = doc(db, "users", currentUser.uid);
                const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUser({ ...currentUser, ...docSnap.data() });
                    } else {
                        setUser(currentUser);
                    }
                    setLoading(false);
                    setInitialized(true);
                });

                return () => unsubProfile();

            } else {
                console.log("AuthContext: No user");
                setUser(null);
                setLoading(false);
                setInitialized(true);
            }
        });

        return () => unsubscribe();
    }, []);

    // 2. Navigation Protection
    useEffect(() => {
        if (!initialized) return;

        const inTabsGroup = segments[0] === '(tabs)';

        if (user && !inTabsGroup) {
            // User is logged in but not in the dashboard area -> Redirect to Dashboard
            router.replace('/(tabs)/dashboard');
        } else if (!user && inTabsGroup) {
            // User is NOT logged in but is in the dashboard area -> Redirect to Login
            router.replace('/');
        }
    }, [user, initialized, segments]);

    // 3. Admin Data Listeners (Only if Admin)
    useEffect(() => {
        if (!user) return;

        const isAdmin = user.email?.includes('admin') || user.role === 'ADMIN';
        if (!isAdmin) return;

        // Fetch Users
        const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
            const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setAllUsers(users);
        });

        // Fetch Bookings
        const unsubBookings = onSnapshot(collection(db, "bookings"), (snap) => {
            const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setAllBookings(bookings);
        });

        return () => {
            unsubUsers();
            unsubBookings();
        };
    }, [user]);

    const login = async (email, password) => {
        console.log("Attempting login for:", email);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    const updateUserProfile = async (uid, data) => {
        try {
            const userRef = doc(db, "users", uid);
            await updateDoc(userRef, data);

            // If updating self, update local state immediately for responsiveness
            if (user && user.id === uid) setUser(prev => ({ ...prev, ...data }));

            return { success: true };
        } catch (error) {
            console.error("Profile Update Error:", error);
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        loading,
        allUsers,
        allBookings,
        login,
        logout,
        updateUserProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN' || user?.email?.includes('admin')
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
