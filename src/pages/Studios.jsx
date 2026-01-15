import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, Speaker, Music4 } from 'lucide-react';

const Studios = () => {
    const studios = [
        {
            id: 'A',
            name: 'Studio A: The Main Room',
            description: 'Our flagship suite featuring an SSL AWS 948 console, expansive live room, and private lounge.',
            price: 75,
            features: ['SSL AWS 948', 'Neumann U87', 'Private Lounge', '4k Video Integration'],
            image: '/assets/studio_a.png'
        },
        {
            id: 'B',
            name: 'Studio B: The Lab',
            description: 'Perfect for production and mixing. Tuned for bass-heavy genres with a dedicated sub array.',
            price: 65,
            features: ['Avid S6', 'Genelec 8351', 'Vocal Booth', 'Production Suite'],
            image: '/assets/studio_b.png'
        }
    ];

    return (
        <div className="pt-24 min-h-screen bg-black pb-20">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 text-center">OUR SPACES</h1>
                <p className="text-gray-400 text-center max-w-2xl mx-auto mb-16">
                    Three distinct environments designed to inspire creativity and capture your best performance.
                </p>

                <div className="space-y-20">
                    {studios.map((studio, index) => (
                        <div key={studio.id} className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 items-center`}>
                            {/* Image */}
                            <div className="w-full md:w-1/2">
                                <div className="relative group overflow-hidden rounded-2xl border border-white/10">
                                    <div className="absolute inset-0 bg-gold/10 group-hover:bg-gold/0 transition-colors duration-500 z-10" />
                                    <img
                                        src={studio.image}
                                        alt={studio.name}
                                        className="w-full aspect-video object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="w-full md:w-1/2 space-y-6">
                                <h2 className="text-4xl font-display font-bold text-white uppercase">{studio.name}</h2>
                                <div className="h-1 w-20 bg-gold" />
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    {studio.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    {studio.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                                            <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 flex items-center gap-6">
                                    <div className="text-3xl font-bold text-gold">${studio.price}<span className="text-sm text-gray-500 font-normal">/hr</span></div>
                                    <Link to="/book" className="btn-outline px-8">
                                        Book This Room
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Studios;
