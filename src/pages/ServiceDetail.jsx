import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    CheckCircle, 
    ShoppingCart, 
    Shield, 
    Clock, 
    FileText, 
    Users, 
    Zap,
    Star,
    Loader2,
    AlertCircle,
    LogIn
} from 'lucide-react';
import { useCart } from '../core/CartContext';
import { useAuth } from '../core/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

// Extended product data with detailed information
const pressReleaseProducts = {
    'cali-post': {
        id: 'cali-post',
        name: 'Cali Post Press Placement',
        price: 150,
        tier: 'starter',
        shortDescription: 'Regional California music news outlet with strong local reach.',
        description: `Get your music featured on Cali Post, a popular regional music news outlet covering the California music scene. 
        Perfect for artists looking to build their presence in the West Coast market and connect with local fans and industry professionals.`,
        audience: '50K+ Monthly Readers',
        turnaround: '5-7 Business Days',
        features: [
            'Professionally Written Press Release',
            'SEO Optimized Article',
            'Backlinks to Your Platforms',
            'Social Media Sharing',
            'Permanent Placement',
            '100% Money Back Guarantee'
        ],
        whatsIncluded: [
            { title: 'Custom Press Release', desc: 'Our PR team crafts a unique article tailored to your brand and story.' },
            { title: 'Editorial Review', desc: 'Your article goes through editorial review for quality assurance.' },
            { title: 'SEO Optimization', desc: 'Keywords and structure optimized for search engine visibility.' },
            { title: 'Approval Process', desc: 'Review and approve the article before it goes live.' }
        ],
        idealFor: ['Independent Artists', 'West Coast Musicians', 'New Releases', 'Tour Announcements']
    },
    'elite-music-news': {
        id: 'elite-music-news',
        name: 'Elite Music News Press Placement',
        price: 175,
        tier: 'starter',
        shortDescription: 'Popular music news platform for emerging artists.',
        description: `Elite Music News is a go-to source for discovering new talent in hip-hop, R&B, and pop. 
        This placement helps emerging artists gain credibility and exposure to a dedicated audience of music fans actively seeking new artists.`,
        audience: '75K+ Monthly Readers',
        turnaround: '5-7 Business Days',
        features: [
            'Professionally Written Press Release',
            'SEO Optimized Article',
            'Backlinks to Your Platforms',
            'Social Media Promotion',
            'Permanent Placement',
            '100% Money Back Guarantee'
        ],
        whatsIncluded: [
            { title: 'Custom Press Release', desc: 'Narrative crafted specifically for your brand.' },
            { title: 'Real Writers', desc: 'Written by real editorial staff, not AI templates.' },
            { title: 'SEO Support', desc: 'Article structured with SEO best practices.' },
            { title: 'Client Approval', desc: 'Full approval process before publication.' }
        ],
        idealFor: ['Emerging Artists', 'Single Releases', 'Music Videos', 'Artist Announcements']
    },
    'artist-weekly': {
        id: 'artist-weekly',
        name: 'Artist Weekly Press Placement',
        price: 275,
        tier: 'popular',
        popular: true,
        shortDescription: 'Industry publication covering rising talent and new releases.',
        description: `Artist Weekly is an industry-respected publication that covers rising talent across all genres. 
        A placement here positions you alongside other serious artists and catches the attention of industry professionals, 
        playlist curators, and booking agents.`,
        audience: '100K+ Monthly Readers',
        turnaround: '5-7 Business Days',
        features: [
            'Professionally Written Press Release',
            'SEO Optimized Article',
            'Premium Backlinks',
            'Social Media Campaign',
            'Featured Placement Option',
            'Permanent Placement',
            '100% Money Back Guarantee'
        ],
        whatsIncluded: [
            { title: 'Premium Press Release', desc: 'In-depth article showcasing your artistry and story.' },
            { title: 'Industry Exposure', desc: 'Reach industry professionals and tastemakers.' },
            { title: 'Enhanced SEO', desc: 'Multiple backlinks and keyword optimization.' },
            { title: 'Priority Publishing', desc: 'Faster review and publication process.' }
        ],
        idealFor: ['Serious Artists', 'Album Releases', 'Major Announcements', 'Industry Visibility']
    },
    'music-emu': {
        id: 'music-emu',
        name: 'Music EMU Blog Placement',
        price: 300,
        tier: 'popular',
        shortDescription: 'Blog placement with engaged music community audience.',
        description: `Music EMU features an engaged community of music enthusiasts who actively discover and share new artists. 
        This placement is excellent for building grassroots buzz and connecting with superfans who will champion your music.`,
        audience: '80K+ Monthly Readers',
        turnaround: '5-7 Business Days',
        features: [
            'Professionally Written Press Release',
            'SEO Optimized Article',
            'Community Exposure',
            'Backlinks Included',
            'Social Sharing',
            'Permanent Placement',
            '100% Money Back Guarantee'
        ],
        whatsIncluded: [
            { title: 'Community-Focused Article', desc: 'Written to resonate with engaged music fans.' },
            { title: 'Authentic Voice', desc: 'Editorial style that connects with readers.' },
            { title: 'Share-Friendly Format', desc: 'Optimized for social media sharing.' },
            { title: 'Full Approval Process', desc: 'Review everything before publication.' }
        ],
        idealFor: ['Building Fanbase', 'Community Engagement', 'Viral Potential', 'Music Discovery']
    },
    'all-hip-hop': {
        id: 'all-hip-hop',
        name: 'All Hip Hop Press Placement',
        price: 350,
        tier: 'popular',
        shortDescription: 'Major hip hop media outlet with massive audience reach.',
        description: `All Hip Hop is one of the most recognized names in hip-hop media, reaching millions of dedicated hip-hop fans monthly. 
        A placement here provides significant credibility and exposure to a highly engaged audience that lives and breathes hip-hop culture.`,
        audience: '500K+ Monthly Readers',
        turnaround: '7-10 Business Days',
        features: [
            'Professionally Written Press Release',
            'SEO Optimized Article',
            'High-Authority Backlinks',
            'Massive Audience Reach',
            'Social Media Amplification',
            'Permanent Placement',
            '100% Money Back Guarantee'
        ],
        whatsIncluded: [
            { title: 'Premium Press Release', desc: 'High-quality article for a major publication.' },
            { title: 'Brand Credibility', desc: 'Association with a legendary hip-hop brand.' },
            { title: 'High-Traffic Exposure', desc: 'Access to hundreds of thousands of readers.' },
            { title: 'Editorial Excellence', desc: 'Professional editorial standards.' }
        ],
        idealFor: ['Hip Hop Artists', 'Rap Singles', 'Major Releases', 'Credibility Building']
    },
    'bust': {
        id: 'bust',
        name: 'Bust Magazine Press Placement',
        price: 850,
        tier: 'premium',
        shortDescription: 'Premium lifestyle and culture publication.',
        description: `Bust Magazine is a premium lifestyle and culture publication with a devoted readership interested in music, art, and culture. 
        This placement positions you within a respected cultural context and reaches an audience that values artistic integrity and authentic storytelling.`,
        audience: '200K+ Monthly Readers',
        turnaround: '10-14 Business Days',
        features: [
            'Professionally Written Press Release',
            'Premium SEO Optimization',
            'High-Authority Backlinks',
            'Cultural Context Placement',
            'Editorial Feature Style',
            'Social Media Campaign',
            'Permanent Placement',
            '100% Money Back Guarantee'
        ],
        whatsIncluded: [
            { title: 'Feature-Style Article', desc: 'In-depth editorial treatment of your story.' },
            { title: 'Cultural Positioning', desc: 'Placed within lifestyle and culture context.' },
            { title: 'Premium Backlinks', desc: 'High-authority domain links.' },
            { title: 'Extended Approval', desc: 'Thorough review and approval process.' }
        ],
        idealFor: ['Established Artists', 'Cultural Projects', 'Brand Building', 'Lifestyle Crossover']
    },
    'c-heads': {
        id: 'c-heads',
        name: 'C-Heads Magazine Press Placement',
        price: 950,
        tier: 'premium',
        shortDescription: 'High-end arts and culture publication with global reach.',
        description: `C-Heads Magazine is an internationally recognized arts and culture publication known for its stunning visual content and cutting-edge coverage. 
        A placement here reaches a global audience of tastemakers, creatives, and industry professionals who shape cultural trends.`,
        audience: '300K+ Monthly Readers',
        turnaround: '10-14 Business Days',
        features: [
            'Professionally Written Press Release',
            'Premium SEO Optimization',
            'International Exposure',
            'High-Authority Backlinks',
            'Visual-Forward Presentation',
            'Social Media Campaign',
            'Permanent Placement',
            '100% Money Back Guarantee'
        ],
        whatsIncluded: [
            { title: 'International Feature', desc: 'Reach audiences across the globe.' },
            { title: 'Visual Excellence', desc: 'Beautiful presentation of your content.' },
            { title: 'Tastemaker Audience', desc: 'Connect with cultural influencers.' },
            { title: 'Premium Treatment', desc: 'White-glove service throughout.' }
        ],
        idealFor: ['Visual Artists', 'Global Reach', 'Fashion Crossover', 'Art-Forward Projects']
    },
    'flaunt': {
        id: 'flaunt',
        name: 'Flaunt Magazine Press Placement',
        price: 950,
        tier: 'premium',
        shortDescription: 'Premier fashion and music culture publication.',
        description: `Flaunt Magazine sits at the intersection of fashion, music, and culture, featuring everyone from emerging artists to A-list celebrities. 
        This placement puts you in the company of industry heavyweights and reaches an audience that includes industry executives, booking agents, and tastemakers.`,
        audience: '350K+ Monthly Readers',
        turnaround: '10-14 Business Days',
        features: [
            'Professionally Written Press Release',
            'Premium SEO Optimization',
            'Celebrity-Adjacent Placement',
            'High-Authority Backlinks',
            'Fashion/Culture Context',
            'Extensive Social Campaign',
            'Permanent Placement',
            '100% Money Back Guarantee'
        ],
        whatsIncluded: [
            { title: 'Prestige Placement', desc: 'Featured alongside major artists and celebrities.' },
            { title: 'Cross-Industry Reach', desc: 'Fashion, music, and culture audiences.' },
            { title: 'Career Elevation', desc: 'Significant credibility boost.' },
            { title: 'Full Creative Control', desc: 'Extensive approval process.' }
        ],
        idealFor: ['Fashion-Forward Artists', 'Visual Brands', 'Celebrity Culture', 'Major Statements']
    },
    'spin': {
        id: 'spin',
        name: 'Spin Magazine Press Placement',
        price: 975,
        tier: 'premium',
        shortDescription: 'Legendary music publication with decades of industry influence.',
        description: `SPIN Magazine is one of the most legendary names in music journalism, with decades of history covering the biggest names in music. 
        A placement in SPIN provides unparalleled credibility and positions you within the same pages that have featured music icons throughout history.`,
        audience: '500K+ Monthly Readers',
        turnaround: '10-14 Business Days',
        features: [
            'Professionally Written Press Release',
            'Premium SEO Optimization',
            'Legendary Publication Credit',
            'High-Authority Backlinks',
            'Industry Recognition',
            'Social Media Amplification',
            'Permanent Placement',
            '100% Money Back Guarantee'
        ],
        whatsIncluded: [
            { title: 'Legendary Platform', desc: 'Featured in an iconic music publication.' },
            { title: 'Industry Credibility', desc: 'Recognized by labels, agents, and executives.' },
            { title: 'Historic Brand', desc: 'Association with music journalism history.' },
            { title: 'Premium Service', desc: 'Dedicated attention throughout the process.' }
        ],
        idealFor: ['Serious Career Artists', 'Major Label Pitches', 'Industry Credibility', 'Historic Recognition']
    }
};

