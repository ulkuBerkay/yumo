import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import api from '../lib/axios';

import logo from '../assets/logoBuyuk.jpeg';
import SearchBar from './SearchBar';

interface Category {
    id: number;
    name: string;
    slug: string;
}

export default function Navbar() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(true);

    useEffect(() => {
        api.get('/categories').then(res => setCategories(res.data)).catch(console.error);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileMenuOpen]);

    return (
        <>
            <nav className="border-b border-gray-100 bg-white sticky top-0 z-[60]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Left: Mobile Menu Trigger */}
                        <div className="w-1/3 md:hidden flex items-center">
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="text-gray-500 hover:text-black p-2 -ml-2"
                            >
                                <Menu size={24} strokeWidth={1.5} />
                            </button>
                        </div>

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

            {/* Mobile Menu Overlay & Sidebar */}
            <div
                className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 md:hidden ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            <div
                className={`fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[100] shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
                        <img src={logo} alt="YUMO" className="h-12 object-contain" />
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-gray-400 hover:text-black p-2 -mr-2"
                        >
                            <X size={24} strokeWidth={1.5} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-8 px-6 space-y-6">
                        <Link
                            to="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-lg font-medium text-gray-900 border-b border-gray-50 pb-4"
                        >
                            Anasayfa
                        </Link>

                        <Link
                            to="/urunler"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-lg font-medium text-gray-900 border-b border-gray-50 pb-4"
                        >
                            Tüm Ürünler
                        </Link>

                        <div className="space-y-4">
                            <button
                                onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                                className="flex items-center justify-between w-full text-lg font-medium text-gray-900"
                            >
                                <span>Kategoriler</span>
                                {mobileCategoriesOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </button>

                            <div className={`space-y-3 pl-2 transition-all duration-300 ${mobileCategoriesOpen ? 'block' : 'hidden'}`}>
                                {categories.map(cat => (
                                    <Link
                                        key={cat.id}
                                        to={`/urunler?kategori=${cat.slug}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block text-base text-gray-500 hover:text-black py-1"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
