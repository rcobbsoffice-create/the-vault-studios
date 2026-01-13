import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Demo users with roles and mock data
const DEMO_USERS = [
    {
        id: 1,
        name: "Marcus Johnson",
        email: "artist@demo.com",
        password: "demo123",
        role: "ARTIST",
        bookings: [
            {
                id: 1,
                studio: "Studio A (The Vault)",
                date: "2026-01-15",
                time: "14:00",
                duration: 3,
                price: 255,
                status: "Confirmed"
            }
        ],
        bounces: [
            {
                id: 101,
                title: "Vocal Layering Session 1",
                date: "2026-01-10",
                sessionName: "Midnight Sessions",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // Demo audio
            },
            {
                id: 102,
                title: "Main Hook - Rough Mix",
                date: "2026-01-10",
                sessionName: "Midnight Sessions",
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
            }
        ]
    },
    {
        id: 2,
        role: "ADMIN",
        name: "The Vault Admin",
        email: "admin@thevault.com",
        password: "vaultadmin123"
    }
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState(DEMO_USERS); // Track all users for admin management

    // Check for existing session on mount
    useEffect(() => {
        const storedAllUsers = localStorage.getItem('vaultStudiosAllUsers');
        let currentAllUsers = DEMO_USERS;

        if (storedAllUsers) {
            try {
                const parsedUsers = JSON.parse(storedAllUsers);

                if (Array.isArray(parsedUsers)) {
                    // FAIL-SAFE: If the user's localStorage is missing the Admin or new demo users, 
                    // we merge them in so new features show up for everyone.
                    const missingUsers = DEMO_USERS.filter(du => !parsedUsers.find(pu => pu.id === du.id));
                    if (missingUsers.length > 0) {
                        currentAllUsers = [...parsedUsers, ...missingUsers];
                        localStorage.setItem('vaultStudiosAllUsers', JSON.stringify(currentAllUsers));
                    } else {
                        currentAllUsers = parsedUsers;
                    }
                }
                setAllUsers(currentAllUsers);
            } catch (e) {
                console.error('Error parsing all users:', e);
            }
        } else {
            localStorage.setItem('vaultStudiosAllUsers', JSON.stringify(DEMO_USERS));
        }

        const storedUser = localStorage.getItem('vaultStudiosUser');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                // Sync session user with master list for latest data (bounces, bookings)
                const latestUser = currentAllUsers.find(u => u.id === userData.id);
                if (latestUser) {
                    const { password: _, ...userWithoutPassword } = latestUser;
                    setUser(userWithoutPassword);
                    localStorage.setItem('vaultStudiosUser', JSON.stringify(userWithoutPassword));
                } else {
                    setUser(userData);
                }
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('vaultStudiosUser');
            }
        }

        setLoading(false);
    }, []);

    const login = (email, password) => {
        const foundUser = allUsers.find(
            u => u.email === email && u.password === password
        );

        if (foundUser) {
            const { password: _, ...userWithoutPassword } = foundUser;
            setUser(userWithoutPassword);
            localStorage.setItem('vaultStudiosUser', JSON.stringify(userWithoutPassword));
            return { success: true };
        }
        return { success: false, error: 'Invalid email or password' };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('vaultStudiosUser');
    };

    // Admin function to update artist bookings (status, price, etc.)
    const updateArtistBooking = (artistId, bookingId, updates) => {
        setAllUsers(prevUsers => {
            const updatedUsers = prevUsers.map(u => {
                if (u.id === artistId) {
                    const updatedBookings = u.bookings.map(b =>
                        b.id === bookingId ? { ...b, ...updates } : b
                    );
                    const updatedUser = { ...u, bookings: updatedBookings };

                    // If this is the current logged in user, update their state too
                    if (user && user.id === artistId) {
                        setUser(updatedUser);
                        localStorage.setItem('vaultStudiosUser', JSON.stringify(updatedUser));
                    }

                    return updatedUser;
                }
                return u;
            });
            localStorage.setItem('vaultStudiosAllUsers', JSON.stringify(updatedUsers));
            return updatedUsers;
        });
    };

    // Admin function to update artist bounces
    const updateArtistBounces = (artistId, updatedBounces) => {
        setAllUsers(prevUsers => {
            const updatedUsers = prevUsers.map(u => {
                if (u.id === artistId) {
                    const updatedUser = { ...u, bounces: updatedBounces };

                    // If the updated user is the current user, update them too
                    if (user && user.id === artistId) {
                        setUser(updatedUser);
                        localStorage.setItem('vaultStudiosUser', JSON.stringify(updatedUser));
                    }

                    return updatedUser;
                }
                return u;
            });
            localStorage.setItem('vaultStudiosAllUsers', JSON.stringify(updatedUsers));
            return updatedUsers;
        });
    };

    // Mock social login
    const loginWithProvider = (provider) => {
        // Simulate a delay
        return new Promise((resolve) => {
            setTimeout(() => {
                // For demo purposes, we'll log in as the first artist
                const artist = DEMO_USERS.find(u => u.role === 'ARTIST');
                if (artist) {
                    const { password: _, ...userWithoutPassword } = artist;
                    setUser(userWithoutPassword);
                    localStorage.setItem('vaultStudiosUser', JSON.stringify(userWithoutPassword));
                    resolve({ success: true });
                } else {
                    resolve({ success: false, error: 'Demo artist not found' });
                }
            }, 1500);
        });
    };

    // Admin function to delete a booking
    const deleteArtistBooking = (artistId, bookingId) => {
        setAllUsers(prevUsers => {
            const updatedUsers = prevUsers.map(u => {
                if (u.id === artistId) {
                    const updatedBookings = (u.bookings || []).filter(b => b.id !== bookingId);
                    const updatedUser = { ...u, bookings: updatedBookings };

                    // If this is the current logged in user, update their state too
                    if (user && user.id === artistId) {
                        setUser(updatedUser);
                        localStorage.setItem('vaultStudiosUser', JSON.stringify(updatedUser));
                    }

                    return updatedUser;
                }
                return u;
            });
            localStorage.setItem('vaultStudiosAllUsers', JSON.stringify(updatedUsers));
            return updatedUsers;
        });
    };

    // Increment view count for a track
    const incrementTrackViews = (artistId, bounceId) => {
        setAllUsers(prevUsers => {
            const updatedUsers = prevUsers.map(u => {
                if (u.id === artistId) {
                    const updatedBounces = (u.bounces || []).map(b =>
                        b.id === bounceId ? { ...b, viewCount: (b.viewCount || 0) + 1 } : b
                    );
                    const updatedUser = { ...u, bounces: updatedBounces };

                    if (user && user.id === artistId) {
                        setUser(updatedUser);
                        localStorage.setItem('vaultStudiosUser', JSON.stringify(updatedUser));
                    }

                    return updatedUser;
                }
                return u;
            });
            localStorage.setItem('vaultStudiosAllUsers', JSON.stringify(updatedUsers));
            return updatedUsers;
        });
    };

    // Admin function to add a new artist
    const addArtist = (artistData) => {
        setAllUsers(prevUsers => {
            const newArtist = {
                id: Date.now(),
                ...artistData,
                role: 'ARTIST',
                bookings: [],
                bounces: []
            };
            const updatedUsers = [...prevUsers, newArtist];
            localStorage.setItem('vaultStudiosAllUsers', JSON.stringify(updatedUsers));
            return updatedUsers;
        });
    };

    // Admin function to delete an artist
    const deleteArtist = (artistId) => {
        setAllUsers(prevUsers => {
            const updatedUsers = prevUsers.filter(u => u.id !== artistId);
            localStorage.setItem('vaultStudiosAllUsers', JSON.stringify(updatedUsers));
            return updatedUsers;
        });
    };

    const value = {
        user,
        allUsers: allUsers.filter(u => u.role === 'ARTIST'),
        login,
        logout,
        addArtist,
        deleteArtist,
        updateArtistBooking,
        updateArtistBounces,
        deleteArtistBooking,
        loginWithProvider,
        incrementTrackViews,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