// Website Design Products
const websiteDesignProducts = {
    'website-starter': {
        id: 'website-starter',
        name: 'Starter Website Package',
        price: 499,
        tier: 'starter',
        category: 'website',
        shortDescription: 'Perfect for new artists who need a professional online presence quickly.',
        description: `Get your music career started with a professional single-page website designed specifically for artists. 
        This package is perfect for new artists who need a polished online presence without breaking the bank. 
        Your site will be fully mobile responsive and include everything you need to showcase your music and connect with fans.`,
        audience: 'New & Emerging Artists',
        turnaround: '7 Business Days',
        features: [
            'Single Page Design',
            'Mobile Responsive Layout',
            'Music Player Integration',
            'Social Media Links',
            'Contact Form',
            'Basic SEO Setup',
            '1 Revision Round',
            '7-Day Delivery'
        ],
        whatsIncluded: [
            { title: 'Custom Design', desc: 'A unique design tailored to your artist brand and style.' },
            { title: 'Music Player', desc: 'Embedded player to showcase your tracks directly on the site.' },
            { title: 'Mobile Ready', desc: 'Looks great on phones, tablets, and desktops.' },
            { title: 'Launch Support', desc: 'Help getting your site live and running smoothly.' }
        ],
        idealFor: ['New Artists', 'Single Releases', 'EPK Alternative', 'Quick Launch']
    },
    'website-pro': {
        id: 'website-pro',
        name: 'Pro Website Package',
        price: 999,
        tier: 'popular',
        popular: true,
        category: 'website',
        shortDescription: 'Full-featured artist website with all the essentials for serious musicians.',
        description: `The Pro Website Package is built for serious artists who are ready to take their online presence to the next level. 
        With up to 5 custom-designed pages, you'll have space for your bio, discography, tour dates, videos, and more. 
        This package includes EPK integration, mailing list signup, and full SEO optimization to help fans find you online.`,
        audience: 'Established Artists',
        turnaround: '14 Business Days',
        features: [
            'Up to 5 Custom Pages',
            'Fully Custom Design',
            'EPK Integration',
            'Music & Video Gallery',
            'Tour Dates Section',
            'Mailing List Signup',
            'Full SEO Optimization',
            'Analytics Integration',
            '3 Revision Rounds',
            '14-Day Delivery'
        ],
        whatsIncluded: [
            { title: 'Multi-Page Site', desc: 'Up to 5 pages including Home, About, Music, Videos, and Contact.' },
            { title: 'EPK Integration', desc: 'Professional press kit section for industry contacts.' },
            { title: 'Fan Engagement', desc: 'Mailing list and social integration to grow your audience.' },
            { title: 'SEO & Analytics', desc: 'Optimized for search and connected to Google Analytics.' }
        ],
        idealFor: ['Serious Artists', 'Album Campaigns', 'Industry Pitches', 'Fan Building']
    },
    'website-enterprise': {
        id: 'website-enterprise',
        name: 'Enterprise Website Package',
        price: 2499,
        tier: 'premium',
        category: 'website',
        shortDescription: 'Premium custom website for established artists and labels with advanced features.',
        description: `The Enterprise Package is our most comprehensive website solution, designed for established artists, management teams, and labels. 
        This premium package includes unlimited pages, a fully custom e-commerce store for merch sales, streaming platform integration, 
        a blog/news section, fan club features, and advanced analytics. With unlimited revisions and priority support, 
        we'll work with you until your site is exactly what you envisioned.`,
        audience: 'Established Artists & Labels',
        turnaround: '21 Business Days',
        features: [
            'Unlimited Custom Pages',
            'Premium Custom Design',
            'E-Commerce / Merch Store',
            'Streaming Platform Integration',
            'Blog / News Section',
            'Fan Club Features',
            'Advanced Analytics Dashboard',
            'Priority Support',
            'Unlimited Revisions',
            '21-Day Delivery'
        ],
        whatsIncluded: [
            { title: 'Full E-Commerce', desc: 'Sell merch, music, and tickets directly from your site.' },
            { title: 'Premium Design', desc: 'Completely custom design with unlimited creative freedom.' },
            { title: 'Fan Club Features', desc: 'Exclusive content areas and membership options.' },
            { title: 'White-Glove Service', desc: 'Dedicated support and unlimited revisions until perfect.' }
        ],
        idealFor: ['Major Artists', 'Record Labels', 'Merch Sales', 'Fan Monetization']
    }
};

