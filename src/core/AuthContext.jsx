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
    deleteDoc,
    arrayUnion
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL
} from 'firebase/storage';
import { storage } from '../firebase';

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
    const [artists, setArtists] = useState([]); // Raw Artist List
    const [adminBookings, setAdminBookings] = useState([]); // All Bookings (for Admin)

    // Listen for Auth Changes & Real-time User Profile
    useEffect(() => {
        let profileUnsubscribe;

        const authUnsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            // Clean up previous profile listener if any
            if (profileUnsubscribe) {
                profileUnsubscribe();
                profileUnsubscribe = null;
            }

            if (currentUser) {
                // 1. Set basic auth user first
                // setUser({ ...currentUser }); // Optional, but let's wait for profile

                // 2. Set up real-time listener for the Firestore User Document
                const userRef = doc(db, "users", currentUser.uid);

                profileUnsubscribe = onSnapshot(userRef, async (docSnap) => {
                    if (docSnap.exists()) {
                        const profileData = docSnap.data();
                        // Merge auth object with firestore data
                        setUser({
                            ...currentUser,
                            ...profileData,
                            id: currentUser.uid // Ensure ID is accessible
                        });
                    } else {
                        // Doc doesn't exist yet
                        console.log("AuthContext: Profile missing for " + currentUser.email);

                        // AUTO-SEED ADMIN
                        if (currentUser.email === 'admin@printlab.com') {
                            console.log("AuthContext: seeding Admin profile...");
                            try {
                                await setDoc(userRef, {
                                    name: 'Master Admin',
                                    email: currentUser.email,
                                    role: 'ADMIN',
                                    createdAt: serverTimestamp(),
                                    wallet: [],
                                    bounces: [],
                                    bookings: []
                                });
                                console.log("AuthContext: Admin seeded.");
                                // The snapshot will fire again automatically
                                return;
                            } catch (err) {
                                console.error("AuthContext: Seeding failed", err);
                            }
                        }

                        setUser({ ...currentUser, id: currentUser.uid });
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error listening to user profile:", error);
                    setLoading(false);
                });

            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            authUnsubscribe();
            if (profileUnsubscribe) profileUnsubscribe();
        };
    }, []);

    // Listen for Artists (For Admin View)
    useEffect(() => {
        if (!user) {
            setArtists([]);
            return;
        }

        const q = query(collection(db, "users"), where("role", "==", "ARTIST"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setArtists(users);
        }, (error) => {
            console.log("Error fetching users:", error);
        });
        return () => unsubscribe();
    }, [user]);

    // Listen for Bookings (Scoped by Role)
    useEffect(() => {
        if (!user) return;

        let q;
        const isAdmin = user.email?.includes('admin@printlab.com') || user.role === 'ADMIN';

        if (isAdmin) {
            // Admin sees all bookings
            q = collection(db, "bookings");
        } else {
            // Regular users only see their own bookings
            q = query(collection(db, "bookings"), where("userId", "==", user.uid));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (isAdmin) {
                // Store all bookings separately for Admin
                setAdminBookings(bookings);

                // Admin's own bookings
                const myBookings = bookings.filter(b => b.userId === user.uid);
                setUser(prev => prev ? ({ ...prev, bookings: myBookings }) : prev);

            } else {
                // Regular User - store directly in user object
                setUser(prev => prev ? ({ ...prev, bookings: bookings }) : prev);
            }

        }, (error) => {
            console.log("Error fetching bookings:", error);
            // If permission denied, it might be because the rule requires matches. 
        });

        return () => unsubscribe();
    }, [user?.uid, user?.role]); // Re-run if user ID or Role changes

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

    const uploadBounce = async (artistId, file, metadata) => {
        try {
            // 1. Upload File
            const storageRef = ref(storage, `bounces/${artistId}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // 2. Create Metadata Object
            const newBounce = {
                id: Date.now(),
                title: metadata.title,
                sessionName: metadata.sessionName,
                date: metadata.date,
                type: metadata.type || 'Demo', // Default to Demo
                url: downloadURL,
                fileName: file.name,
                uploadedAt: new Date().toISOString()
            };

            // 3. Update Firestore (using arrayUnion for atomicity)
            const userRef = doc(db, "users", artistId);
            await updateDoc(userRef, {
                bounces: arrayUnion(newBounce)
            });

            return { success: true };
        } catch (error) {
            console.error("Upload error:", error);
            return { success: false, error: error.message };
        }
    };

    const addArtist = async (artistData) => {
        // Create a secondary app to create the user without logging out the admin
        try {
            const { initializeApp, getApp, deleteApp } = await import("firebase/app");
            const { getAuth: getSecondaryAuth, createUserWithEmailAndPassword: createSecondaryUser, updateProfile: updateSecondaryProfile, signOut: signOutSecondary } = await import("firebase/auth");
            const { firebaseConfig } = await import('../firebase');

            // Initialize secondary app
            const SECONDARY_APP_NAME = "secondaryApp";
            let secondaryApp;
            try {
                secondaryApp = getApp(SECONDARY_APP_NAME);
            } catch (e) {
                secondaryApp = initializeApp(firebaseConfig, SECONDARY_APP_NAME);
            }

            const secondaryAuth = getSecondaryAuth(secondaryApp);

            // Create User in Auth
            const userCredential = await createSecondaryUser(secondaryAuth, artistData.email, artistData.password);
            const newUser = userCredential.user;

            // Update Profile (Display Name)
            await updateSecondaryProfile(newUser, { displayName: artistData.name });

            // Create Firestore Doc (Using the UID from Auth)
            await setDoc(doc(db, "users", newUser.uid), {
                name: artistData.name,
                email: artistData.email,
                phone: artistData.phone || "",
                role: 'ARTIST',
                createdAt: serverTimestamp(),
                bookings: [],
                bounces: [],
                wallet: []
            });

            // Cleanup
            await signOutSecondary(secondaryAuth);
            // We usually don't need to delete the app immediately if we might reuse it, 
            // but for safety in this context:
            await deleteApp(secondaryApp);

            return { success: true };
        } catch (error) {
            console.error("Error adding artist:", error);
            return { success: false, error: error.message };
        }
    };

    // --- SMS / Notification System ---
    // --- SMS / Notification System ---
    const sendSMS = async (to, body) => {
        const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
        const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
        const fromNumber = import.meta.env.VITE_TWILIO_FROM_NUMBER;

        console.log(`[SMS SYSTEM] Initiating Send... To: ${to}`);

        if (!to) return { success: false, error: "No phone number provided" };
        if (!accountSid || !authToken) return { success: false, error: "Twilio credentials missing" };

        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

        // Encode payload for x-www-form-urlencoded
        const formData = new URLSearchParams();
        formData.append('To', to);
        formData.append('From', fromNumber);
        formData.append('Body', body);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Twilio Error:", data);
                return { success: false, error: data.message || "Failed to send SMS" };
            }

            console.log("SMS Sent Successfully:", data);
            return { success: true, sid: data.sid };

        } catch (error) {
            console.error("SMS Network Error:", error);
            // Fallback for CORS: warn user
            return { success: false, error: "CORS/Network Error (Browser blocked it)" };
        }
    };

    const updateUserProfile = async (uid, data) => {
        try {
            const userRef = doc(db, "users", uid);
            await updateDoc(userRef, data);
            if (user && user.id === uid) setUser(prev => ({ ...prev, ...data }));
            return { success: true };
        } catch (error) {
            console.error("Profile Update Error:", error);
            return { success: false, error: error.message };
        }
    };

    const updateUserPreferences = async (uid, prefs) => {
        try {
            const userRef = doc(db, "users", uid);
            await updateDoc(userRef, { preferences: prefs });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
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


    // Merge Artists and Bookings for Admin View
    const derivedAllUsers = artists.map(artist => ({
        ...artist,
        bookings: adminBookings.filter(b => b.userId === artist.id)
    }));

    const value = {
        user,
        allUsers: derivedAllUsers,
        allBookings: adminBookings,
        signup,
        login,
        logout,
        addArtist,
        deleteArtist,
        updateArtistBooking,
        updateArtistBounces,
        uploadBounce,
        deleteArtistBooking,
        loginWithProvider,
        addNewBooking,
        addPaymentMethod,
        removePaymentMethod,
        incrementTrackViews,
        updateUserProfile,
        updateUserPreferences,
        sendSMS,
        isAuthenticated: !!user,
        isAdmin: user?.email?.includes('admin') || user?.role === 'ADMIN', // Simple Admin Check
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
