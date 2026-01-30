import { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    images: { image_path: string, is_primary: boolean }[];
    category: { name: string };
}

interface SearchBarProps {
    onClose: () => void;
}

export default function SearchBar({ onClose }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length > 1) {
                fetchResults();
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/products?search=${query}&per_page=5`);
            // API returns paginated data: { data: [...], ... }
            setResults(res.data.data || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/urunler?search=${query}`);
            onClose();
        }
    };

    return (
        <div className="absolute inset-x-0 top-0 bg-white z-50 shadow-lg border-b border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <form onSubmit={handleSearch} className="relative h-24 flex items-center">
                    <Search className="text-gray-400 mr-4" size={24} />
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 h-full text-lg outline-none placeholder:text-gray-300 font-light tracking-wide bg-transparent"
                        placeholder="Neyi arıyorsunuz? (Çanta, Cüzdan...)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />

                    {loading && (
                        <Loader2 className="animate-spin text-gray-400 mr-4" size={20} />
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="text-gray-500" size={24} />
                    </button>
                </form>

                {/* Suggestions Dropdown */}
                {(results.length > 0 || (query.length > 1 && !loading && results.length === 0)) && (
                    <div className="border-t border-gray-100 py-6 pb-8">
                        {results.length > 0 ? (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                    Sonuçlar
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {results.map(product => (
                                        <Link
                                            key={product.id}
                                            to={`/urunler/${product.slug}`}
                                            onClick={onClose}
                                            className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                                        >
                                            <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-100">
                                                {product.images?.[0] ? (
                                                    <img
                                                        src={String(product.images[0].image_path).startsWith('http')
                                                            ? product.images[0].image_path
                                                            : `http://localhost:8081/storage/${product.images[0].image_path}`}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <Search size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 group-hover:text-black transition-colors line-clamp-1">
                                                    {product.name}
                                                </h4>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    {parseFloat(product.price).toLocaleString('tr-TR')} ₺
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-50 flex justify-center">
                                    <button
                                        onClick={() => {
                                            navigate(`/urunler?search=${query}`);
                                            onClose();
                                        }}
                                        className="text-sm font-medium text-black hover:text-gray-600 flex items-center transition-colors"
                                    >
                                        Tüm {results.length}+ sonucu gör
                                        <ArrowRight size={16} className="ml-2" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>"{query}" ile ilgili sonuç bulunamadı.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Backdrop */}
            <div
                className="fixed inset-0 top-auto bg-black/20 backdrop-blur-sm z-[-1] h-[calc(100vh-6rem)]"
                onClick={onClose}
            ></div>
        </div>
    );
}
