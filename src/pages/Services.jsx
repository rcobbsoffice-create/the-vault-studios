import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ExternalLink, CheckCircle, Star, Zap, Shield, ArrowRight, Music } from 'lucide-react';

const pressReleasePackages = [
    {
        id: 'cali-post',
        name: 'Cali Post',
        price: 150,
        description: 'Regional California music news outlet with strong local reach.',
        features: ['Free Press Release Article', 'SEO Optimized', 'Backlinks Included', '3-5 Day Turnaround'],
        tier: 'starter'
    },
    {
        id: 'elite-music-news',
        name: 'Elite Music News',
        price: 175,
        description: 'Popular music news platform for emerging artists.',
        features: ['Free Press Release Article', 'SEO Optimized', 'Backlinks Included', 'Social Sharing'],
        tier: 'starter'
    },
    {
        id: 'artist-weekly',
        name: 'Artist Weekly',
        price: 275,
        description: 'Industry publication covering rising talent and new releases.',
        features: ['Free Press Release Article', 'SEO Optimized', 'Backlinks Included', 'Featured Placement'],
        tier: 'popular',
        popular: true
    },
    {
        id: 'music-emu',
        name: 'Music EMU',
        price: 300,
        description: 'Blog placement with engaged music community audience.',
        features: ['Free Press Release Article', 'SEO Optimized', 'Backlinks Included', 'Community Exposure'],
        tier: 'popular'
    },
    {
        id: 'all-hip-hop',
        name: 'All Hip Hop',
        price: 350,
        description: 'Major hip hop media outlet with massive audience reach.',
        features: ['Free Press Release Article', 'SEO Optimized', 'Backlinks Included', 'High Traffic Exposure'],
        tier: 'popular'
    },
    {
        id: 'bust',
        name: 'Bust Magazine',
        price: 850,
        description: 'Premium lifestyle and culture publication.',
        features: ['Free Press Release Article', 'SEO Optimized', 'Premium Backlinks', 'Editorial Review'],
        tier: 'premium'
    },
    {
        id: 'c-heads',
        name: 'C-Heads Magazine',
        price: 950,
        description: 'High-end arts and culture publication with global reach.',
        features: ['Free Press Release Article', 'SEO Optimized', 'Premium Backlinks', 'International Audience'],
        tier: 'premium'
    },
    {
        id: 'flaunt',
        name: 'Flaunt Magazine',
        price: 950,
        description: 'Premier fashion and music culture publication.',
        features: ['Free Press Release Article', 'SEO Optimized', 'Premium Backlinks', 'Celebrity Adjacent'],
        tier: 'premium'
    },
    {
        id: 'spin',
        name: 'Spin Magazine',
        price: 975,
        description: 'Legendary music publication with decades of industry influence.',
        features: ['Free Press Release Article', 'SEO Optimized', 'Premium Backlinks', 'Industry Recognition'],
        tier: 'premium'
    }
];

const addOns = [
    { name: 'EPK Design', price: 250, description: 'Professional Electronic Press Kit' },
    { name: 'Social Media Branding', price: 250, description: 'Cohesive visual identity package' },
    { name: 'Artist Biography', price: 129, description: 'Professionally written bio' },
    { name: 'Artwork Design', price: 95, description: 'Custom promotional artwork' }
];

const websiteDesignPackages = [
    {
        id: 'website-starter',
        name: 'Starter Website',
        price: 499,
        description: 'Perfect for new artists who need a professional online presence quickly.',
        features: [
            'Single Page Design',
            'Mobile Responsive',
            'Music Player Integration',
            'Social Media Links',
            'Contact Form',
            '1 Revision Round',
            '7-Day Delivery'
        ],
        tier: 'starter'
    },
    {
        id: 'website-pro',
        name: 'Pro Website',
        price: 999,
        description: 'Full-featured artist website with all the essentials for serious musicians.',
        features: [
            'Up to 5 Pages',
            'Custom Design',
            'EPK Integration',
            'Music/Video Gallery',
            'Tour Dates Section',
            'Mailing List Signup',
            'SEO Optimization',
            '3 Revision Rounds',
            '14-Day Delivery'
        ],
        tier: 'popular',
        popular: true
    },
    {
        id: 'website-enterprise',
        name: 'Enterprise Website',
        price: 2499,
        description: 'Premium custom website for established artists and labels with advanced features.',
        features: [
            'Unlimited Pages',
            'Custom Branding & Design',
            'E-Commerce/Merch Store',
            'Streaming Integration',
            'Blog/News Section',
            'Fan Club Features',
            'Advanced Analytics',
            'Priority Support',
            'Unlimited Revisions',
            '21-Day Delivery'
        ],
        tier: 'premium'
    }
];

