import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/axios';
import ProductCard from '../components/ProductCard';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    category?: { name: string };
    images: { image_path: string, is_primary: boolean }[];
}

import { ChevronDown, Check } from 'lucide-react';

const SORT_OPTIONS = [
    { value: '', label: 'Önerilen' },
    { value: 'newest', label: 'En Yeniler' },
    { value: 'price_asc', label: 'Fiyat: Düşükten Yükseğe' },
    { value: 'price_desc', label: 'Fiyat: Yüksekten Düşüğe' },
];

function SortDropdown({ currentSort, onSortChange }: { currentSort: string, onSortChange: (val: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = SORT_OPTIONS.find(o => o.value === currentSort) || SORT_OPTIONS[0];

    return (
        <div className="relative group z-20">
            <button
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className="flex items-center gap-2 text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 px-4 py-2.5 rounded-full border border-gray-200 transition-all shadow-sm hover:shadow-md active:scale-95"
            >
                <span className="text-gray-500 font-normal">Sıralama:</span>
                <span>{selectedOption.label}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 transform origin-top-right transition-all duration-200 ease-out ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                {SORT_OPTIONS.map(option => (
                    <button
                        key={option.value}
                        onClick={() => {
                            onSortChange(option.value);
                            setIsOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center justify-between transition-colors ${currentSort === option.value ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                        {option.label}
                        {currentSort === option.value && <Check size={16} />}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const categorySlug = searchParams.get('kategori');
    const searchQuery = searchParams.get('search');
    const sort = searchParams.get('sort') || '';
    const [categoryName, setCategoryName] = useState<string>('');

    // Fetch category name when slug changes
    useEffect(() => {
        if (categorySlug) {
            api.get('/categories')
                .then(res => {
                    const cat = res.data.find((c: any) => c.slug === categorySlug);
                    if (cat) setCategoryName(cat.name);
                })
                .catch(console.error);
        } else {
            setCategoryName('');
        }
    }, [categorySlug]);

    // Reset when filters change
    useEffect(() => {
        setProducts([]);
        setPage(1);
        setHasMore(true);
        setLoading(true);
        fetchProducts(1, true);
    }, [categorySlug, searchQuery, sort]);

    const fetchProducts = (pageNum: number, isReset: boolean = false) => {
        const params: any = { page: pageNum };
        if (categorySlug) params.category_slug = categorySlug;
        if (searchQuery) params.search = searchQuery;
        if (sort) params.sort = sort;

        api.get('/products', { params })
            .then(res => {
                const newProducts = res.data.data;
                const lastPage = res.data.last_page;

                if (isReset) {
                    setProducts(newProducts);
                } else {
                    setProducts(prev => [...prev, ...newProducts]);
                }

                setHasMore(pageNum < lastPage);
            })
            .catch(err => console.error(err))
            .finally(() => {
                setLoading(false);
                setLoadingMore(false);
            });
    };

    // Infinite scroll handler
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop + 100 >= document.documentElement.offsetHeight) {
                if (!loadingMore && hasMore && !loading) {
                    setLoadingMore(true);
                    setPage(prev => {
                        const nextPage = prev + 1;
                        fetchProducts(nextPage);
                        return nextPage;
                    });
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadingMore, hasMore, loading, categorySlug, searchQuery, sort]);

    const handleSortChange = (val: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (val) {
            newParams.set('sort', val);
        } else {
            newParams.delete('sort');
        }
        setSearchParams(newParams);
    };

    if (loading && page === 1) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse text-gray-400 text-sm tracking-widest uppercase">Ürünler Yükleniyor...</div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-16">
                <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-widest mb-4">
                    {searchQuery ? `"${searchQuery}" için sonuçlar` : (categoryName ? categoryName.toLocaleUpperCase('tr-TR') : (categorySlug ? '' : 'Tüm Ürünler'))}
                </h1>
                <div className="w-12 h-1 bg-gray-200 mx-auto"></div>
                <p className="mt-4 text-gray-500 text-sm max-w-xl mx-auto">
                    El yapımı çantalar ve birinci sınıf aksesuarlardan oluşan koleksiyonumuzu inceleyin.
                </p>
            </div>

            {/* Toolbar */}
            <div className="flex justify-end mb-8 relative">
                <SortDropdown currentSort={sort} onSortChange={handleSortChange} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {loadingMore && (
                <div className="flex justify-center py-10">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                </div>
            )}

            {!hasMore && products.length > 0 && (
                <div className="text-center py-12 text-gray-400 text-xs tracking-widest uppercase">
                    Tüm ürünler görüntülendi
                </div>
            )}

            {products.length === 0 && !loading && (
                <div className="text-center py-20 text-gray-500">
                    Ürün bulunamadı.
                </div>
            )}
        </div>
    );
}
