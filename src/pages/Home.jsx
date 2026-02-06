import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, Music, Clock, MapPin, ArrowRight, User, FileText, Sparkles, Heart, Calendar, Shield } from 'lucide-react';

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
                        PRINT AUDIO LAB
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

            {/* About Us Section */}
            <section className="py-24 bg-black relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gold/5 via-transparent to-gold/5" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                        {/* Image Side */}
                        <div className="relative">
                            <div className="aspect-square rounded-3xl overflow-hidden border border-white/10">
                                <img 
                                    src="/assets/hero.png" 
                                    alt="Print Audio Lab Studio" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Floating accent */}
                            <div className="absolute -bottom-4 -right-4 bg-gold text-black px-6 py-3 rounded-2xl font-display font-bold text-lg">
                                Est. 2024
                            </div>
                        </div>

                        {/* Content Side */}
                        <div>
                            <span className="text-gold text-sm uppercase tracking-[0.3em] font-bold">About Us</span>
                            <h2 className="text-4xl md:text-5xl font-display font-bold mt-3 mb-6">
                                More Than a Studio.<br />
                                <span className="text-gold">A Creative Home.</span>
                            </h2>
                            <div className="space-y-4 text-gray-400 leading-relaxed">
                                <p>
                                    Print Audio Lab was born from a simple vision: give artists a professional space 
                                    where creativity flows freely without breaking the bank. Located in the heart of 
                                    Norfolk, Virginia, we've built a studio that combines industrial aesthetics with 
                                    premium sound quality.
                                </p>
                                <p>
                                    Whether you're recording your first demo or finishing your next album, our 
                                    acoustically-treated rooms and industry-standard equipment are designed to 
                                    capture your sound exactly the way you hear it.
                                </p>
                                <p>
                                    We're not just renting you a room—we're partnering with you to bring your 
                                    vision to life. From flexible booking to AI-powered tools, everything we 
                                    build is made to help you create.
                                </p>
                            </div>
                            <div className="mt-8 flex flex-wrap gap-6">
                                <div>
                                    <div className="text-3xl font-display font-bold text-gold">500+</div>
                                    <div className="text-sm text-gray-500">Sessions Booked</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-display font-bold text-gold">100+</div>
                                    <div className="text-sm text-gray-500">Happy Artists</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-display font-bold text-gold">2</div>
                                    <div className="text-sm text-gray-500">Premium Rooms</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How to Get Started */}
            <section className="py-20 bg-zinc-950 border-b border-white/5">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-gold text-sm uppercase tracking-[0.3em] font-bold">Simple Process</span>
                        <h2 className="text-3xl md:text-4xl font-display font-bold mt-3">
                            How to Get Started
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                        {/* Step 1 */}
                        <div className="text-center relative">
                            <div className="bg-gold text-black w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-display font-bold">
                                1
                            </div>
                            <h3 className="font-display font-bold text-lg mb-2">Choose Your Studio</h3>
                            <p className="text-gray-500 text-sm">
                                Browse our premium rooms and pick the vibe that fits your project.
                            </p>
                            {/* Connector line (hidden on mobile) */}
                            <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gold/50 to-transparent" />
                        </div>

                        {/* Step 2 */}
                        <div className="text-center relative">
                            <div className="bg-gold text-black w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-display font-bold">
                                2
                            </div>
                            <h3 className="font-display font-bold text-lg mb-2">Pick Your Date & Time</h3>
                            <p className="text-gray-500 text-sm">
                                Select from available slots that work with your schedule.
                            </p>
                            <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gold/50 to-transparent" />
                        </div>

                        {/* Step 3 */}
                        <div className="text-center relative">
                            <div className="bg-gold text-black w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-display font-bold">
                                3
                            </div>
                            <h3 className="font-display font-bold text-lg mb-2">Pay Your Deposit</h3>
                            <p className="text-gray-500 text-sm">
                                Secure your session with a 50% deposit. Pay the rest when you arrive.
                            </p>
                            <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gold/50 to-transparent" />
                        </div>

                        {/* Step 4 */}
                        <div className="text-center">
                            <div className="bg-gold text-black w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-display font-bold">
                                4
                            </div>
                            <h3 className="font-display font-bold text-lg mb-2">Show Up & Create</h3>
                            <p className="text-gray-500 text-sm">
                                Arrive at the studio, meet your engineer, and start making magic.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Member Benefits Section */}
            <section className="py-24 bg-black relative overflow-hidden">
                {/* Background accent */}
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/5 blur-[120px] rounded-full" />
                
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-gold text-sm uppercase tracking-[0.3em] font-bold">Member Perks</span>
                        <h2 className="text-4xl md:text-5xl font-display font-bold mt-4 mb-4">
                            Why Create an Account?
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Unlock powerful tools and exclusive features when you sign up with Print Audio Lab.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {/* Feature 1 */}
                        <div className="group bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-gold/30 hover:bg-zinc-900/80 transition-all duration-300">
                            <div className="bg-gold/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-gold group-hover:bg-gold group-hover:text-black transition-all">
                                <User size={24} />
                            </div>
                            <h3 className="text-xl font-display font-bold mb-2">Personal Dashboard</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Track all your bookings, view session history, and manage your account from one central hub.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-gold/30 hover:bg-zinc-900/80 transition-all duration-300">
                            <div className="bg-gold/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-gold group-hover:bg-gold group-hover:text-black transition-all">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-xl font-display font-bold mb-2">Session Notes & Lyrics</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Write and save lyrics, technical notes, and session details all in one place. Never lose your ideas.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-gold/30 hover:bg-zinc-900/80 transition-all duration-300">
                            <div className="bg-gold/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-gold group-hover:bg-gold group-hover:text-black transition-all">
                                <Sparkles size={24} />
                            </div>
                            <h3 className="text-xl font-display font-bold mb-2">AI Lyric Writer</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Stuck on a verse? Let our AI help generate hooks, rhymes, and song ideas tailored to your vibe.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="group bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-gold/30 hover:bg-zinc-900/80 transition-all duration-300">
                            <div className="bg-gold/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-gold group-hover:bg-gold group-hover:text-black transition-all">
                                <Heart size={24} />
                            </div>
                            <h3 className="text-xl font-display font-bold mb-2">Beat Favorites & Licensing</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Browse our beat catalog, save your favorites, and license tracks directly from your dashboard.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="group bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-gold/30 hover:bg-zinc-900/80 transition-all duration-300">
                            <div className="bg-gold/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-gold group-hover:bg-gold group-hover:text-black transition-all">
                                <Calendar size={24} />
                            </div>
                            <h3 className="text-xl font-display font-bold mb-2">Easy Rebooking</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Quickly rebook your favorite studio and time slot with just a few clicks. No forms to fill out again.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="group bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-gold/30 hover:bg-zinc-900/80 transition-all duration-300">
                            <div className="bg-gold/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-gold group-hover:bg-gold group-hover:text-black transition-all">
                                <Shield size={24} />
                            </div>
                            <h3 className="text-xl font-display font-bold mb-2">Secure Payments</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Pay deposits and session fees securely through Stripe. Your payment info is always protected.
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <Link 
                            to="/login" 
                            className="inline-flex items-center gap-3 bg-gold text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-transform"
                        >
                            Create Free Account
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Quick Info Grid */}
            <section className="py-20 bg-zinc-950">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-8 border border-white/5 rounded-2xl hover:border-gold/30 transition-colors duration-300">
                        <div className="bg-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
                            <Music size={32} />
                        </div>
                        <h3 className="text-2xl font-display mb-4">2 Premium Rooms</h3>
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
