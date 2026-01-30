import { Link } from 'react-router-dom';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    category?: { name: string };
    images: { image_path: string, is_primary: boolean }[];
}

export default function ProductCard({ product }: { product: Product }) {
    const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
    const imageUrl = primaryImage
        ? (primaryImage.image_path.startsWith('http') ? primaryImage.image_path : `http://localhost:8081${primaryImage.image_path}`)
        : 'https://via.placeholder.com/600x800?text=No+Image';

    return (
        <Link to={`/urunler/${product.slug}`} className="group block">
            <div className="relative overflow-hidden mb-3">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-[400px] object-cover transition duration-700 ease-in-out group-hover:scale-105"
                />
                {/* Optional: Add "Quick Add" or similar overlay on hover */}
            </div>

            <div className="text-center">
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide group-hover:text-gray-600 transition">
                    {product.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                    {product.category?.name}
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-2">
                    {parseFloat(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                </p>
            </div>
        </Link>
    );
}