// Combined products lookup
const allProducts = { ...pressReleaseProducts, ...websiteDesignProducts };

const ServiceDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState(null);
    const { addItem, isInCart, openCart } = useCart();
    const { isAuthenticated } = useAuth();
    const product = allProducts[productId];

    if (!product) {
        return (
            <div className="bg-black min-h-screen pt-24 pb-16">
                <div className="container mx-auto px-6 text-center">
                    <AlertCircle className="text-gold mx-auto mb-4" size={64} />
                    <h1 className="text-3xl font-display font-bold mb-4">Package Not Found</h1>
                    <p className="text-gray-400 mb-8">The requested service package doesn't exist.</p>
                    <Link to="/services" className="btn-primary">
                        Browse All Packages
                    </Link>
                </div>
            </div>
        );
    }

    const inCart = isInCart(product.id);

    const handleAddToCart = () => {
        addItem(product);
        openCart();
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            navigate(`/login?redirect=/services/${productId}`);
            return;
        }
        
        setIsCheckingOut(true);
        setError(null);
        
        try {
            const createServiceCheckout = httpsCallable(functions, 'createServiceCheckout');
            const result = await createServiceCheckout({
                items: [{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    type: product.category || 'press-release',
                    quantity: 1
                }]
            });
            
            // Redirect to Stripe Checkout
            if (result.data.url) {
                window.location.href = result.data.url;
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setError(err.message || 'Failed to start checkout. Please try again.');
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="bg-black min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-6">
                {/* Breadcrumb */}
                <Link to="/services" className="inline-flex items-center gap-2 text-gold hover:text-white transition-colors mb-8">
                    <ArrowLeft size={20} />
                    <span>Back to Services</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column - Product Info */}
                    <div>
                        {/* Header */}
                        <div className="mb-8">
                            {product.popular && (
                                <span className="inline-block bg-gold text-black px-3 py-1 rounded-full text-xs font-bold uppercase mb-4">
                                    Most Popular
                                </span>
                            )}
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 ml-2 ${
                                product.tier === 'premium' ? 'bg-purple-500/20 text-purple-400' : 
                                product.tier === 'popular' ? 'bg-blue-500/20 text-blue-400' : 
                                'bg-zinc-700 text-gray-300'
                            }`}>
                                {product.tier} Tier
                            </span>
                            
                            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                                {product.name}
                            </h1>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
                                <Users className="text-gold mb-2" size={24} />
                                <div className="text-white font-bold">{product.audience}</div>
                                <div className="text-gray-500 text-sm">Audience Reach</div>
                            </div>
                            <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
                                <Clock className="text-gold mb-2" size={24} />
                                <div className="text-white font-bold">{product.turnaround}</div>
                                <div className="text-gray-500 text-sm">Turnaround Time</div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="mb-8">
                            <h2 className="text-xl font-display font-bold mb-4">Features Included</h2>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {product.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-gray-300">
                                        <CheckCircle size={16} className="text-gold shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Ideal For */}
                        <div className="mb-8">
                            <h2 className="text-xl font-display font-bold mb-4">Ideal For</h2>
                            <div className="flex flex-wrap gap-2">
                                {product.idealFor.map((item, idx) => (
                                    <span key={idx} className="bg-zinc-800 text-gray-300 px-4 py-2 rounded-full text-sm">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Purchase Card */}
                    <div>
                        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 sticky top-28">
                            {/* Price */}
                            <div className="text-center mb-8">
                                <div className="text-5xl font-display font-bold text-gold">${product.price}</div>
                                <div className="text-gray-500">One-time payment</div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="space-y-4 mb-8">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm">
                                        {error}
                                    </div>
                                )}
                                <button
                                    onClick={handleBuyNow}
                                    disabled={isCheckingOut}
                                    className="w-full bg-gold text-black py-4 rounded-xl font-bold text-lg uppercase tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {isCheckingOut ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Processing...
                                        </>
                                    ) : (
                                        'Buy Now'
                                    )}
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={inCart}
                                    className={`w-full py-4 rounded-xl font-bold text-lg uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${
                                        inCart 
                                            ? 'bg-green-600 text-white cursor-default' 
                                            : 'bg-zinc-800 text-white hover:bg-zinc-700'
                                    }`}
                                >
                                    {inCart ? (
                                        <>
                                            <CheckCircle size={18} />
                                            In Cart
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={18} />
                                            Add to Cart
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="border-t border-white/10 pt-6 space-y-4">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Shield className="text-gold shrink-0" size={20} />
                                    <span className="text-sm">100% Money Back Guarantee</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Zap className="text-gold shrink-0" size={20} />
                                    <span className="text-sm">Guaranteed Placement or Full Refund</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <FileText className="text-gold shrink-0" size={20} />
                                    <span className="text-sm">Free Press Release Included</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Star className="text-gold shrink-0" size={20} />
                                    <span className="text-sm">Written by Real PR Professionals</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* What's Included Section */}
                <div className="mt-16">
                    <h2 className="text-3xl font-display font-bold mb-8 text-center">What's Included</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {product.whatsIncluded.map((item, idx) => (
                            <div key={idx} className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
                                <div className="bg-gold/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-gold">
                                    <CheckCircle size={24} />
                                </div>
                                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Process Section */}
                <div className="mt-16 bg-zinc-900/30 border border-white/5 rounded-3xl p-12">
                    <h2 className="text-3xl font-display font-bold mb-8 text-center">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="bg-gold text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                            <h3 className="font-bold mb-2">Purchase Package</h3>
                            <p className="text-gray-500 text-sm">Complete your order and provide your details.</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-gold text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                            <h3 className="font-bold mb-2">PR Team Writes</h3>
                            <p className="text-gray-500 text-sm">Our team crafts your custom press release.</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-gold text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                            <h3 className="font-bold mb-2">You Approve</h3>
                            <p className="text-gray-500 text-sm">Review and approve before publication.</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-gold text-black w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
                            <h3 className="font-bold mb-2">Get Published</h3>
                            <p className="text-gray-500 text-sm">Your article goes live permanently.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetail;
