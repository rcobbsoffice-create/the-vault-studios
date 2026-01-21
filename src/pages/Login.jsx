import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../core/AuthContext';
import { Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState(null);
    const [role, setRole] = useState('ARTIST');
    const navigate = useNavigate();
    const { login, signup, loginWithProvider } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        let result;
        if (isLogin) {
            result = await login(email, password);
        } else {
            result = await signup(email, password, name, role);
        }

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        setSocialLoading(provider);
        setError('');

        const result = await loginWithProvider(provider);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
        setSocialLoading(null);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 pt-20">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
                        {isLogin ? 'ARTIST' : 'CREATE'} <span className="text-gold">{isLogin ? 'LOGIN' : 'ACCOUNT'}</span>
                    </h1>
                    <p className="text-gray-400 font-sans">
                        {isLogin ? 'Access your studio bookings and bounces' : 'Join the Vault ecosystem'}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={20} />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        {/* Name Field (Register Only) */}
                        {!isLogin && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">
                                        Account Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setRole('ARTIST')}
                                            className={`py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border ${role === 'ARTIST' ? 'bg-gold text-black border-gold' : 'bg-black text-zinc-500 border-white/10 hover:border-white/20'}`}
                                        >
                                            Artist
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole('PRODUCER')}
                                            className={`py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border ${role === 'PRODUCER' ? 'bg-gold text-black border-gold' : 'bg-black text-zinc-500 border-white/10 hover:border-white/20'}`}
                                        >
                                            Producer
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">
                                        {role === 'PRODUCER' ? 'Producer / Studio Name' : 'Artist / Band Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-gold focus:ring-1 focus:ring-gold/20 outline-none transition-all placeholder:text-zinc-700"
                                        placeholder={role === 'PRODUCER' ? "The Vault Producer" : "The Vault Artist"}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-gold focus:ring-1 focus:ring-gold/20 outline-none transition-all placeholder:text-zinc-700"
                                    placeholder="artist@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white focus:border-gold focus:ring-1 focus:ring-gold/20 outline-none transition-all placeholder:text-zinc-700"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            disabled={loading || socialLoading}
                            type="submit"
                            className="w-full bg-gold hover:bg-yellow-500 text-black font-black pt-4 pb-4 rounded-xl transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-gold/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    {/* Toggle */}
                    <div className="text-center pt-6">
                        <button
                            type="button"
                            onClick={() => { setError(''); setIsLogin(!isLogin); }}
                            className="text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                        >
                            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-[0.2em]">
                            <span className="bg-zinc-900 px-4 text-zinc-600 font-bold">Or continue with</span>
                        </div>
                    </div>

                    {/* Social Logins */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            disabled={loading || socialLoading}
                            className="flex items-center justify-center p-3 bg-white hover:bg-gray-100 rounded-xl transition-all active:scale-90 group relative"
                            title="Google"
                        >
                            {socialLoading === 'google' ? (
                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                        </button>
                        <button
                            onClick={() => handleSocialLogin('apple')}
                            disabled={loading || socialLoading}
                            className="flex items-center justify-center p-3 bg-black border border-white/10 hover:bg-zinc-800 rounded-xl transition-all active:scale-90 group"
                            title="Apple"
                        >
                            {socialLoading === 'apple' ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-5 h-5 fill-white" viewBox="0 0 384 512">
                                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 21.8-88.5 21.8-11.4 0-51.1-18.1-81.9-18.1-48.2 0-100.2 30.4-123.7 78.2-50.3 101.7-13.1 251 34.1 319.4 23.3 33.3 50.8 70.1 84.8 68.9 33.7-1.3 46.5-21.7 87.2-21.7 41 0 53 21.7 88.5 20.9 35.5-.8 59.8-33.1 82.9-66.5 26.6-38.3 38.2-75.3 38.6-77.3-.8-.3-74.1-28.5-74.3-114.2zM249.7 113.8c19.1-23.1 31.9-55.2 28.5-87.3-27.4 1.1-60.6 18.2-80.4 41.2-17.7 20.4-33.3 53.4-29.2 84 30.7 2.4 62-14.7 81.1-37.9z" />
                                </svg>
                            )}
                        </button>
                        <button
                            onClick={() => handleSocialLogin('facebook')}
                            disabled={loading || socialLoading}
                            className="flex items-center justify-center p-3 bg-[#1877F2] hover:bg-[#166fe5] rounded-xl transition-all active:scale-90 group"
                            title="Facebook"
                        >
                            {socialLoading === 'facebook' ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-5 h-5 fill-white" viewBox="0 0 320 512">
                                    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Back to Home */}
                    <div className="text-center pt-4">
                        <Link to="/" className="text-zinc-600 hover:text-gold transition-colors text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                            Back to Home
                        </Link>
                    </div>
                </div>

                {/* Demo Credentials */}
                <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    <p className="text-[10px] text-zinc-600 mb-4 font-black uppercase tracking-[0.4em] text-center">Tap to Quick Log In</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Artist Card */}
                        <div
                            onClick={() => {
                                setEmail('artist@demo.com');
                                setPassword('demo123');
                            }}
                            className="bg-black border border-white/5 rounded-2xl p-6 cursor-pointer hover:border-gold/50 hover:bg-zinc-900 group transition-all"
                        >
                            <p className="text-white font-display text-lg font-black tracking-tighter uppercase group-hover:text-gold transition-colors leading-none">Marcus Johnson</p>
                            <p className="text-zinc-600 text-xs font-bold mt-1">artist@demo.com</p>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="text-[8px] bg-gold/10 text-gold px-2 py-0.5 rounded font-black tracking-widest uppercase">Artist</span>
                                <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest group-hover:text-zinc-500 transition-colors">Click to Fill</span>
                            </div>
                        </div>

                        {/* Admin Card */}
                        <div
                            onClick={() => {
                                setEmail('admin@printlab.com');
                                setPassword('printlabadmin123');
                            }}
                            className="bg-black border border-white/5 rounded-2xl p-6 cursor-pointer hover:border-blue-500/50 hover:bg-zinc-900 group transition-all"
                        >
                            <p className="text-white font-display text-lg font-black tracking-tighter uppercase group-hover:text-blue-400 transition-colors leading-none">Print Lab Admin</p>
                            <p className="text-zinc-600 text-xs font-bold mt-1">admin@printlab.com</p>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="text-[8px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-black tracking-widest uppercase">Admin</span>
                                <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest group-hover:text-zinc-500 transition-colors">Click to Fill</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