const Services = () => {
    const [filter, setFilter] = useState('all');

    const filteredPackages = filter === 'all' 
        ? pressReleasePackages 
        : pressReleasePackages.filter(pkg => pkg.tier === filter);

    return (
        <div className="bg-black min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-gold text-sm uppercase tracking-[0.3em] font-bold">Services</span>
                    <h1 className="text-4xl md:text-6xl font-display font-bold mt-4 mb-6">
                        Press Release Services
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Get your music featured on major publications. Every package includes a professionally 
                        written press release, SEO optimization, and guaranteed placement or your money back.
                    </p>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center gap-8 mb-16">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Shield className="text-gold" size={20} />
                        <span className="text-sm">100% Money Back Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                        <Zap className="text-gold" size={20} />
                        <span className="text-sm">Pay Per Placement</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                        <Newspaper className="text-gold" size={20} />
                        <span className="text-sm">Free Press Release Included</span>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex justify-center gap-2 mb-12">
                    {['all', 'starter', 'popular', 'premium'].map((tier) => (
                        <button
                            key={tier}
                            onClick={() => setFilter(tier)}
                            className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-all ${
                                filter === tier 
                                    ? 'bg-gold text-black' 
                                    : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800 hover:text-white'
                            }`}
                        >
                            {tier === 'all' ? 'All Packages' : tier}
                        </button>
                    ))}
                </div>

                {/* Packages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                    {filteredPackages.map((pkg) => (
                        <div 
                            key={pkg.id}
                            className={`relative bg-zinc-900/50 border rounded-2xl p-6 hover:border-gold/50 transition-all duration-300 ${
                                pkg.popular ? 'border-gold/30' : 'border-white/10'
                            }`}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-black px-4 py-1 rounded-full text-xs font-bold uppercase">
                                    Most Popular
                                </div>
                            )}
                            
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-display font-bold text-white">{pkg.name}</h3>
                                    <span className={`text-xs uppercase tracking-wide ${
                                        pkg.tier === 'premium' ? 'text-gold' : 
                                        pkg.tier === 'popular' ? 'text-blue-400' : 'text-gray-500'
                                    }`}>
                                        {pkg.tier} Tier
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-display font-bold text-gold">${pkg.price}</div>
                                    <span className="text-xs text-gray-500">one-time</span>
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm mb-6">{pkg.description}</p>

                            <ul className="space-y-2 mb-6">
                                {pkg.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                                        <CheckCircle size={14} className="text-gold shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link 
                                to={`/services/${pkg.id}`}
                                className="w-full bg-zinc-800 hover:bg-gold hover:text-black text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-300"
                            >
                                View Details
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-20">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-gray-500 uppercase tracking-widest text-sm">More Services</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Website Design Section */}
                <div className="mb-20">
                    <div className="text-center mb-12">
                        <span className="text-gold text-sm uppercase tracking-[0.3em] font-bold">Web Development</span>
                        <h2 className="text-4xl md:text-5xl font-display font-bold mt-4 mb-4">
                            Artist Website Design
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Professional websites built specifically for musicians. Showcase your music, sell merch, 
                            and connect with fans through a stunning online presence.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {websiteDesignPackages.map((pkg) => (
                            <div 
                                key={pkg.id}
                                className={`relative bg-zinc-900/50 border rounded-2xl p-8 hover:border-gold/50 transition-all duration-300 flex flex-col ${
                                    pkg.popular ? 'border-gold/30 scale-105' : 'border-white/10'
                                }`}
                            >
                                {pkg.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-black px-4 py-1 rounded-full text-xs font-bold uppercase">
                                        Most Popular
                                    </div>
                                )}
                                
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-display font-bold text-white mb-2">{pkg.name}</h3>
                                    <div className="text-4xl font-display font-bold text-gold">${pkg.price}</div>
                                    <span className="text-xs text-gray-500">one-time payment</span>
                                </div>

                                <p className="text-gray-400 text-sm text-center mb-6">{pkg.description}</p>

                                <ul className="space-y-3 mb-8 flex-1">
                                    {pkg.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                                            <CheckCircle size={14} className="text-gold shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Link 
                                    to={`/services/${pkg.id}`}
                                    className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-300 ${
                                        pkg.popular 
                                            ? 'bg-gold text-black hover:scale-[1.02]' 
                                            : 'bg-zinc-800 hover:bg-gold hover:text-black text-white'
                                    }`}
                                >
                                    Get Started
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add-Ons Section */}
                <div className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-display font-bold mb-4">Enhance Your Package</h2>
                        <p className="text-gray-400">Add these services to boost your press release impact.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {addOns.map((addon, idx) => (
                            <div key={idx} className="bg-zinc-900/30 border border-white/5 rounded-xl p-5 text-center hover:border-gold/30 transition-all">
                                <div className="text-2xl font-display font-bold text-gold mb-1">+${addon.price}</div>
                                <h4 className="font-bold text-white mb-1">{addon.name}</h4>
                                <p className="text-gray-500 text-xs">{addon.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10 border border-gold/20 rounded-3xl p-12 text-center">
                    <Music className="text-gold mx-auto mb-6" size={48} />
                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                        Ready to Get Featured?
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto mb-8">
                        Every placement includes a professionally written press release crafted by experienced PR specialists.
                        100% money back guarantee if your article isn't placed.
                    </p>
                    <a 
                        href="https://viewmaniac.com/product-category/press/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-gold text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-transform"
                    >
                        Browse All Packages
                        <ArrowRight size={20} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Services;
