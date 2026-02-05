import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, LogIn } from 'lucide-react';
import { useAuth } from '../core/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { isAuthenticated, user, isAdmin } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
                }`}
        >
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <img src="/assets/logo.png" alt="Print Audio Lab" className="h-16 w-auto object-contain" />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm uppercase tracking-widest">Home</Link>
                    <Link to="/studios" className="text-gray-300 hover:text-white transition-colors text-sm uppercase tracking-widest">Studios</Link>
                    <Link to="/beats" className="text-gray-300 hover:text-white transition-colors text-sm uppercase tracking-widest">Marketplace</Link>


                    {isAuthenticated ? (
                        <>
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className="flex items-center gap-2 text-gold hover:text-white transition-colors text-sm uppercase font-bold tracking-widest"
                                >
                                    Admin
                                </Link>
                            )}
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2 text-gray-300 hover:text-gold transition-colors text-sm uppercase tracking-widest"
                            >
                                <User size={16} />
                                Dashboard
                            </Link>
                            <Link to="/book" className="btn-primary">
                                Book Now
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/book" className="btn-primary">
                                Book Now
                            </Link>
                            <Link
                                to="/login"
                                className="flex items-center gap-2 px-6 py-3 border border-gold text-gold hover:bg-gold hover:text-black transition-all rounded-full uppercase tracking-widest text-sm font-bold"
                            >
                                <LogIn size={16} />
                                Login
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-black/95 border-b border-white/10 p-6 flex flex-col space-y-4 shadow-2xl">
                    <Link to="/" onClick={() => setIsOpen(false)} className="text-xl font-display uppercase">Home</Link>
                    <Link to="/studios" onClick={() => setIsOpen(false)} className="text-xl font-display uppercase">Studios</Link>
                    <Link to="/beats" onClick={() => setIsOpen(false)} className="text-xl font-display uppercase">Marketplace</Link>


                    {isAuthenticated ? (
                        <>
                            {isAdmin && (
                                <Link to="/admin" onClick={() => setIsOpen(false)} className="text-xl font-display uppercase text-white hover:text-gold transition-colors">
                                    Admin Panel
                                </Link>
                            )}
                            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-xl font-display uppercase text-gold">
                                Dashboard
                            </Link>
                            <Link to="/book" onClick={() => setIsOpen(false)} className="btn-primary justify-center text-center">
                                Book Session
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/book" onClick={() => setIsOpen(false)} className="btn-primary justify-center text-center">
                                Book Session
                            </Link>
                            <Link to="/login" onClick={() => setIsOpen(false)} className="btn-outline justify-center text-center">
                                Login
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
