import { Instagram, Mail } from 'lucide-react';
import logo from '../assets/logoBuyuk.jpeg';

export default function Footer() {
    return (
        <footer className="relative z-50 bg-white border-t border-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4">
                    {/* Left: Logo & Copyright */}
                    <div className="flex flex-col md:flex-row items-center text-center md:text-left space-y-3 md:space-y-0 md:space-x-4">
                        <img src={logo} alt="YUMO" className="h-8 md:h-10 object-contain" />
                        <span className="text-gray-500 text-xs md:text-sm">
                            &copy; 2026 Yumo. Tüm hakları saklıdır.
                        </span>
                    </div>

                    {/* Right: Social & Contact */}
                    <div className="flex items-center space-x-6">
                        <a
                            href="https://instagram.com/yumobag"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-black transition"
                        >
                            <Instagram size={20} />
                        </a>
                        <a
                            href="mailto:info@yumobag.net"
                            className="flex items-center text-gray-500 hover:text-black text-sm transition font-medium"
                        >
                            <Mail size={18} className="mr-2" />
                            info@yumobag.net
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
