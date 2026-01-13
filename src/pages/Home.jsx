import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, Music, Clock, MapPin, ArrowRight } from 'lucide-react';
import Showcase from '../components/Showcase';

const Home = () => {
    return (
        <div className="bg-black min-h-screen">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background Overlay */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                    <img
                        src="/assets/hero.png"
                        alt="Studio Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                </div>

                <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
                    <h2 className="text-gold text-lg md:text-xl uppercase tracking-[0.5em] mb-4 animate-fade-in-up">
                        Norfolk, Virginia
                    </h2>
                    <h1 className="text-6xl md:text-8xl font-display font-bold mb-6 leading-tight animate-fade-in-up delay-100">
                        THE VAULT <br /> STUDIOS
                    </h1>
                    <p className="text-gray-300 text-xl md:text-2xl mb-10 max-w-2xl mx-auto font-light animate-fade-in-up delay-200">
                        Premium sound. Industrial aesthetic. Unmatched vibe.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-fade-in-up delay-300">
                        <Link to="/book" className="btn-primary text-lg px-8 py-4">
                            Book Session
                        </Link>
                        <button className="btn-outline text-lg px-8 py-4 flex items-center gap-2 group">
                            <Mic className="group-hover:text-white transition-colors" />
                            <span>Talk to AI Receptionist</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Visual Showcase Section */}
            <Showcase />

            {/* Quick Info Grid */}
            <section className="py-20 bg-zinc-950">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-8 border border-white/5 rounded-2xl hover:border-gold/30 transition-colors duration-300">
                        <div className="bg-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
                            <Music size={32} />
                        </div>
                        <h3 className="text-2xl font-display mb-4">3 Premium Rooms</h3>
                        <p className="text-gray-400">
                            Each studio is acoustically treated and equipped with industry-standard gear for tracking, mixing, and mastering.
                        </p>
                    </div>

                    <div className="p-8 border border-white/5 rounded-2xl hover:border-gold/30 transition-colors duration-300">
                        <div className="bg-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
                            <Clock size={32} />
                        </div>
                        <h3 className="text-2xl font-display mb-4">Rates from $65/hr</h3>
                        <p className="text-gray-400">
                            Professional quality shouldn't break the bank. Flexible booking options available 24/7.
                        </p>
                    </div>

                    <div className="p-8 border border-white/5 rounded-2xl hover:border-gold/30 transition-colors duration-300">
                        <div className="bg-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
                            <MapPin size={32} />
                        </div>
                        <h3 className="text-2xl font-display mb-4">Prime Location</h3>
                        <p className="text-gray-400">
                            Located in the heart of Norfolk, VA. Secure parking and private entrance for all clients.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 relative border-t border-white/10">
                <div className="container mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">READY TO CREATE?</h2>
                    <Link to="/book" className="inline-flex items-center gap-2 text-gold text-xl hover:text-white transition-colors group">
                        Check Availability <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
