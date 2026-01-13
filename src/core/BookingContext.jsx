import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [selectedStudio, setSelectedStudio] = useState(null);

    const addToCart = (studio, date, time, duration) => {
        setCart([...cart, { studio, date, time, duration, price: 65 * duration }]);
    };

    const clearCart = () => setCart([]);

    return (
        <BookingContext.Provider value={{ cart, addToCart, clearCart, selectedStudio, setSelectedStudio }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => useContext(BookingContext);
