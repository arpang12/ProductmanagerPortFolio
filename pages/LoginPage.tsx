
import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { View } from '../types';
import DevelopmentLogin from '../components/DevelopmentLogin';

interface LoginPageProps {
    navigateTo: (view: View) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ navigateTo }) => {
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = useContext(AuthContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await auth?.login(email, password);
            // App component will handle navigation to admin page
        } catch (err) {
            setError('Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleDevelopmentLogin = async (email: string, password: string) => {
        try {
            await auth?.login(email, password);
        } catch (error) {
            console.error('Development login error:', error);
        }
    };

    // Check if we're in development mode
    const isDevelopmentMode = !import.meta.env.VITE_SUPABASE_URL || 
                             import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

    if (isDevelopmentMode) {
        return <DevelopmentLogin onLogin={handleDevelopmentLogin} />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-8 m-4">
                <div className="text-center">
                    <h1 className="ghibli-font text-4xl text-blue-600 dark:text-blue-300"><span className="text-yellow-500">★</span> Admin Login</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome to the control room!</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="text-sm font-bold text-gray-600 dark:text-gray-400 block">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 mt-2 text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="password" className="text-sm font-bold text-gray-600 dark:text-gray-400 block">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 mt-2 text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full shadow-lg transform transition hover:scale-105 disabled:bg-gray-400 disabled:scale-100">
                            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Login'}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <button onClick={() => navigateTo('home')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        &larr; Back to Portfolio
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
