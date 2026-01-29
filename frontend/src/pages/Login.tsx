import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import api from '../lib/axios';
import logo from '../assets/logo.jpeg';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await api.get('/sanctum/csrf-cookie', { baseURL: 'http://localhost:8081' }); // Initialize CSRF protection

            const response = await api.post('/login', { email, password });

            login(response.data.access_token, response.data.user);

            if (response.data.user.is_admin) {
                navigate('/yonetim/panel');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left Side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <img
                    src="https://images.unsplash.com/photo-1590874103328-98e099684346?q=80&w=2072&auto=format&fit=crop"
                    alt="Luxury Bag"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-12 left-12 text-white p-8 max-w-lg">
                    <h2 className="text-4xl font-bold mb-4 tracking-tight">Tarzını Keşfet.</h2>
                    <p className="text-lg opacity-90 leading-relaxed font-light">
                        En yeni koleksiyonlar ve özel tasarımlar ile gardırobunuza modern bir dokunuş yapın.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo & Header */}
                    <div className="text-center mb-10">
                        <Link to="/" className="inline-block mb-6">
                            <img src={logo} alt="YUMO" className="h-16 mx-auto object-contain" />
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Tekrar Hoşgeldiniz</h2>
                        <p className="mt-2 text-gray-500">Hesabınıza giriş yaparak devam edin</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta Adresi</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors outline-none bg-gray-50 focus:bg-white"
                                        placeholder="ornek@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-colors outline-none bg-gray-50 focus:bg-white"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end mt-1">
                                    <a href="#" className="text-xs font-medium text-gray-500 hover:text-black transition">Şifremi Unuttum?</a>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all disabled:opacity-70 shadow-lg hover:shadow-xl"
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Giriş Yapılıyor...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    Giriş Yap <ArrowRight size={18} className="ml-2" />
                                </span>
                            )}
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-500">
                                Hesabınız yok mu?{' '}
                                <a href="#" className="font-semibold text-black hover:underline">
                                    Hemen Kayıt Olun
                                </a>
                            </p>
                        </div>
                    </form>
                </div>

                <div className="absolute bottom-6 text-center w-full text-xs text-gray-400">
                    &copy; 2026 Yumo. Tüm hakları saklıdır.
                </div>
            </div>
        </div>
    );
}
