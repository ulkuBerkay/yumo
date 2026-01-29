import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../lib/axios';

import logo from '../assets/logo.jpeg';
import SearchBar from './SearchBar';

interface Category {
    id: number;
    name: string;
    slug: string;
}

export default function Navbar() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
    }, []);

    return (
        <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Left: Mobile Menu (Hidden for now) or Spacer */}
                    <div className="w-1/3 md:hidden"></div>

                    {/* Left/Center: Desktop Navigation */}
                    <div className="hidden md:flex w-1/3 justify-start items-center space-x-8">
                        <Link to="/urunler" className="text-gray-500 hover:text-black transition text-sm font-medium tracking-wide uppercase">Tüm Ürünler</Link>

                        <div className="relative group h-20 flex items-center">
                            <span className="text-gray-500 group-hover:text-black transition text-sm font-medium tracking-wide uppercase cursor-pointer h-full flex items-center">
                                Kategoriler
                            </span>
                            <div className="absolute left-0 top-full w-56 bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                                {categories.map(cat => (
                                    <Link
                                        key={cat.id}
                                        to={`/urunler?kategori=${cat.slug}`}
                                        className="block px-6 py-2 text-sm text-gray-500 hover:text-black hover:bg-gray-50 transition"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Center: Brand Logo */}
                    <div className="w-1/3 flex justify-center">
                        <Link to="/" className="text-2xl font-bold tracking-tighter hover:opacity-80 transition">
                            <img src={logo} alt="YUMO" className="h-20 object-contain" />
                        </Link>
                    </div>

                    {/* Right: Icons */}
                    <div className="w-1/3 flex justify-end items-center space-x-6">
                        {searchOpen ? (
                            <SearchBar onClose={() => setSearchOpen(false)} />
                        ) : (
                            <button onClick={() => setSearchOpen(true)} className="text-gray-400 hover:text-black transition">
                                <Search size={20} strokeWidth={1.5} />
                            </button>
                        )}


                    </div>
                </div>
            </div>
        </nav>
    );
}
