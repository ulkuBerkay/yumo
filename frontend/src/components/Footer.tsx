import { Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <h3 className="text-xl font-bold tracking-tighter mb-4">
                            YUMO<span className="text-blue-600">.</span>
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Günlük yaşam tarzınız için tasarlanmış birinci sınıf çantalar ve aksesuarlar.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Mağaza</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-gray-500 hover:text-black text-sm transition">Yeni Gelenler</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-black text-sm transition">Çantalar</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-black text-sm transition">Aksesuarlar</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-black text-sm transition">İndirim</a></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Destek</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-gray-500 hover:text-black text-sm transition">SSS</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-black text-sm transition">Kargo ve İade</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-black text-sm transition">Beden Tablosu</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-black text-sm transition">İletişim</a></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-4">Bizi Takip Edin</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-black transition"><Instagram size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-black transition"><Facebook size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-black transition"><Twitter size={20} /></a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 text-xs">
                        &copy; 2026 Yumo. Tüm hakları saklıdır.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="text-gray-400 hover:text-black text-xs transition">Gizlilik Politikası</a>
                        <a href="#" className="text-gray-400 hover:text-black text-xs transition">Kullanım Şartları</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
