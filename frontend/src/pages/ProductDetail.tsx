import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import api from '../lib/axios';

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    stock: number;
    images: { image_path: string, is_primary: boolean }[];
    category: { name: string; slug: string };
    links?: { site_name: string; url: string }[];
}

export default function ProductDetail() {
    const { slug } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState<string>('');
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const toggleAccordion = (section: string) => {
        setOpenAccordion(openAccordion === section ? null : section);
    };

    // Helper to get full image URL
    const getImageUrl = (path: string) => {
        return path.startsWith('http') ? path : path.replace('http://localhost:8081', '');
    };

    useEffect(() => {
        api.get(`/products/${slug}`)
            .then(res => {
                const p = res.data;
                setProduct(p);
                const primary = p.images.find((img: any) => img.is_primary) || p.images[0];
                if (primary) setMainImage(getImageUrl(primary.image_path));

                // Dynamic Title
                document.title = `${p.name} | Yumobag`;
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));

        return () => { document.title = 'Yumobag'; }; // Reset on unmount
    }, [slug]);

    // Lightbox Navigation
    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = '';
    };

    const goToPrev = () => {
        if (!product) return;
        setLightboxIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        if (!product) return;
        setLightboxIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!lightboxOpen) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'ArrowRight') goToNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, product]);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse text-gray-400 text-sm tracking-widest uppercase">Yükleniyor...</div>
        </div>
    );

    if (!product) return <div className="p-20 text-center text-gray-500">Ürün bulunamadı.</div>;

    // Find current main image index for lightbox
    const currentMainIndex = product.images.findIndex(img => getImageUrl(img.image_path) === mainImage);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Breadcrumb */}
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-8">
                <Link to="/" className="hover:text-black transition">Anasayfa</Link>
                <span className="mx-2">/</span>
                <Link to={`/urunler?kategori=${product.category?.slug || 'hepsi'}`} className="hover:text-black transition">{product.category?.name || 'Mağaza'}</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{product.name}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                {/* Left: Gallery */}
                <div className="space-y-4">
                    <div
                        className="aspect-w-3 aspect-h-4 bg-gray-100 rounded-sm overflow-hidden cursor-zoom-in"
                        onClick={() => openLightbox(currentMainIndex >= 0 ? currentMainIndex : 0)}
                    >
                        <img
                            src={mainImage || 'https://via.placeholder.com/600x800?text=No+Image'}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                    {product.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMainImage(getImageUrl(img.image_path))}
                                    className={`aspect-w-1 aspect-h-1 rounded-sm overflow-hidden border ${mainImage === getImageUrl(img.image_path) ? 'border-black' : 'border-transparent'} hover:border-gray-300 transition`}
                                >
                                    <img
                                        src={getImageUrl(img.image_path)}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Info */}
                <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
                        {product.category?.name}
                    </span>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">{product.name}</h1>
                    <p className="text-2xl font-medium text-gray-900 mb-8">{product.price} ₺</p>

                    <div className="prose prose-sm text-gray-600 mb-10 leading-relaxed">
                        <p>{product.description}</p>
                    </div>

                    <div className="space-y-4">
                        {/* Cart Functionality Removed */}
                        <div className="flex space-x-4">
                            <a
                                href="https://wa.me/905555555555" // Placeholder for WhatsApp or similar
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 bg-black text-white py-4 px-8 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition text-center"
                            >
                                Bilgi Al / Sipariş Ver
                            </a>
                        </div>
                        {product.stock > 0 && product.stock < 10 && (
                            <p className="text-xs text-red-600 font-medium">
                                Son {product.stock} ürün kaldı.
                            </p>
                        )}
                        {product.stock <= 0 && (
                            <p className="text-sm text-red-600 font-bold uppercase tracking-widest">
                                Tükendi
                            </p>
                        )}
                    </div>

                    {/* Additional Details Accordion / Info */}
                    <div className="border-t border-gray-100 mt-12 pt-8 space-y-4">
                        <div onClick={() => toggleAccordion('shipping')} className="flex justify-between items-center py-2 border-b border-gray-100 cursor-pointer">
                            <span className="text-sm font-medium uppercase tracking-wide">Kargo ve İade</span>
                            <span className="text-gray-400 transition transform duration-200" style={{ transform: openAccordion === 'shipping' ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                        </div>
                        {openAccordion === 'shipping' && (
                            <div className="text-sm text-gray-500 pb-4">
                                Tüm siparişleriniz 1-3 iş günü içerisinde kargoya verilir. İade işlemleriniz için ürün teslim alındıktan sonra 14 gün içerisinde iletişime geçebilirsiniz.
                            </div>
                        )}

                        <div onClick={() => toggleAccordion('links')} className="flex justify-between items-center py-2 border-b border-gray-100 cursor-pointer group">
                            <span className="text-sm font-medium uppercase tracking-wide group-hover:text-black transition">Satın Alma Linkleri</span>
                            <span className="text-gray-400 group-hover:text-black transition transform duration-200" style={{ transform: openAccordion === 'links' ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                        </div>
                        {openAccordion === 'links' && (
                            <div className="pt-4 pb-2 space-y-3">
                                {product.links && product.links.length > 0 ? (
                                    product.links.map((link: any, idx: number) => (
                                        <a href={link.url} target="_blank" rel="noreferrer" key={idx} className="flex items-center space-x-3 text-sm text-gray-600 hover:text-black transition group">
                                            <span className={`w-2 h-2 rounded-full group-hover:scale-125 transition ${link.site_name.toLowerCase().includes('whatsapp') ? 'bg-green-500' :
                                                link.site_name.toLowerCase().includes('shopier') ? 'bg-blue-500' :
                                                    link.site_name.toLowerCase().includes('dolap') ? 'bg-purple-500' : 'bg-gray-400'
                                                }`}></span>
                                            <span>{link.site_name}</span>
                                        </a>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 italic">Satın alma linki bulunamadı.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && product.images.length > 0 && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                    onClick={closeLightbox}
                >
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 text-white/70 hover:text-white transition z-10"
                    >
                        <X size={32} />
                    </button>

                    {/* Previous Button */}
                    {product.images.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition z-10"
                        >
                            <ChevronLeft size={28} />
                        </button>
                    )}

                    {/* Image */}
                    <div
                        className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={getImageUrl(product.images[lightboxIndex].image_path)}
                            alt={`${product.name} - ${lightboxIndex + 1}`}
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        />
                    </div>

                    {/* Next Button */}
                    {product.images.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); goToNext(); }}
                            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition z-10"
                        >
                            <ChevronRight size={28} />
                        </button>
                    )}

                    {/* Counter */}
                    {product.images.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
                            {lightboxIndex + 1} / {product.images.length}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
