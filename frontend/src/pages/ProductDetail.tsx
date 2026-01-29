import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

    const toggleAccordion = (section: string) => {
        setOpenAccordion(openAccordion === section ? null : section);
    };

    useEffect(() => {
        api.get(`/products/${slug}`)
            .then(res => {
                const p = res.data;
                setProduct(p);
                const primary = p.images.find((img: any) => img.is_primary) || p.images[0];
                if (primary) setMainImage(primary.image_path.startsWith('http') ? primary.image_path : `http://localhost:8081${primary.image_path}`);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse text-gray-400 text-sm tracking-widest uppercase">Yükleniyor...</div>
        </div>
    );

    if (!product) return <div className="p-20 text-center text-gray-500">Ürün bulunamadı.</div>;

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
                    <div className="aspect-w-3 aspect-h-4 bg-gray-100 rounded-sm overflow-hidden">
                        <img
                            src={mainImage || 'https://via.placeholder.com/600x800?text=No+Image'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {product.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMainImage(img.image_path.startsWith('http') ? img.image_path : `http://localhost:8081${img.image_path}`)}
                                    className={`aspect-w-1 aspect-h-1 rounded-sm overflow-hidden border ${mainImage.includes(img.image_path) ? 'border-black' : 'border-transparent'} hover:border-gray-300 transition`}
                                >
                                    <img
                                        src={img.image_path.startsWith('http') ? img.image_path : `http://localhost:8081${img.image_path}`}
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
                    <p className="text-2xl font-medium text-gray-900 mb-8">${product.price}</p>

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
        </div>
    );
}
