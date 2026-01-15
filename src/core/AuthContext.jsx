import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    signInWithPopup
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    serverTimestamp,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState([]); // Artists (for Admin)

    // Listen for Auth Changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Get user role and extra data from Firestore
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setUser({ ...currentUser, ...userSnap.data() });
                } else {
                    // Provide fallback or create doc?
                    setUser(currentUser);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Listen for Artists (For Admin View)
    useEffect(() => {
        // Only run listener if user is Admin? For now run global so we have data.
        // In prod, secure this.
        const q = query(collection(db, "users"), where("role", "==", "ARTIST"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                bookings: [] // We'll fetch bookings separately or nest them? 
                // LocalStorage had nested bookings.
                // Firebase: bookings are separate usually.
            }));

            // Allow joining bookings?
            // For this quick port, let's keep 'bookings' inside user state if possible
            // OR change AdminDashboard to use a 'bookings' state.
            // But AdminDashboard relies on `allUsers[i].bookings`.
            // So we must fetch bookings for each user?
            // To keep it simple: We'll fetch ALL bookings and distribute them to users here.

            setAllUsers(users);
        });
        return () => unsubscribe();
    }, []);

    // Listen for Bookings and Distribute to Users
    useEffect(() => {
        const q = collection(db, "bookings");
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setAllUsers(prevUsers => prevUsers.map(u => ({
                ...u,
                bookings: bookings.filter(b => b.userId === u.id)
            })));

            // Also update current user's bookings if they are logged in
            if (user && bookings) {
                const myBookings = bookings.filter(b => b.userId === user.uid || b.userId === user.id);
                setUser(prev => ({ ...prev, bookings: myBookings }));
            }
        });
        return () => unsubscribe();
    }, [user?.uid]); // dependency on user to restart listener? No, just run once.

    const signup = async (email, password, name) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;

            // Store extra details in Firestore
            await setDoc(doc(db, "users", newUser.uid), {
                name,
                email,
                role: 'ARTIST',
                createdAt: serverTimestamp(),
                wallet: [],
                bounces: []
            });

            // Update Auth Profile
            await updateProfile(newUser, { displayName: name });

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const login = async (email, password) => {
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

    const loginWithProvider = async (providerName) => {
        try {
            let userCredential;
            if (providerName === 'google') {
                userCredential = await signInWithPopup(auth, googleProvider);
            } else {
                return { success: false, error: "Only Google login is supported right now." };
            }

            const newUser = userCredential.user;

            // Allow user to exist if they already signed up manually with same email
            // Just ensure their Firestore doc exists
            const userRef = doc(db, "users", newUser.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    name: newUser.displayName || "Artist",
                    email: newUser.email,
                    role: 'ARTIST',
                    createdAt: serverTimestamp(),
                    wallet: [],
                    bounces: [],
                    bookings: []
                });
            }

            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false, error: error.message };
        }
    };


    const addNewBooking = async (bookingData, userId = null) => {
        try {
            const targetUserId = userId || (user ? user.uid : 'guest'); // Use Guest if no user
            await addDoc(collection(db, "bookings"), {
                ...bookingData,
                userId: targetUserId,
                createdAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error(error);
            return { success: false, error: error.message };
        }
    };

    // Helper functions for Admin
    const updateArtistBooking = async (artistId, bookingId, updates) => {
        try {
            // In Firestore, bookings are their own docs. We just need bookingId.
            // But if bookingId in LocalStorage was a number, formatting might differ.
            // Assuming bookingId is now Firestore ID (string).
            const bookingRef = doc(db, "bookings", bookingId);
            await updateDoc(bookingRef, updates);
        } catch (error) {
            console.error(error);
        }
    };

    const deleteArtistBooking = async (artistId, bookingId) => {
        try {
            await deleteDoc(doc(db, "bookings", bookingId));
        } catch (error) {
            console.error(error);
        }
    };

    const updateArtistBounces = async (artistId, updatedBounces) => {
        // Bounces are stored in User doc
        const userRef = doc(db, "users", artistId);
        await updateDoc(userRef, { bounces: updatedBounces });
    };

    const addArtist = async (artistData) => {
        // Admin creates an artist doc. 
        // NOTE: This user won't have an Auth account unless valid signup.
        // For now, we just create the Firestore doc so they appear in list.
        await addDoc(collection(db, "users"), {
            ...artistData,
            role: 'ARTIST',
            bookings: [],
            bounces: []
        });
    };

    const deleteArtist = async (artistId) => {
        await deleteDoc(doc(db, "users", artistId));
    };

    // Wallet
    const addPaymentMethod = async (cardData) => {
        if (!user) return;
        const newCard = { id: Date.now(), ...cardData };
        const updatedWallet = [...(user.wallet || []), newCard];

        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { wallet: updatedWallet });

        // Optimistic update
        setUser(prev => ({ ...prev, wallet: updatedWallet }));
    };

    const removePaymentMethod = async (cardId) => {
        if (!user) return;
        const updatedWallet = (user.wallet || []).filter(c => c.id !== cardId);

        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { wallet: updatedWallet });

        setUser(prev => ({ ...prev, wallet: updatedWallet }));
    };

    const incrementTrackViews = () => { }; // Todo


    const value = {
        user,
        allUsers: allUsers.filter(u => u.role === 'ARTIST'),
        signup,
        login,
        logout,
        addArtist,
        deleteArtist,
        updateArtistBooking,
        updateArtistBounces,
        deleteArtistBooking,
        loginWithProvider,
        addNewBooking,
        addPaymentMethod,
        removePaymentMethod,
        incrementTrackViews,
        isAuthenticated: !!user,
        isAdmin: user?.email?.includes('admin') || user?.role === 'ADMIN', // Simple Admin Check
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
