import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, CreditCard, AlertCircle, Scale, Headphones } from 'lucide-react';

const TermsOfService = () => {
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
                        <FileText className="text-gold" size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold">Terms of Service</h1>
                        <p className="text-gray-400 mt-2">Last updated: February 5, 2026</p>
                    </div>
                </div>

                {/* Introduction */}
                <div className="bg-gold/10 border border-gold/30 rounded-2xl p-6 mb-8">
                    <p className="text-gray-200">
                        Welcome to Print Audio Lab. By using our services, you agree to these terms. 
                        Please read them carefully before booking a session or creating an account.
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-8 text-gray-300">
                    <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-display font-bold text-white mb-4 flex items-center gap-3">
                            <Headphones className="text-gold" size={24} />
                            Studio Services
                        </h2>
                        <ul className="list-disc list-inside space-y-3 ml-4">
                            <li>Print Audio Lab provides professional recording studio rental services in Norfolk, Virginia.</li>
                            <li>Studio availability is subject to scheduling and cannot be guaranteed until a booking is confirmed.</li>
                            <li>All sessions must be booked through our official website or by contacting us directly.</li>
                            <li>We reserve the right to refuse service to anyone for any reason.</li>
                        </ul>
                    </section>

                    <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-display font-bold text-white mb-4 flex items-center gap-3">
                            <Calendar className="text-gold" size={24} />
                            Booking & Cancellation Policy
                        </h2>
                        <ul className="list-disc list-inside space-y-3 ml-4">
                            <li><strong className="text-white">Deposits:</strong> A 50% deposit is required to confirm your booking.</li>
                            <li><strong className="text-white">Cancellation (48+ hours):</strong> Full deposit refund or reschedule at no charge.</li>
                            <li><strong className="text-white">Cancellation (24-48 hours):</strong> 50% of deposit may be applied to a future booking.</li>
                            <li><strong className="text-white">Cancellation (Less than 24 hours):</strong> Deposit is non-refundable.</li>
                            <li><strong className="text-white">No-shows:</strong> Failure to arrive within 30 minutes of your scheduled time will result in forfeiture of your deposit and session.</li>
                            <li><strong className="text-white">Late arrivals:</strong> Sessions will end at the originally scheduled time regardless of late arrival.</li>
                        </ul>
                    </section>

                    <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-display font-bold text-white mb-4 flex items-center gap-3">
                            <CreditCard className="text-gold" size={24} />
                            Payment Terms
                        </h2>
                        <ul className="list-disc list-inside space-y-3 ml-4">
                            <li>All prices are listed in USD and are subject to change without notice.</li>
                            <li>Payment is processed securely through Stripe.</li>
                            <li>The remaining balance is due at the start of your session.</li>
                            <li>We accept major credit cards and debit cards.</li>
                            <li>Additional hours beyond your booking may be purchased if the studio is available, subject to current rates.</li>
                        </ul>
                    </section>

                    <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-display font-bold text-white mb-4 flex items-center gap-3">
                            <AlertCircle className="text-gold" size={24} />
                            Studio Rules & Conduct
                        </h2>
                        <ul className="list-disc list-inside space-y-3 ml-4">
                            <li>No smoking, vaping, or open flames inside the studio.</li>
                            <li>No food or drinks near equipment. Designated areas are provided.</li>
                            <li>You are responsible for any damage to equipment caused by you or your guests.</li>
                            <li>Maximum occupancy limits must be respected for safety reasons.</li>
                            <li>Illegal activities are strictly prohibited and will result in immediate termination of your session.</li>
                            <li>We reserve the right to end any session if conduct becomes disruptive or dangerous.</li>
                        </ul>
                    </section>

                    <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-display font-bold text-white mb-4">Intellectual Property</h2>
                        <ul className="list-disc list-inside space-y-3 ml-4">
                            <li>You retain full ownership of all music and content you create at our studio.</li>
                            <li>Print Audio Lab does not claim any rights to your recordings.</li>
                            <li>With your permission, we may use photos or videos from your session for promotional purposes.</li>
                            <li>Our branding, website content, and materials are protected by copyright.</li>
                        </ul>
                    </section>

                    <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-display font-bold text-white mb-4 flex items-center gap-3">
                            <Scale className="text-gold" size={24} />
                            Liability & Disclaimers
                        </h2>
                        <ul className="list-disc list-inside space-y-3 ml-4">
                            <li>Print Audio Lab is not responsible for loss or damage to personal property.</li>
                            <li>We are not liable for technical issues beyond our reasonable control.</li>
                            <li>You agree to use all equipment responsibly and report any issues immediately.</li>
                            <li>Our liability is limited to the amount paid for your session.</li>
                            <li>These terms are governed by the laws of the Commonwealth of Virginia.</li>
                        </ul>
                    </section>

                    <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-display font-bold text-white mb-4">Changes to Terms</h2>
                        <p className="mb-4">
                            We may update these Terms of Service from time to time. We will notify users of significant changes 
                            via email or by posting a notice on our website. Continued use of our services after changes 
                            constitutes acceptance of the updated terms.
                        </p>
                    </section>

                    <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-display font-bold text-white mb-4">Contact Us</h2>
                        <p>
                            If you have any questions about these Terms of Service, please contact us:
                        </p>
                        <p className="mt-4 text-gold font-semibold">info@printaudiolab.com</p>
                        <p className="mt-2 text-gray-400">Print Audio Lab • Norfolk, Virginia</p>
                        <div className="mt-6 flex gap-4">
                            <Link to="/privacy" className="text-gold hover:underline">Privacy Policy</Link>
                            <span className="text-gray-600">•</span>
                            <Link to="/data-deletion" className="text-gold hover:underline">Data Deletion</Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
