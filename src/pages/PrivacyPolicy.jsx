import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Database, Lock, Mail } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="bg-black min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Header */}
                <Link to="/" className="inline-flex items-center gap-2 text-gold hover:text-white transition-colors mb-8">
                    <ArrowLeft size={20} />
                    <span>Back to Home</span>
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-gold/10 p-4 rounded-2xl">
                        <Shield className="text-gold" size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold">Privacy Policy</h1>
                        <p className="text-gray-400 mt-2">Last updated: February 5, 2026</p>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-8 text-gray-300">
                    <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-display font-bold text-white mb-4 flex items-center gap-3">
                            <Eye className="text-gold" size={24} />
                            Information We Collect
                        </h2>
                        <p className="mb-4">When you use Print Audio Lab, we may collect the following information:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong className="text-white">Account Information:</strong> Name, email address, phone number when you create an account or book a session.</li>
                            <li><strong className="text-white">Social Login Data:</strong> When you sign in with Facebook or Google, we receive your public profile information (name, email, profile picture).</li>
                            <li><strong className="text-white">Booking Information:</strong> Studio preferences, session dates, times, and special requests.</li>
                            <li><strong className="text-white">Payment Information:</strong> Processed securely through Stripe. We do not store your full credit card details.</li>
                            <li><strong className="text-white">Usage Data:</strong> How you interact with our website to improve our services.</li>
                        </ul>
                    </section>

                    <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-display font-bold text-white mb-4 flex items-center gap-3">
                            <Database className="text-gold" size={24} />
                            How We Use Your Information
                        </h2>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>To process and manage your studio bookings</li>
                            <li>To communicate with you about your sessions and account</li>
                            <li>To send booking confirmations and reminders</li>
                            <li>To improve our services and user experience</li>
                            <li>To comply with legal obligations</li>
                        </ul>
                    </section>

                    <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-display font-bold text-white mb-4 flex items-center gap-3">
                            <Lock className="text-gold" size={24} />
                            Data Security & Sharing
                        </h2>
                        <p className="mb-4">We take your privacy seriously:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Your data is encrypted in transit and at rest</li>
                            <li>We use Firebase and industry-standard security practices</li>
                            <li>We do not sell your personal information to third parties</li>
                            <li>We only share data with service providers necessary to operate our platform (Stripe for payments, Firebase for hosting)</li>
                        </ul>
                    </section>

                    <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-display font-bold text-white mb-4">Your Rights</h2>
                        <p className="mb-4">You have the right to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Access your personal data</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Withdraw consent for data processing</li>
                            <li>Export your data in a portable format</li>
                        </ul>
                        <p className="mt-4">
                            To exercise these rights, visit our{' '}
                            <Link to="/data-deletion" className="text-gold hover:underline">Data Deletion page</Link>
                            {' '}or contact us directly.
                        </p>
                    </section>

                    <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-display font-bold text-white mb-4 flex items-center gap-3">
                            <Mail className="text-gold" size={24} />
                            Contact Us
                        </h2>
                        <p>
                            If you have any questions about this Privacy Policy or your data, please contact us at:
                        </p>
                        <p className="mt-4 text-gold font-semibold">privacy@printaudiolab.com</p>
                        <p className="mt-2 text-gray-400">Print Audio Lab • Norfolk, Virginia</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
