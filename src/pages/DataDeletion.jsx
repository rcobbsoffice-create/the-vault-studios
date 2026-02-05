import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DataDeletion = () => {
    const { user } = useAuth();
    const [email, setEmail] = useState(user?.email || '');
    const [reason, setReason] = useState('');
    const [confirmed, setConfirmed] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!confirmed) {
            setMessage('Please confirm that you understand your data will be permanently deleted.');
            return;
        }

        setStatus('loading');
        
        // Simulate API call - in production, this would call a Firebase function
        try {
            // TODO: Implement actual deletion request via Firebase function
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setStatus('success');
            setMessage('Your data deletion request has been submitted. We will process it within 30 days and send a confirmation email.');
        } catch (error) {
            setStatus('error');
            setMessage('There was an error submitting your request. Please try again or contact us directly.');
        }
    };

    return (
        <div className="bg-black min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-6 max-w-2xl">
                {/* Header */}
                <Link to="/" className="inline-flex items-center gap-2 text-gold hover:text-white transition-colors mb-8">
                    <ArrowLeft size={20} />
                    <span>Back to Home</span>
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-red-500/10 p-4 rounded-2xl">
                        <Trash2 className="text-red-500" size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold">Data Deletion</h1>
                        <p className="text-gray-400 mt-2">Request removal of your personal data</p>
                    </div>
                </div>

                {/* Warning */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="text-red-500 flex-shrink-0 mt-1" size={24} />
                        <div>
                            <h3 className="text-red-400 font-bold mb-2">Important Notice</h3>
                            <p className="text-gray-300 text-sm">
                                Requesting data deletion will permanently remove all your personal information from our systems, 
                                including your account, booking history, and any associated data. This action cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>

                {status === 'success' ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
                        <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
                        <h2 className="text-2xl font-display font-bold text-white mb-4">Request Submitted</h2>
                        <p className="text-gray-300">{message}</p>
                        <Link to="/" className="inline-block mt-6 btn-primary">
                            Return Home
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8">
                        <h2 className="text-2xl font-display font-bold text-white mb-6">Request Data Deletion</h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-gold focus:outline-none transition-colors"
                                    placeholder="your@email.com"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Enter the email associated with your account
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Reason for Deletion (Optional)
                                </label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold focus:outline-none transition-colors"
                                >
                                    <option value="">Select a reason...</option>
                                    <option value="no-longer-using">No longer using the service</option>
                                    <option value="privacy-concerns">Privacy concerns</option>
                                    <option value="created-by-mistake">Account created by mistake</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={confirmed}
                                        onChange={(e) => setConfirmed(e.target.checked)}
                                        className="mt-1 w-5 h-5 rounded border-white/20 bg-black/50 text-gold focus:ring-gold focus:ring-offset-0"
                                    />
                                    <span className="text-sm text-gray-300">
                                        I understand that this will permanently delete all my data, including my account, 
                                        booking history, and any other personal information. This action cannot be undone.
                                    </span>
                                </label>
                            </div>

                            {message && status === 'error' && (
                                <p className="text-red-400 text-sm">{message}</p>
                            )}
                            {message && status === 'idle' && (
                                <p className="text-yellow-400 text-sm">{message}</p>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={20} />
                                        Request Data Deletion
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* Additional Info */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>
                        For questions about data deletion, contact us at{' '}
                        <a href="mailto:privacy@printaudiolab.com" className="text-gold hover:underline">
                            privacy@printaudiolab.com
                        </a>
                    </p>
                    <p className="mt-2">
                        <Link to="/privacy" className="text-gold hover:underline">
                            View our Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DataDeletion;
